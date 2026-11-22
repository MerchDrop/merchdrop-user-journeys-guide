-- Customers can ask for a return within 7 days of delivery; admins see it as "needs attention".
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS return_reason TEXT;

CREATE OR REPLACE FUNCTION public.request_return(p_order_id UUID, p_token UUID, p_reason TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders;
BEGIN
  SELECT * INTO o FROM public.orders WHERE id = p_order_id
    AND (view_token = p_token OR (auth.uid() IS NOT NULL AND user_id = auth.uid()));
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF o.return_requested_at IS NOT NULL THEN RETURN 'already_requested'; END IF;
  IF o.status <> 'delivered' OR o.delivered_at < now() - interval '7 days' THEN RETURN 'not_eligible'; END IF;
  IF length(trim(coalesce(p_reason, ''))) < 3 THEN RETURN 'reason_required'; END IF;

  UPDATE public.orders
  SET return_requested_at = now(), return_reason = left(trim(p_reason), 1000), needs_attention = true
  WHERE id = o.id;
  RETURN 'ok';
END;
$$;
REVOKE ALL ON FUNCTION public.request_return(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_return(UUID, UUID, TEXT) TO anon, authenticated;

-- Don't auto-complete an order while a return is open.
CREATE OR REPLACE FUNCTION public.advance_orders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
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

  UPDATE public.orders o
  SET needs_attention = true, updated_at = now()
  WHERE o.status = 'payment_received'
    AND NOT o.needs_attention
    AND o.paid_at < now() - interval '2 minutes'
    AND EXISTS (
      SELECT 1 FROM public.order_items i JOIN public.products p ON p.id = i.product_id
      WHERE i.order_id = o.id AND p.status <> 'published');

  WITH done AS (
    UPDATE public.orders o
    SET status = 'completed', completed_at = now(), updated_at = now()
    WHERE o.status = 'delivered'
      AND o.delivered_at < now() - interval '7 days'
      AND o.return_requested_at IS NULL
    RETURNING o.id
  )
  INSERT INTO public.order_status_history (order_id, from_status, to_status)
  SELECT id, 'delivered', 'completed' FROM done;
END;
$fn$;
