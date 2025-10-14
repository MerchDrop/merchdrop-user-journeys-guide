-- ============================================
-- FIX: Security Definer View (Supabase Linter Finding)
-- Set public_profiles view to SECURITY INVOKER mode
-- ============================================

-- Drop and recreate the view with SECURITY INVOKER
-- This ensures the view respects RLS policies and uses the querying user's permissions
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker=on)
AS
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

-- Grant SELECT access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add comment explaining the security configuration
COMMENT ON VIEW public.public_profiles IS 
'Safe public view of user profiles with SECURITY INVOKER mode enabled. 
Uses the querying user''s permissions and respects RLS policies.
Excludes sensitive data: email, phone, first_name, last_name.
Use this view for public-facing features like artist profiles.';

-- Explanation:
-- SECURITY INVOKER means the view executes with the permissions of the USER who queries it,
-- not the permissions of the postgres superuser who created it.
-- This follows the principle of least privilege and prevents accidental RLS bypass.