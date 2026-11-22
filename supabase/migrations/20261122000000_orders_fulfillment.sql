-- Orders & fulfillment: new status model, audit history, auto-advance job,
-- order view tokens, and guest orders that get an account after payment.
-- Spec: docs/orders-fulfillment-spec.md (Nov 22, 2026)

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Order columns ----------------------------------------------------------
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL,           -- pending guest orders have no account yet
  ADD COLUMN IF NOT EXISTS customer_email  TEXT,
  ADD COLUMN IF NOT EXISTS carrier_name    TEXT,
  ADD COLUMN IF NOT EXISTS view_token      UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS needs_attention BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at    TIMESTAMPTZ;

UPDATE public.orders
SET customer_email = lower(shipping_address->>'email')
WHERE customer_email IS NULL AND shipping_address ? 'email';

-- 2. Status model -----------------------------------------------------------
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

UPDATE public.orders SET status = CASE
  WHEN status IS NULL OR status = 'pending' THEN
    CASE WHEN payment_status = 'paid' THEN 'payment_received' ELSE 'payment_pending' END
  WHEN status = 'confirmed' THEN 'payment_received'
  WHEN status = 'shipped'   THEN 'on_the_way'
  ELSE status
END;

UPDATE public.orders SET paid_at = created_at
WHERE paid_at IS NULL AND payment_status = 'paid';

-- Anything left over that we don't recognise goes to admin review rather than failing the migration.
UPDATE public.orders SET status = 'payment_received', needs_attention = true
WHERE status NOT IN (
  'payment_pending','payment_failed','payment_received','processing','ready_for_pickup',
  'assigned_to_carrier','picked_up','on_the_way','delivered','completed','cancelled','refunded'
);

ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'payment_pending';
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'payment_pending','payment_failed','payment_received','processing','ready_for_pickup',
  'assigned_to_carrier','picked_up','on_the_way','delivered','completed','cancelled','refunded'
));

-- Old policy referenced 'pending'/'confirmed'; keep "edit address before it leaves" behaviour.
DROP POLICY IF EXISTS "Users can update shipping address before shipment" ON public.orders;
CREATE POLICY "Users can update shipping address before shipment"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id AND status IN ('payment_received', 'processing') AND shipped_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- New protected columns join the existing anti-tampering trigger.
CREATE OR REPLACE FUNCTION public.prevent_order_field_tampering()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.payment_reference IS DISTINCT FROM OLD.payment_reference
     OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.subtotal IS DISTINCT FROM OLD.subtotal
     OR NEW.tax_amount IS DISTINCT FROM OLD.tax_amount
     OR NEW.shipping_cost IS DISTINCT FROM OLD.shipping_cost
     OR NEW.tracking_number IS DISTINCT FROM OLD.tracking_number
     OR NEW.carrier_name IS DISTINCT FROM OLD.carrier_name
     OR NEW.shipped_at IS DISTINCT FROM OLD.shipped_at
     OR NEW.delivered_at IS DISTINCT FROM OLD.delivered_at
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.completed_at IS DISTINCT FROM OLD.completed_at
     OR NEW.view_token IS DISTINCT FROM OLD.view_token
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
     OR NEW.needs_attention IS DISTINCT FROM OLD.needs_attention
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.order_number IS DISTINCT FROM OLD.order_number THEN
    RAISE EXCEPTION 'Not allowed: protected order fields cannot be modified by user';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Audit trail ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status     TEXT,
  to_status       TEXT NOT NULL,
  changed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_name TEXT NOT NULL DEFAULT 'system',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_status_history_order_idx
  ON public.order_status_history (order_id, created_at);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view order status history" ON public.order_status_history;
CREATE POLICY "Admins can view order status history"
ON public.order_status_history FOR SELECT USING (public.is_admin());
-- Customers read their timeline through get_order_details(), which hides who made each change.

-- 4. Order details for the customer (owner, view-token link, or admin) -------
CREATE OR REPLACE FUNCTION public.get_order_details(p_order_id UUID, p_token UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'order', to_jsonb(o) - 'view_token' - 'needs_attention' - 'billing_address',
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', i.id, 'quantity', i.quantity, 'unit_price', i.unit_price,
        'total_price', i.total_price, 'variant', i.product_variant,
        'title', p.title, 'image', p.main_image_url) ORDER BY i.created_at)
      FROM public.order_items i LEFT JOIN public.products p ON p.id = i.product_id
      WHERE i.order_id = o.id), '[]'::jsonb),
    'history', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('status', h.to_status, 'at', h.created_at) ORDER BY h.created_at)
      FROM public.order_status_history h
      WHERE h.order_id = o.id), '[]'::jsonb)
  )
  FROM public.orders o
  WHERE o.id = p_order_id
    AND (o.view_token = p_token OR (auth.uid() IS NOT NULL AND o.user_id = auth.uid()) OR public.is_admin());
$$;
REVOKE EXECUTE ON FUNCTION public.get_order_details(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.get_order_details(UUID, UUID) TO anon, authenticated;

-- 5. Automatic transitions (no emails, so plain SQL on a schedule) -----------
CREATE OR REPLACE FUNCTION public.advance_orders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Payment received -> Order processing, 2 minutes after payment, only if every product is live.
  WITH moved AS (
    UPDATE public.orders o
    SET status = 'processing', needs_attention = false, updated_at = now()
    WHERE o.status = 'payment_received'
      AND o.paid_at < now() - interval '2 minutes'
      AND NOT EXISTS (
        SELECT 1 FROM public.order_items i JOIN public.products p ON p.id = i.product_id
        WHERE i.order_id = o.id AND p.status <> 'published')
    RETURNING o.id
  )
  INSERT INTO public.order_status_history (order_id, from_status, to_status)
  SELECT id, 'payment_received', 'processing' FROM moved;

  -- Product not live: leave it in Payment received and flag it for the admin.
  UPDATE public.orders o
  SET needs_attention = true, updated_at = now()
  WHERE o.status = 'payment_received'
    AND NOT o.needs_attention
    AND o.paid_at < now() - interval '2 minutes'
    AND EXISTS (
      SELECT 1 FROM public.order_items i JOIN public.products p ON p.id = i.product_id
      WHERE i.order_id = o.id AND p.status <> 'published');

  -- Delivered -> Completed after the 7-day return window.
  WITH done AS (
    UPDATE public.orders
    SET status = 'completed', completed_at = now(), updated_at = now()
    WHERE status = 'delivered' AND delivered_at < now() - interval '7 days'
    RETURNING id
  )
  INSERT INTO public.order_status_history (order_id, from_status, to_status)
  SELECT id, 'delivered', 'completed' FROM done;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.advance_orders() FROM public, anon, authenticated;

SELECT cron.schedule('advance-orders', '* * * * *', 'SELECT public.advance_orders()');
