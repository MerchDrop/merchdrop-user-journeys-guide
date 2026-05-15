
-- 1. Orders: prevent users from changing financial fields
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Allow users to update only the shipping_address (and only before shipment)
CREATE POLICY "Users can update shipping address before shipment"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'confirmed') AND shipped_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Trigger to prevent users from modifying protected fields
CREATE OR REPLACE FUNCTION public.prevent_order_field_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role and admins to change anything
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
     OR NEW.shipped_at IS DISTINCT FROM OLD.shipped_at
     OR NEW.delivered_at IS DISTINCT FROM OLD.delivered_at
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.order_number IS DISTINCT FROM OLD.order_number THEN
    RAISE EXCEPTION 'Not allowed: protected order fields cannot be modified by user';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_order_field_tampering ON public.orders;
CREATE TRIGGER trg_prevent_order_field_tampering
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.prevent_order_field_tampering();

-- 2. Orders idempotency: unique payment_reference (when present)
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_unique
ON public.orders (payment_reference)
WHERE payment_reference IS NOT NULL;

-- 3. Revoke EXECUTE on sensitive SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.setup_user_profile(text, app_role) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.setup_user_profile(text, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.approve_role_request(uuid, app_role, uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.approve_role_request(uuid, app_role, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reject_role_request(uuid, app_role, uuid, text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.reject_role_request(uuid, app_role, uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.repair_missing_designer_roles() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.repair_missing_artist_profiles() FROM anon, authenticated, public;

-- Trigger-only helpers: not callable externally
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.ensure_designer_role() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_artist_role_on_approval() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_designer_role_on_approval() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_designer_stats() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.prevent_order_field_tampering() FROM anon, authenticated, public;
