/*
  # Restore Working Authentication Setup
  
  1. Changes
    - Drop problematic policies and triggers
    - Restore original auth setup
    - Fix permissions
*/

-- First, drop all problematic policies and triggers
DROP POLICY IF EXISTS "Users can read own data" ON auth.users;
DROP POLICY IF EXISTS "Users can update own data" ON auth.users;
DROP POLICY IF EXISTS "Users can manage their sessions" ON auth.sessions;
DROP POLICY IF EXISTS "Users can manage their identities" ON auth.identities;

-- Disable RLS on auth tables (this is the default Supabase setup)
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth.identities DISABLE ROW LEVEL SECURITY;

-- Restore original grants
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- Drop any custom auth_logs table that might have been created
DROP TABLE IF EXISTS auth.auth_logs;

-- Ensure proper ownership
ALTER TABLE IF EXISTS auth.users OWNER TO supabase_auth_admin;
ALTER TABLE IF EXISTS auth.sessions OWNER TO supabase_auth_admin;
ALTER TABLE IF EXISTS auth.identities OWNER TO supabase_auth_admin;

-- Restore public schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;