
DROP VIEW IF EXISTS public.public_profiles CASCADE;
DROP VIEW IF EXISTS public.public_artist_profiles CASCADE;

DROP POLICY IF EXISTS "Suspended users limited access" ON public.profiles;

CREATE VIEW public.public_profiles AS
SELECT id, display_name, avatar_url, bio, website_url, social_links
FROM public.profiles
WHERE account_status = 'active';
GRANT SELECT ON public.public_profiles TO anon, authenticated;

ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_roles;

UPDATE storage.buckets SET public = false WHERE id = 'design-files';

DROP POLICY IF EXISTS "Anyone can view design files" ON storage.objects;
DROP POLICY IF EXISTS "Designers can update own design files" ON storage.objects;
DROP POLICY IF EXISTS "Designers can delete own design files" ON storage.objects;
DROP POLICY IF EXISTS "Designers can upload design files" ON storage.objects;

CREATE POLICY "Designers can view own design files"
ON storage.objects FOR SELECT
USING (bucket_id = 'design-files' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all design files"
ON storage.objects FOR SELECT
USING (bucket_id = 'design-files' AND public.is_admin());

CREATE POLICY "Designers can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'design-files'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.is_designer()
);

CREATE POLICY "Designers can update own design files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'design-files' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Designers can delete own design files"
ON storage.objects FOR DELETE
USING (bucket_id = 'design-files' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "rls_user_roles_self_assign_initial" ON public.user_roles;
CREATE POLICY "rls_user_roles_self_assign_initial"
ON public.user_roles FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND role = 'user'::app_role
  AND public.can_self_assign_initial_role()
);

DROP POLICY IF EXISTS "Anyone can view approved artists" ON public.artist_profiles;
CREATE POLICY "Authenticated can view approved artists"
ON public.artist_profiles FOR SELECT
TO authenticated
USING (status = 'approved');

CREATE VIEW public.public_artist_profiles AS
SELECT id, user_id, artist_name, artist_slug, brand_colors, status, created_at
FROM public.artist_profiles
WHERE status = 'approved';
GRANT SELECT ON public.public_artist_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
