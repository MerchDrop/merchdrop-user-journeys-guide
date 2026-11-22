// Called by pg_cron every 10 minutes (see migration 20261122130000_growth_features.sql).
//   - Abandoned checkout: one "complete your order" email 1–24 hours after an unpaid order was created.
//   - Review request: one email 3 days after delivery (skipped for orders delivered over 30 days ago).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, sendStatusEmail } from "../_shared/orders.ts";

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

serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return new Response("Unauthorized", { status: 401 });
  try {
    const sb = adminClient();
    const result = { abandoned: await abandonedCheckouts(sb), reviews: await reviewRequests(sb) };
    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("order-reminders failed", e);
    return new Response("Error", { status: 500 });
  }
});
