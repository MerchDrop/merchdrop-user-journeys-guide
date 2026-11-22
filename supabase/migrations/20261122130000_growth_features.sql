-- Coupons, limited drops, abandoned-cart and review-request reminders.

-- 1. Coupons (admin-managed, validated and redeemed only by the server) -----
CREATE TABLE IF NOT EXISTS public.coupons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE CHECK (code = upper(code) AND code ~ '^[A-Z0-9_-]{3,32}$'),
  type        TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value       NUMERIC NOT NULL CHECK (value > 0),
  min_spend   NUMERIC NOT NULL DEFAULT 0 CHECK (min_spend >= 0),
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count  INTEGER NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (type <> 'percentage' OR value <= 100)
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Count a use only if the coupon still has uses left. Server-only.
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_code TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH u AS (
    UPDATE public.coupons SET used_count = used_count + 1
    WHERE code = upper(p_code) AND (usage_limit IS NULL OR used_count < usage_limit)
    RETURNING 1
  ) SELECT EXISTS (SELECT 1 FROM u);
$$;
REVOKE ALL ON FUNCTION public.redeem_coupon(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(TEXT) TO service_role;

-- 2. Order fields -----------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_amount     NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code         TEXT,
  ADD COLUMN IF NOT EXISTS reminder_sent_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMPTZ;

-- Customers may change only the delivery address; every other column
-- (including any added later) is protected.
CREATE OR REPLACE FUNCTION public.prevent_order_field_tampering()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF (to_jsonb(NEW) - 'shipping_address' - 'updated_at')
     IS DISTINCT FROM (to_jsonb(OLD) - 'shipping_address' - 'updated_at') THEN
    RAISE EXCEPTION 'Not allowed: protected order fields cannot be modified by user';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Limited drops: stock already exists (NULL = unlimited); add a launch time.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS drop_at TIMESTAMPTZ;

-- Reduce stock for a paid order. Server-only; never below zero.
CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(p_order_id UUID)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products p
  SET stock = GREATEST(p.stock - q.qty, 0)
  FROM (SELECT product_id, sum(quantity)::int AS qty FROM public.order_items
        WHERE order_id = p_order_id GROUP BY product_id) q
  WHERE p.id = q.product_id AND p.stock IS NOT NULL;
$$;
REVOKE ALL ON FUNCTION public.decrement_stock_for_order(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_for_order(UUID) TO service_role;

-- 4. Reminder emails: pg_cron calls the order-reminders edge function every
--    10 minutes. The shared secret lives in Vault (set outside migrations).
CREATE EXTENSION IF NOT EXISTS pg_net;
SELECT cron.unschedule('order-reminders') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'order-reminders');
SELECT cron.schedule('order-reminders', '*/10 * * * *', $cron$
  SELECT net.http_post(
    url := 'https://fnipjjcqlpklyuaduwml.supabase.co/functions/v1/order-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
$cron$);

-- 5. Reviews required payment_status = 'completed', which is never set (paid
--    orders are 'paid'), so nobody could review. Allow buyers of paid orders.
CREATE OR REPLACE FUNCTION public.can_user_review_product(user_uuid UUID, product_uuid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM order_items oi JOIN orders o ON oi.order_id = o.id
    WHERE o.user_id = user_uuid AND oi.product_id = product_uuid AND o.payment_status = 'paid'
      AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.user_id = user_uuid AND r.product_id = product_uuid)
  );
$$;
DROP POLICY IF EXISTS "Users can create reviews for products they purchased" ON public.reviews;
CREATE POLICY "Users can create reviews for products they purchased" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM order_items oi JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = auth.uid() AND oi.product_id = reviews.product_id AND o.payment_status = 'paid'
    )
  );
