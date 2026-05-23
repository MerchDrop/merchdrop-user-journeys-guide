import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN");
if (!ALLOWED_ORIGIN) {
  console.error("ALLOWED_ORIGIN env var is not set — CORS will be misconfigured");
}
const corsOrigin = ALLOWED_ORIGIN ?? "null";

const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = authData.user.id;

    const { currency, reference, items, shippingAddress } = await req.json();

    if (!reference || typeof reference !== "string") {
      return new Response(JSON.stringify({ error: "Invalid reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client (bypasses RLS, runs trigger as service_role)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Idempotency: if reference already processed, return existing order
    const { data: existing } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          success: true,
          orderId: existing.id,
          orderNumber: existing.order_number,
          duplicate: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify Paystack payment
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}` } }
    );
    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data?.status !== "success") {
      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderNumber = `MD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const subtotalCents = Math.round(paystackData.data.amount);
    const shippingCents = subtotalCents >= 5000 ? 0 : 899;
    const taxCents = Math.round(subtotalCents * 0.08);
    const totalCents = subtotalCents + shippingCents + taxCents;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        subtotal: subtotalCents / 100,
        shipping_cost: shippingCents / 100,
        tax_amount: taxCents / 100,
        total_amount: totalCents / 100,
        currency: (currency || "USD").toUpperCase(),
        status: "confirmed",
        payment_status: "paid",
        payment_provider: "paystack",
        payment_reference: reference,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError) {
      // Race-condition safety: if unique violation, fetch and return
      if ((orderError as any).code === "23505") {
        const { data: dup } = await supabase
          .from("orders")
          .select("id, order_number")
          .eq("payment_reference", reference)
          .single();
        if (dup) {
          return new Response(
            JSON.stringify({
              success: true,
              orderId: dup.id,
              orderNumber: dup.order_number,
              duplicate: true,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    const orderItems = (Array.isArray(items) ? items : []).map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      artist_id: item.artistId,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      product_variant: { size: item.size, color: item.color },
    }));

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        throw new Error("Failed to create order items");
      }
    }

    return new Response(
      JSON.stringify({ success: true, orderId: order.id, orderNumber: order.order_number }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process payment error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
