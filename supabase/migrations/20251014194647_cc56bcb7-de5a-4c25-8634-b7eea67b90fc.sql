-- ============================================
-- FIX: Customer Email Addresses Exposed to Public Internet
-- Security Finding ID: profiles_table_email_exposure
-- ============================================

-- Step 1: Create a safe public view that excludes sensitive data
-- This view only exposes non-sensitive profile information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  website_url,
  social_links,
  account_status,
  created_at,
  updated_at
FROM public.profiles
WHERE account_status = 'active';

-- Step 2: Grant SELECT access to the view for public and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Step 3: Drop the dangerous RLS policy that exposes emails
DROP POLICY IF EXISTS "Public can view active user basic profiles" ON public.profiles;

-- Step 4: Add a comment explaining the security fix
COMMENT ON VIEW public.public_profiles IS 
'Safe public view of user profiles that excludes sensitive data (email, phone, first_name, last_name). 
Use this view for public-facing features like artist profiles. 
Direct queries to profiles table are restricted by RLS to authenticated users viewing their own data or admins.';

-- Verify: The remaining RLS policies on profiles table are:
-- 1. "Users can view own complete profile" - SAFE (auth.uid() = id)
-- 2. "Admins can view all profiles" - SAFE (is_admin())
-- 3. "Admins can update all profiles" - SAFE (is_admin())
-- 4. "rls_profiles_insert_own" - SAFE (id = auth.uid())
-- 5. "rls_profiles_update_own" - SAFE (id = auth.uid())
-- 6. "Suspended users limited access" - SAFE (account_status = 'active' OR id = auth.uid() OR is_admin())

-- Note: Email and phone data is now only accessible:
-- - By the user themselves (when authenticated)
-- - By admins (for management purposes)
-- - NOT accessible to the public internet