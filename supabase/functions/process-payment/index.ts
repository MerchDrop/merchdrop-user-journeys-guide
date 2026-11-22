// Checkout API.
//   action "create": price the cart on the server and store a Payment pending order. Returns the
//                    Paystack reference and amount to charge.
//   action "verify": after Paystack's popup succeeds, confirm with Paystack and mark the order paid.
//                    The webhook does the same thing; whichever arrives first wins (see markOrderPaid).
//   action "check_coupon": preview a coupon at checkout (the server re-checks it on "create").
//   action "resume": new Paystack reference for an unpaid/failed order, opened from its order page.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { adminClient, markOrderPaid } from "../_shared/orders.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const TAX_RATE = 0.075;
const MAX_QTY = 100;
// Fallback when platform_settings has no shipping_axes row; mirrors DEFAULT_SHIPPING_AXES in src/config/shipping.ts.
const DEFAULT_SHIPPING_FEES: Record<string, number> = {
  "axis-1": 3000, "axis-2": 5000, "axis-3": 8000, "axis-4": 10000, "axis-5": 7000, "axis-other": 0,
};

const randomCode = (len: number) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  return Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) => alphabet[b % alphabet.length]).join("");
};

type Coupon = { code: string; type: "percentage" | "fixed"; value: number; min_spend: number };

/** A usable coupon, or an error message for the customer. */
async function findCoupon(sb: ReturnType<typeof adminClient>, raw: unknown): Promise<Coupon | string> {
  const code = String(raw ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return "That code isn't valid";
  const { data: c } = await sb.from("coupons").select("*").eq("code", code).maybeSingle();
  if (!c || !c.active) return "That code isn't valid";
  if (c.expires_at && Date.parse(c.expires_at) < Date.now()) return "That code has expired";
  if (c.usage_limit !== null && c.used_count >= c.usage_limit) return "That code has been fully used";
  return { code: c.code, type: c.type, value: Number(c.value), min_spend: Number(c.min_spend) };
}

const discountFor = (c: Coupon, subtotal: number) =>
  Math.min(subtotal, Math.round((c.type === "percentage" ? subtotal * c.value / 100 : c.value) * 100) / 100);

async function signedInUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const client = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
  const { data } = await client.auth.getUser(auth.slice(7));
  return data?.user?.id ?? null; // the anon key is also a Bearer token; getUser returns no user for it
}

// deno-lint-ignore no-explicit-any
async function createOrder(req: Request, body: any) {
  const sb = adminClient();
  const email = String(body.email ?? "").trim().toLowerCase();
  const addr = body.shippingAddress ?? {};
  const items = Array.isArray(body.items) ? body.items : [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "A valid email is required" }, 400);
  if (!addr.firstName || !addr.lastName || !addr.address) return json({ error: "Delivery details are incomplete" }, 400);
  if (items.length === 0 || items.length > 50) return json({ error: "Cart is empty" }, 400);

  // Prices come from the database, never from the browser.
  const ids = [...new Set(items.map((i: { productId: string }) => i.productId))];
  const { data: products, error: productError } = await sb
    .from("products").select("id, title, price_cents, artist_id, status, stock, drop_at").in("id", ids);
  if (productError) throw new Error(productError.message);
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const lines = [];
  for (const i of items) {
    const p = byId.get(i.productId);
    const qty = Math.floor(Number(i.quantity));
    if (!p || p.status !== "published" || !p.artist_id) return json({ error: "An item in your cart is no longer available" }, 400);
    if (!(qty >= 1 && qty <= MAX_QTY)) return json({ error: "Invalid quantity" }, 400);
    if (p.drop_at && Date.parse(p.drop_at) > Date.now()) return json({ error: `${p.title} isn't available yet` }, 400);
    const wanted = items.filter((x: { productId: string }) => x.productId === p.id)
      .reduce((n: number, x: { quantity: number }) => n + Math.floor(Number(x.quantity)), 0);
    if (p.stock !== null && wanted > p.stock) {
      return json({ error: p.stock > 0 ? `Only ${p.stock} of ${p.title} left` : `${p.title} is sold out` }, 400);
    }
    const unit = p.price_cents / 100;
    lines.push({
      product_id: p.id, artist_id: p.artist_id, quantity: qty, unit_price: unit, total_price: unit * qty,
      product_variant: { size: i.size ?? null, color: i.color ?? null },
    });
  }

  const { data: setting } = await sb.from("platform_settings").select("value").eq("key", "shipping_axes").maybeSingle();
  const axes: { id: string; feeNGN: number; isCustomQuote?: boolean; name?: string; areas?: string }[] =
    Array.isArray(setting?.value) && setting.value.length
      ? setting.value
      : Object.entries(DEFAULT_SHIPPING_FEES).map(([id, feeNGN]) => ({ id, feeNGN, isCustomQuote: id === "axis-other" }));
  const axis = axes.find((a) => a.id === body.shippingAxisId);
  if (!axis) return json({ error: "Choose a delivery location" }, 400);

  const subtotal = lines.reduce((s, l) => s + l.total_price, 0);
  let coupon: Coupon | null = null;
  if (body.couponCode) {
    const found = await findCoupon(sb, body.couponCode);
    if (typeof found === "string") return json({ error: found }, 400);
    if (subtotal < found.min_spend) return json({ error: "Your order doesn't meet that code's minimum spend" }, 400);
    coupon = found;
  }
  const discount = coupon ? discountFor(coupon, subtotal) : 0;
  const shipping = axis.isCustomQuote ? 0 : Number(axis.feeNGN) || 0;
  const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

  const shippingAddress = {
    firstName: addr.firstName, lastName: addr.lastName, email, address: addr.address,
    city: addr.city ?? "", state: addr.state ?? "", zipCode: addr.zipCode ?? "", country: addr.country ?? "",
    shippingAxis: axis.name ?? axis.id, shippingAreas: axis.areas ?? "", shippingFeeNGN: shipping,
    isCustomQuote: Boolean(axis.isCustomQuote),
  };

  const reference = `MD-${Date.now()}-${randomCode(6)}`;
  const { data: order, error } = await sb.from("orders").insert({
    user_id: await signedInUserId(req),
    customer_email: email,
    order_number: `MD-${randomCode(8)}`,
    subtotal, shipping_cost: shipping, tax_amount: tax, total_amount: total,
    discount_amount: discount, coupon_code: coupon?.code ?? null,
    currency: "NGN", status: "payment_pending", payment_status: "pending",
    payment_provider: "paystack", payment_reference: reference,
    shipping_address: shippingAddress, billing_address: shippingAddress,
  }).select("id, order_number").single();
  if (error) throw new Error(`Order insert failed: ${error.message}`);

  const { error: itemsError } = await sb.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsError) {
    await sb.from("orders").delete().eq("id", order.id);
    throw new Error(`Order items insert failed: ${itemsError.message}`);
  }
  await sb.from("order_status_history").insert({ order_id: order.id, to_status: "payment_pending" });

  return json({ reference, orderNumber: order.order_number, amountKobo: Math.round(total * 100) });
}

// deno-lint-ignore no-explicit-any
async function checkCoupon(body: any) {
  const found = await findCoupon(adminClient(), body.code);
  if (typeof found === "string") return json({ error: found }, 400);
  return json({ code: found.code, type: found.type, value: found.value, minSpend: found.min_spend });
}

/** Start a fresh payment attempt for an unpaid order. Needs the order's view token or its signed-in owner. */
// deno-lint-ignore no-explicit-any
async function resumeOrder(req: Request, body: any) {
  const sb = adminClient();
  const { data: order } = await sb.from("orders").select("*").eq("id", String(body.orderId ?? "")).maybeSingle();
  const allowed = order && (order.view_token === body.token || (order.user_id && order.user_id === await signedInUserId(req)));
  if (!allowed) return json({ error: "Order not found" }, 404);
  if (!["payment_pending", "payment_failed"].includes(order.status)) return json({ error: "This order is already paid" }, 409);

  const { data: items } = await sb.from("order_items").select("quantity, products(title, status, stock)").eq("order_id", order.id);
  // deno-lint-ignore no-explicit-any
  for (const i of (items ?? []) as any[]) {
    if (i.products?.status !== "published") return json({ error: "An item in this order is no longer available" }, 400);
    if (i.products.stock !== null && i.quantity > i.products.stock) return json({ error: `${i.products.title} is sold out` }, 400);
  }

  const reference = `MD-${Date.now()}-${randomCode(6)}`;
  const { data: updated } = await sb.from("orders")
    .update({ payment_reference: reference, status: "payment_pending", payment_status: "pending" })
    .eq("id", order.id).eq("status", order.status).select("id").maybeSingle();
  if (!updated) return json({ error: "This order changed, please refresh" }, 409);
  if (order.status === "payment_failed") {
    await sb.from("order_status_history").insert({ order_id: order.id, from_status: "payment_failed", to_status: "payment_pending" });
  }
  return json({ reference, email: order.customer_email, amountKobo: Math.round(Number(order.total_amount) * 100) });
}

// deno-lint-ignore no-explicit-any
async function verifyOrder(body: any) {
  const reference = String(body.reference ?? "");
  if (!/^MD-\d+-[A-Z0-9]{6}$/.test(reference)) return json({ error: "Invalid reference" }, 400);

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  let amountKobo: number | null = null;
  if (secret) {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const paystack = await res.json();
    if (!paystack.status || paystack.data?.status !== "success") return json({ error: "Payment not confirmed" }, 402);
    amountKobo = Number(paystack.data.amount);
  } else if (Deno.env.get("ALLOW_TEST_PAYMENTS") !== "true") {
    console.error("PAYSTACK_SECRET_KEY missing; refusing to confirm payment", reference);
    return json({ error: "Payments are not configured" }, 503);
  }

  const result = await markOrderPaid(adminClient(), reference, amountKobo);
  if (!result) return json({ error: "Order not found or amount mismatch" }, 409);

  const o = result.order;
  return json({
    orderId: o.id,
    orderNumber: o.order_number,
    viewToken: o.view_token,
    status: o.status,
    accountCreated: result.accountCreated,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    if (body.action === "create") return await createOrder(req, body);
    if (body.action === "verify") return await verifyOrder(body);
    if (body.action === "check_coupon") return await checkCoupon(body);
    if (body.action === "resume") return await resumeOrder(req, body);
    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("process-payment error:", error);
    return json({ error: "Something went wrong with your order. If you were charged, contact support with your payment reference." }, 500);
  }
});
