-- Grant usage on public schema to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables in public schema to anon and authenticated roles  
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant execute on all functions in public schema to anon and authenticated roles
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;