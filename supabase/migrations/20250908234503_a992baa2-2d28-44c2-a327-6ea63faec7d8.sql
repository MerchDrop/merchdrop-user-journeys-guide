-- Configure PostgREST to access public schema
-- This updates the database configuration to allow REST API access to public schema

-- Grant usage on public schema to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select permissions on all tables in public schema to anon role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant select permissions on all tables in public schema to authenticated role  
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant usage on all sequences to authenticated role
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;

-- Update PostgREST configuration to use public schema
-- This ensures the REST API can access the public schema
DO $$
BEGIN
  -- Check if the setting exists and update it
  IF EXISTS (
    SELECT 1 FROM pg_settings WHERE name = 'pgrst.db_schemas'
  ) THEN
    PERFORM set_config('pgrst.db_schemas', 'public', false);
  END IF;
END $$;