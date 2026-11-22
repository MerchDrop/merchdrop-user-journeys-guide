// Shared order lifecycle logic for process-payment, paystack-webhook and update-order-status.
// Status list must match src/lib/orderStatus.ts and the orders_status_check constraint.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const STATUS_LABELS: Record<string, string> = {
  payment_pending: "Payment pending",
  payment_failed: "Payment failed",
  payment_received: "Payment received",
  processing: "Order processing",
  ready_for_pickup: "Ready for pickup by carrier",
  assigned_to_carrier: "Shipped",
  picked_up: "Picked up by carrier",
  on_the_way: "On its way",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// The normal path, in order.
export const FLOW = [
  "payment_received", "processing", "ready_for_pickup", "assigned_to_carrier",
  "picked_up", "on_the_way", "delivered", "completed",
];

// Statuses that email the customer when reached going forward.
export const EMAILED = new Set([
  "payment_received", "assigned_to_carrier", "on_the_way", "delivered",
  "payment_failed", "cancelled", "refunded",
]);

const SITE_URL = (Deno.env.get("SITE_URL") || "https://merchdrop.live").replace(/\/$/, "");

// deno-lint-ignore no-explicit-any
export type Order = Record<string, any>;

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

export function orderViewUrl(order: Order): string {
  return `${SITE_URL}/order/${order.id}?token=${order.view_token}`;
}

/** Move an order to `to` only if it is still in `order.status` (optimistic lock), and log it. */
export async function setStatus(
  sb: SupabaseClient,
  order: Order,
  to: string,
  opts: { byId?: string | null; byName?: string; patch?: Record<string, unknown> } = {},
): Promise<Order | null> {
  const { data, error } = await sb
    .from("orders")
    .update({ ...opts.patch, status: to, updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", order.status)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Order update failed: ${error.message}`);
  if (!data) return null; // someone else moved it first

  const { error: logError } = await sb.from("order_status_history").insert({
    order_id: order.id,
    from_status: order.status,
    to_status: to,
    changed_by: opts.byId ?? null,
    changed_by_name: opts.byName ?? "system",
  });
  if (logError) console.error("Status history insert failed:", order.id, logError.message);
  return data;
}

/** Find or create the account for this order's email. New accounts get no password. */
async function ensureAccount(sb: SupabaseClient, order: Order): Promise<{ userId: string; created: boolean }> {
  if (order.user_id) return { userId: order.user_id, created: false };

  const email = String(order.customer_email).toLowerCase();
  const findProfile = async () =>
    (await sb.from("profiles").select("id").ilike("email", email).maybeSingle()).data?.id as string | undefined;

  const existing = await findProfile();
  if (existing) return { userId: existing, created: false };

  const addr = order.shipping_address ?? {};
  const { data, error } = await sb.auth.admin.createUser({
    email,
    email_confirm: true, // they proved the address by paying with it; password is set via emailed link
    user_metadata: {
      first_name: addr.firstName ?? null,
      last_name: addr.lastName ?? null,
      display_name: [addr.firstName, addr.lastName].filter(Boolean).join(" ") || email,
    },
  });
  if (data?.user) return { userId: data.user.id, created: true };

  // Webhook and browser verify can race; the loser finds the account the winner made.
  const raced = await findProfile();
  if (raced) return { userId: raced, created: false };
  throw new Error(`Account creation failed: ${error?.message}`);
}

async function setPasswordLink(sb: SupabaseClient, email: string): Promise<string | null> {
  const { data, error } = await sb.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${SITE_URL}/reset-password` },
  });
  if (error) {
    console.error("Set-password link failed:", error.message);
    return null;
  }
  return data.properties?.action_link ?? null;
}

export type PaidResult = { order: Order; accountCreated: boolean };

/**
 * Confirm payment for the order with this reference. Idempotent: the webhook and the
 * browser's verify call both land here; only the first one creates the account and emails.
 */
export async function markOrderPaid(
  sb: SupabaseClient,
  reference: string,
  amountPaidKobo: number | null,
): Promise<PaidResult | null> {
  const { data: order } = await sb.from("orders").select("*").eq("payment_reference", reference).maybeSingle();
  if (!order) return null;
  if (!["payment_pending", "payment_failed"].includes(order.status)) {
    return { order, accountCreated: false };
  }

  if (amountPaidKobo !== null && amountPaidKobo < Math.round(Number(order.total_amount) * 100)) {
    console.error("Underpayment", reference, amountPaidKobo, order.total_amount);
    await sb.from("orders").update({ needs_attention: true }).eq("id", order.id);
    return null;
  }

  const account = await ensureAccount(sb, order);
  const updated = await setStatus(sb, order, "payment_received", {
    patch: { payment_status: "paid", paid_at: new Date().toISOString(), user_id: account.userId },
  });
  if (!updated) {
    const { data: current } = await sb.from("orders").select("*").eq("id", order.id).single();
    return { order: current, accountCreated: false };
  }

  const link = account.created ? await setPasswordLink(sb, updated.customer_email) : null;
  await sendStatusEmail(sb, updated, { setPasswordLink: link });
  return { order: updated, accountCreated: account.created };
}

// ---------------------------------------------------------------------------
// Emails

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const money = (n: unknown, currency = "NGN") => {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(n) || 0);
  } catch {
    return `${currency} ${Number(n || 0).toFixed(2)}`;
  }
};

function intro(order: Order, extras: { setPasswordLink?: string | null; refundedAmount?: number }): string {
  const name = esc(order.shipping_address?.firstName || "there");
  switch (order.status) {
    case "payment_received":
      return `<p>Hi ${name}, thank you for shopping with MerchDrop!</p>
        <p>We've received your payment. Your order is being processed, and we'll email you as it moves along.</p>
        ${extras.setPasswordLink ? `<p>We've created a MerchDrop account for you so you can track this and future orders.
          <a href="${esc(extras.setPasswordLink)}">Set your password</a> (link expires soon; you can always use "Forgot password" on the sign-in page).</p>` : ""}`;
    case "assigned_to_carrier":
      return `<p>Hi ${name}, your order has shipped.</p>
        <p>Carrier: <strong>${esc(order.carrier_name)}</strong><br>Tracking number: <strong>${esc(order.tracking_number)}</strong></p>`;
    case "on_the_way":
      return `<p>Hi ${name}, your order is on its way to you.</p>${order.tracking_number
        ? `<p>Carrier: ${esc(order.carrier_name)} · Tracking: ${esc(order.tracking_number)}</p>` : ""}`;
    case "delivered":
      return `<p>Hi ${name}, your order has been delivered. We hope you love it!</p>`;
    case "payment_failed":
      return `<p>Hi ${name}, your payment didn't go through, so this order hasn't been placed.</p>
        <p>You can try again from your cart at <a href="${SITE_URL}/cart">${SITE_URL.replace(/^https?:\/\//, "")}/cart</a>.</p>`;
    case "cancelled":
      return `<p>Hi ${name}, your order has been cancelled. If you have questions, reply to this email.</p>`;
    case "refunded":
      return `<p>Hi ${name}, we've refunded <strong>${money(extras.refundedAmount ?? order.total_amount, order.currency)}</strong> for this order.
        It can take a few business days to appear on your statement.</p>`;
    default:
      return `<p>Hi ${name}, your order status is now: <strong>${esc(STATUS_LABELS[order.status])}</strong>.</p>`;
  }
}

/** Email the customer about the order's current status. Never throws: a failed email must not undo a status change. */
export async function sendStatusEmail(
  sb: SupabaseClient,
  order: Order,
  extras: { setPasswordLink?: string | null; refundedAmount?: number } = {},
): Promise<void> {
  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey || !order.customer_email) {
      console.error("Status email skipped (missing RESEND_API_KEY or email)", order.id);
      return;
    }

    const { data: items } = await sb
      .from("order_items")
      .select("quantity, total_price, product_variant, products(title)")
      .eq("order_id", order.id);

    const rows = (items ?? []).map((i: Order) => {
      const v = i.product_variant ?? {};
      const variant = [v.color, v.size].filter(Boolean).map(esc).join(" / ");
      return `<tr><td style="padding:6px 0">${esc(i.products?.title ?? "Item")}${variant ? ` <span style="color:#666">(${variant})</span>` : ""} × ${i.quantity}</td>
        <td style="padding:6px 0;text-align:right">${money(i.total_price, order.currency)}</td></tr>`;
    }).join("");

    const label = STATUS_LABELS[order.status] ?? order.status;
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111">
      <h2 style="margin-bottom:4px">${esc(label)}</h2>
      <p style="color:#666;margin-top:0">Order ${esc(order.order_number)}</p>
      ${intro(order, extras)}
      <table style="width:100%;border-top:1px solid #eee;margin-top:16px">${rows}
        <tr><td style="padding:8px 0;border-top:1px solid #eee"><strong>Total</strong></td>
        <td style="padding:8px 0;border-top:1px solid #eee;text-align:right"><strong>${money(order.total_amount, order.currency)}</strong></td></tr>
      </table>
      <p style="margin-top:24px"><a href="${orderViewUrl(order)}" style="background:#111;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px">View your order</a></p>
    </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("ORDER_EMAIL_FROM") || "MerchDrop <onboarding@resend.dev>",
        to: [order.customer_email],
        subject: `Order ${order.order_number}: ${label}`,
        html,
      }),
    });
    if (!res.ok) console.error("Resend error", order.id, res.status, await res.text());
  } catch (e) {
    console.error("Status email failed", order.id, e);
  }
}
