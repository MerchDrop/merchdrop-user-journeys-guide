import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, email, reference, items, shippingAddress } = await req.json();

    // Validate Paystack payment using the payment reference
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    // Create Supabase client with service role for bypassing RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user if authenticated
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data } = await authClient.auth.getUser(token);
      userId = data.user?.id || null;
    }

    // Generate order number
    const orderNumber = `MD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Calculate amounts in cents
    const subtotalCents = Math.round(paystackData.data.amount);
    const shippingCents = subtotalCents >= 5000 ? 0 : 899; // Free shipping over $50
    const taxCents = Math.round(subtotalCents * 0.08);
    const totalCents = subtotalCents + shippingCents + taxCents;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        subtotal: subtotalCents / 100,
        shipping_cost: shippingCents / 100,
        tax_amount: taxCents / 100,
        total_amount: totalCents / 100,
        currency: currency.toUpperCase(),
        status: "confirmed",
        payment_status: "paid",
        payment_provider: "paystack",
        payment_reference: reference,
        shipping_address: shippingAddress,
        billing_address: shippingAddress
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      artist_id: item.artistId,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      product_variant: {
        size: item.size,
        color: item.color
      }
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      throw new Error("Failed to create order items");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        orderNumber: order.order_number
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Process payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});