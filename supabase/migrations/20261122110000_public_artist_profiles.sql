-- Logged-out visitors could not see any artist: artist_profiles was readable
-- only by signed-in users, and profiles/artist_follows only by their owners.

-- 1. Anyone may read an approved artist's name and slug (product cards embed
--    these). Visitors get only these columns; commission/earnings stay hidden.
CREATE POLICY "Public can view approved artists" ON public.artist_profiles
  FOR SELECT TO anon USING (status = 'approved');
REVOKE SELECT ON public.artist_profiles FROM anon;
GRANT SELECT (id, user_id, artist_name, artist_slug, status) ON public.artist_profiles TO anon;

-- 2. One public card per approved artist with safe fields and real counts.
--    Runs as owner on purpose (bypasses RLS on profiles/follows), so it must
--    only ever select non-sensitive columns: no email, phone, earnings.
DROP VIEW IF EXISTS public.public_artist_profiles;
CREATE VIEW public.public_artist_profiles AS
SELECT
  a.id,
  a.artist_name,
  a.artist_slug,
  a.brand_colors,
  a.created_at,
  COALESCE(a.total_sales, 0) AS total_sales,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.website_url,
  p.social_links,
  (SELECT count(*) FROM public.artist_follows f WHERE f.artist_id = a.id)::int AS follower_count,
  (SELECT count(*) FROM public.products pr WHERE pr.artist_id = a.id AND pr.status = 'published')::int AS product_count,
  (SELECT round(avg(r.rating)::numeric, 1) FROM public.reviews r JOIN public.products pr ON pr.id = r.product_id
    WHERE pr.artist_id = a.id) AS average_rating,
  (SELECT count(*) FROM public.reviews r JOIN public.products pr ON pr.id = r.product_id
    WHERE pr.artist_id = a.id)::int AS review_count
FROM public.artist_profiles a
LEFT JOIN public.profiles p ON p.id = a.user_id
WHERE a.status = 'approved';

REVOKE ALL ON public.public_artist_profiles FROM anon, authenticated;
GRANT SELECT ON public.public_artist_profiles TO anon, authenticated;
