-- Order page needs product id/slug for "Write a review" links; hide reminder bookkeeping.
CREATE OR REPLACE FUNCTION public.get_order_details(p_order_id UUID, p_token UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'order', to_jsonb(o) - 'view_token' - 'needs_attention' - 'billing_address'
                         - 'reminder_sent_at' - 'review_requested_at',
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', i.id, 'quantity', i.quantity, 'unit_price', i.unit_price,
        'total_price', i.total_price, 'variant', i.product_variant,
        'product_id', p.id, 'slug', p.slug,
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
