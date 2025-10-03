import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Paystack signature
    const paystackSignature = req.headers.get("x-paystack-signature");
    const body = await req.text();
    
    const hash = createHmac("sha512", Deno.env.get("PAYSTACK_SECRET_KEY") || "")
      .update(body)
      .digest("hex");

    if (hash !== paystackSignature) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event, "Reference:", event.data?.reference);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.event) {
      case "charge.success": {
        const reference = event.data.reference;
        const amount = event.data.amount;
        const status = event.data.status;

        console.log(`Payment successful: ${reference}, Amount: ${amount}, Status: ${status}`);

        // Update order status
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference", reference)
          .select()
          .single();

        if (orderError) {
          console.error("Error updating order:", orderError);
          throw new Error("Failed to update order");
        }

        console.log("Order updated successfully:", order.order_number);
        break;
      }

      case "charge.failed": {
        const reference = event.data.reference;
        console.log(`Payment failed: ${reference}`);

        // Update order status to failed
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference", reference);

        if (orderError) {
          console.error("Error updating failed order:", orderError);
        }
        break;
      }

      case "refund.processed": {
        const reference = event.data.reference;
        const refundAmount = event.data.amount;
        console.log(`Refund processed: ${reference}, Amount: ${refundAmount}`);

        // Update order status
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            payment_status: "refunded",
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference", reference);

        if (orderError) {
          console.error("Error updating refunded order:", orderError);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
