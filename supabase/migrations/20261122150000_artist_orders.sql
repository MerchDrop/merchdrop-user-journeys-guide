-- Artists couldn't read orders at all (RLS allows only buyers and admins), so
-- their dashboards always showed zero sales. This returns the calling artist's
-- paid orders with only their own line items and the customer's first name
-- (no email, phone or address).
CREATE OR REPLACE FUNCTION public.artist_orders()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH me AS (SELECT id FROM public.artist_profiles WHERE user_id = auth.uid())
  SELECT COALESCE(jsonb_agg(row ORDER BY row->>'created_at' DESC), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'customer_name', COALESCE(NULLIF(o.shipping_address->>'firstName', ''), 'Customer'),
      'status', o.status,
      'payment_status', o.payment_status,
      'created_at', o.created_at,
      'paid_at', o.paid_at,
      'shipped_at', o.shipped_at,
      'delivered_at', o.delivered_at,
      'items', (
        SELECT jsonb_agg(jsonb_build_object(
          'product_id', i.product_id, 'title', p.title, 'quantity', i.quantity,
          'unit_price', i.unit_price, 'total_price', i.total_price, 'variant', i.product_variant))
        FROM public.order_items i LEFT JOIN public.products p ON p.id = i.product_id
        WHERE i.order_id = o.id AND i.artist_id = (SELECT id FROM me))
    ) AS row
    FROM public.orders o
    WHERE o.paid_at IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.order_items i WHERE i.order_id = o.id AND i.artist_id = (SELECT id FROM me))
  ) t;
$$;
REVOKE ALL ON FUNCTION public.artist_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.artist_orders() TO authenticated;
