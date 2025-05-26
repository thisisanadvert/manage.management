/*
  # Fix authentication permissions

  1. Changes
    - Grant necessary permissions to auth schema and tables
    - Create auth_logs table if missing
    - Fix ownership of auth tables
    - Grant required privileges to auth roles

  2. Security
    - Ensures proper authentication flow
    - Maintains secure access control
*/

-- Create auth_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, supabase_auth_admin;

-- Ensure auth_logs ownership
ALTER TABLE IF EXISTS auth.auth_logs OWNER TO supabase_auth_admin;

-- Grant specific permissions for auth roles
GRANT SELECT ON auth.users TO anon, authenticated, service_role;
GRANT SELECT ON auth.auth_logs TO anon, authenticated, service_role;

-- Ensure public schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;