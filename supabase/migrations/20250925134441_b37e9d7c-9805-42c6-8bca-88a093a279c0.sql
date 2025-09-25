-- Fix PostgREST schema exposure by updating the db settings
-- Ensure the public schema is properly exposed through the API

-- Grant INSERT, UPDATE, DELETE permissions to authenticated users where appropriate
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT DELETE ON public.profiles TO authenticated;

GRANT INSERT ON public.user_roles TO authenticated;
GRANT UPDATE ON public.user_roles TO authenticated;
GRANT DELETE ON public.user_roles TO authenticated;

GRANT INSERT ON public.artist_profiles TO authenticated;
GRANT UPDATE ON public.artist_profiles TO authenticated;
GRANT DELETE ON public.artist_profiles TO authenticated;

GRANT INSERT ON public.products TO authenticated;
GRANT UPDATE ON public.products TO authenticated;
GRANT DELETE ON public.products TO authenticated;

GRANT INSERT ON public.orders TO authenticated;
GRANT UPDATE ON public.orders TO authenticated;
GRANT DELETE ON public.orders TO authenticated;

-- Grant all permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Update default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;