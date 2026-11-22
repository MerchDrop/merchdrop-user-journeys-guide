// Paystack webhook: the source of truth for payment outcomes, so closing the tab after paying
// can't lose an order. Server-to-server only; no CORS.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, markOrderPaid, sendStatusEmail, setStatus } from "../_shared/orders.ts";

const JSON_HEADERS = { "Content-Type": "application/json" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

async function hmacSha512Hex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY missing; cannot verify webhook");
    return reply({ error: "Not configured" }, 503);
  }

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  if (!timingSafeEqual(await hmacSha512Hex(secret, body), signature)) {
    return reply({ error: "Invalid signature" }, 401);
  }

  try {
    const event = JSON.parse(body);
    const sb = adminClient();

    switch (event.event) {
      case "charge.success": {
        // A null result means unknown reference or underpayment (flagged for admin); nothing to retry.
        await markOrderPaid(sb, event.data.reference, Number(event.data.amount));
        break;
      }

      case "charge.failed": {
        const { data: order } = await sb.from("orders").select("*")
          .eq("payment_reference", event.data.reference).maybeSingle();
        if (order?.status === "payment_pending") {
          const updated = await setStatus(sb, order, "payment_failed", { patch: { payment_status: "failed" } });
          if (updated) await sendStatusEmail(sb, updated);
        }
        break;
      }

      case "refund.processed": {
        const reference = event.data.transaction_reference ?? event.data.transaction?.reference ?? event.data.reference;
        const { data: order } = await sb.from("orders").select("*").eq("payment_reference", reference).maybeSingle();
        if (order && order.status !== "refunded") {
          const updated = await setStatus(sb, order, "refunded", { patch: { payment_status: "refunded" } });
          if (updated) await sendStatusEmail(sb, updated, { refundedAmount: Number(event.data.amount) / 100 || undefined });
        }
        break;
      }
    }

    return reply({ received: true });
  } catch (error) {
    // 500 makes Paystack retry; every handler above is safe to run twice.
    console.error("Webhook processing error:", error);
    return reply({ error: "Processing failed" }, 500);
  }
});
