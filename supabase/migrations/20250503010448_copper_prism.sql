-- Create auth_logs table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'auth_logs'
  ) THEN
    CREATE TABLE auth.auth_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id),
      event_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Grant necessary permissions for auth functionality
GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;
GRANT SELECT ON auth.users TO authenticated, anon, service_role;
GRANT SELECT ON auth.sessions TO authenticated, anon, service_role;
GRANT SELECT ON auth.identities TO authenticated, anon, service_role;

-- Grant permissions for public schema
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role;

-- Ensure RLS is disabled on auth tables (this is the default Supabase setup)
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.identities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.auth_logs DISABLE ROW LEVEL SECURITY;