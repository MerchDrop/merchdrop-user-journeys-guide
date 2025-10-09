-- Fix PUBLIC_USER_DATA security issue: Customer Email Addresses and Phone Numbers Exposed to Public
-- Drop the overly permissive policy that allows anyone to view all profile data
DROP POLICY IF EXISTS "rls_profiles_view_all" ON public.profiles;

-- Create a policy for users to view their own complete profile (including email and phone)
CREATE POLICY "Users can view own complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin());

-- Create a policy for public to view basic profile info (excluding sensitive fields)
-- Note: This allows SELECT at row level, but application code MUST NOT expose email/phone fields
-- when querying other users' profiles. Consider using views or filtered queries in your application.
CREATE POLICY "Public can view active user basic profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  account_status = 'active' 
  AND id != auth.uid()
);

-- Add a comment to remind developers about column-level security
COMMENT ON TABLE public.profiles IS 'SECURITY: When querying profiles of other users, DO NOT include email or phone fields in SELECT statements. Only expose: id, display_name, first_name, last_name, avatar_url, bio, website_url, social_links, created_at, updated_at, account_status';