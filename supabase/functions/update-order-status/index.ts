// Admin: change an order's fulfillment status. Forward moves to an emailed status notify the
// customer; moving backwards is a correction and never emails. Every change is logged with the admin's name.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { adminClient, EMAILED, FLOW, sendStatusEmail, setStatus } from "../_shared/orders.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Admin can set any flow status from Order processing on, except Completed (automatic), plus Cancelled.
const ADMIN_TARGETS = new Set([...FLOW.slice(1, -1), "cancelled"]);
const CANCEL_BEFORE = FLOW.indexOf("picked_up");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await userClient.auth.getUser(auth.replace("Bearer ", ""));
    const { data: isAdmin } = await userClient.rpc("is_admin");
    if (!userData?.user || isAdmin !== true) return json({ error: "Forbidden" }, 403);

    const { orderId, status, carrierName, trackingNumber } = await req.json();
    if (!ADMIN_TARGETS.has(status)) return json({ error: "That status can't be set manually" }, 400);

    const sb = adminClient();
    const { data: order } = await sb.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!order) return json({ error: "Order not found" }, 404);
    if (order.status === status) return json({ order, emailed: false });

    const from = FLOW.indexOf(order.status);
    if (from < 0) return json({ error: `Orders in "${order.status}" can't be changed` }, 409);

    const patch: Record<string, unknown> = { needs_attention: false };
    const forward = status === "cancelled" || FLOW.indexOf(status) > from;

    if (status === "cancelled" && from >= CANCEL_BEFORE) {
      return json({ error: "The carrier already has this order; it can't be cancelled" }, 409);
    }
    if (status === "assigned_to_carrier" || carrierName || trackingNumber) {
      const carrier = String(carrierName ?? order.carrier_name ?? "").trim();
      const tracking = String(trackingNumber ?? order.tracking_number ?? "").trim();
      if (status === "assigned_to_carrier" && (!carrier || !tracking)) {
        return json({ error: "Carrier name and tracking number are required" }, 400);
      }
      patch.carrier_name = carrier || null;
      patch.tracking_number = tracking || null;
    }
    if (status === "assigned_to_carrier" && forward) patch.shipped_at = new Date().toISOString();
    if (status === "delivered" && forward) patch.delivered_at = new Date().toISOString();

    const { data: profile } = await sb.from("profiles").select("display_name, email").eq("id", userData.user.id).maybeSingle();
    const updated = await setStatus(sb, order, status, {
      byId: userData.user.id,
      byName: profile?.display_name || profile?.email || userData.user.email || "admin",
      patch,
    });
    if (!updated) return json({ error: "This order was just changed by someone else. Refresh and try again." }, 409);

    const emailed = forward && EMAILED.has(status);
    if (emailed) await sendStatusEmail(sb, updated);
    return json({ order: updated, emailed });
  } catch (error) {
    console.error("update-order-status error:", error);
    return json({ error: "Could not update the order" }, 500);
  }
});
