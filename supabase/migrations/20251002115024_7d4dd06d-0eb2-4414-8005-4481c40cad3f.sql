-- Add missing RLS policy for artists to view own profile
CREATE POLICY "Artists can view own profile"
ON public.artist_profiles
FOR SELECT
USING (auth.uid() = user_id);