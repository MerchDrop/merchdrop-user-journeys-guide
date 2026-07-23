-- Artists have SELECT/INSERT/UPDATE policies on products (see
-- 20250925134441_b37e9d7c-9805-42c6-8bca-88a093a279c0.sql) but no DELETE policy,
-- so RLS defaults to deny and artist-initiated product deletes silently fail.
-- Admins are unaffected (they already have a FOR ALL policy via is_admin()).
CREATE POLICY "Artists can delete own products" ON public.products
  FOR DELETE
  USING (
    artist_id IN (
      SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    )
  );
