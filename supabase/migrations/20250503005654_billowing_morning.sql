-- Drop any existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON auth.users;
  DROP POLICY IF EXISTS "Users can update own data" ON auth.users;
  DROP POLICY IF EXISTS "Users can manage their sessions" ON auth.sessions;
  DROP POLICY IF EXISTS "Users can manage their identities" ON auth.identities;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Disable RLS on auth tables to restore default behavior
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities DISABLE ROW LEVEL SECURITY;

-- Ensure proper grants exist
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;