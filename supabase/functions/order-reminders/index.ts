// Called by pg_cron every 10 minutes (see migration 20261122130000_growth_features.sql).
//   - Abandoned checkout: one "complete your order" email 1–24 hours after an unpaid order was created.
//   - Review request: one email 3 days after delivery (skipped for orders delivered over 30 days ago).
//   - Wishlist alerts: restock / price drop (queued by a DB trigger) and drop-live, emailed to everyone who saved it.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, escapeHtml, formatMoney, sendBatchEmails, sendStatusEmail, SITE_URL } from "../_shared/orders.ts";

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const BATCH = 50;

type Sb = ReturnType<typeof adminClient>;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

/** Mark the order first so overlapping runs can't email twice; send only if we won the claim. */
// deno-lint-ignore no-explicit-any
async function claim(sb: Sb, id: string, column: string): Promise<any | null> {
  const { data } = await sb.from("orders").update({ [column]: new Date().toISOString() })
    .eq("id", id).is(column, null).select("*").maybeSingle();
  return data;
}

async function abandonedCheckouts(sb: Sb) {
  const { data } = await sb.from("orders").select("id")
    .eq("status", "payment_pending").is("reminder_sent_at", null)
    .lte("created_at", iso(HOUR)).gte("created_at", iso(DAY)).limit(BATCH);
  let sent = 0;
  for (const { id } of data ?? []) {
    const order = await claim(sb, id, "reminder_sent_at");
    if (!order) continue;
    const name = order.shipping_address?.firstName || "there";
    if (await sendStatusEmail(sb, order, { custom: {
      subject: "You left something behind",
      heading: "Your order is waiting",
      body: `<p>Hi ${name.replace(/[<>&"']/g, "")}, you didn't finish checking out. Your items are saved, and you can complete payment in one step.</p>`,
      button: "Complete your order",
    } })) sent++;
  }
  return sent;
}

async function reviewRequests(sb: Sb) {
  const { data } = await sb.from("orders").select("id")
    .in("status", ["delivered", "completed"]).is("review_requested_at", null)
    .lte("delivered_at", iso(3 * DAY)).gte("delivered_at", iso(30 * DAY)).limit(BATCH);
  let sent = 0;
  for (const { id } of data ?? []) {
    const order = await claim(sb, id, "review_requested_at");
    if (!order) continue;
    const name = order.shipping_address?.firstName || "there";
    if (await sendStatusEmail(sb, order, { custom: {
      subject: "How's your new merch?",
      heading: "How did we do?",
      body: `<p>Hi ${name.replace(/[<>&"']/g, "")}, we hope you're enjoying your order. A quick review helps the artist and other fans. It takes under a minute.</p>`,
      button: "Leave a review",
    } })) sent++;
  }
  return sent;
}

const ALERT_COPY: Record<string, (title: string, price: string, oldPrice: string) => { subject: string; line: string }> = {
  restock: (t) => ({ subject: `${t} is back in stock`, line: `<strong>${t}</strong> is back in stock. Popular items go fast.` }),
  price_drop: (t, p, old) => ({ subject: `Price drop: ${t}`, line: `<strong>${t}</strong> dropped from ${old} to <strong>${p}</strong>.` }),
  drop_live: (t) => ({ subject: `${t} just dropped`, line: `<strong>${t}</strong> is live now. Get yours before it sells out.` }),
};

async function wishlistAlerts(sb: Sb) {
  // Drops that opened in the last day and haven't been announced: claim, then queue.
  const { data: opened } = await sb.from("products").update({ drop_alerted_at: new Date().toISOString() })
    .eq("status", "published").is("drop_alerted_at", null)
    .lte("drop_at", new Date().toISOString()).gte("drop_at", iso(DAY)).select("id");
  if (opened?.length) await sb.from("wishlist_alerts").insert(opened.map((p) => ({ product_id: p.id, kind: "drop_live" })));

  // Claim a batch of unsent alerts so overlapping runs can't double-send.
  const { data: pending } = await sb.from("wishlist_alerts").select("id").is("sent_at", null).limit(20);
  if (!pending?.length) return 0;
  const { data: alerts } = await sb.from("wishlist_alerts").update({ sent_at: new Date().toISOString() })
    .in("id", pending.map((a) => a.id)).is("sent_at", null)
    .select("kind, old_price_cents, products(id, title, slug, price_cents, main_image_url, status)");

  const emails: { to: string; subject: string; html: string }[] = [];
  // deno-lint-ignore no-explicit-any
  for (const alert of (alerts ?? []) as any[]) {
    const p = alert.products;
    if (!p || p.status !== "published") continue;
    const { data: saved } = await sb.from("wishlists").select("user_id").eq("product_id", p.id);
    const ids = (saved ?? []).map((w) => w.user_id);
    const { data: savers } = ids.length ? await sb.from("profiles").select("email").in("id", ids) : { data: [] };
    const title = escapeHtml(p.title);
    const copy = ALERT_COPY[alert.kind](title, formatMoney(p.price_cents / 100), formatMoney((alert.old_price_cents ?? 0) / 100));
    const link = `${SITE_URL}/product/${encodeURIComponent(p.slug || p.id)}`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111">
      ${p.main_image_url ? `<img src="${escapeHtml(p.main_image_url)}" alt="" width="240" style="border-radius:8px">` : ""}
      <p>${copy.line}</p>
      <p style="margin-top:24px"><a href="${link}" style="background:#111;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px">Shop now</a></p>
      <p style="color:#666;font-size:12px;margin-top:24px">You're getting this because you saved this item on MerchDrop. Remove it from your wishlist to stop these emails.</p>
    </div>`;
    // deno-lint-ignore no-explicit-any
    for (const s of (savers ?? []) as any[]) {
      if (s.email) emails.push({ to: s.email, subject: copy.subject, html });
    }
  }
  return await sendBatchEmails(emails);
}

serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return new Response("Unauthorized", { status: 401 });
  try {
    const sb = adminClient();
    const result = {
      abandoned: await abandonedCheckouts(sb),
      reviews: await reviewRequests(sb),
      wishlist: await wishlistAlerts(sb),
    };
    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("order-reminders failed", e);
    return new Response("Error", { status: 500 });
  }
});
