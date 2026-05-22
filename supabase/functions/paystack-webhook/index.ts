import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const JSON_HEADERS = { "Content-Type": "application/json" };

// Webhook is server-to-server — no CORS headers needed.
serve(async (req) => {
  // Reject browser preflight; Paystack never sends OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 405 });
  }

  try {
    const paystackSignature = req.headers.get("x-paystack-signature");
    const body = await req.text();

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const hash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (hash !== paystackSignature) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: JSON_HEADERS }
      );
    }

    const event = JSON.parse(body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.event) {
      case "charge.success": {
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference", event.data.reference);

        if (orderError) throw new Error("Failed to update order");
        break;
      }

      case "charge.failed": {
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference", event.data.reference);

        if (orderError) console.error("Error updating failed order:", orderError);
        break;
      }

      case "refund.processed": {
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            payment_status: "refunded",
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference", event.data.reference);

        if (orderError) console.error("Error updating refunded order:", orderError);
        break;
      }

      default:
        // Unknown event — acknowledge receipt without error
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: JSON_HEADERS,
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
