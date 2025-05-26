-- Check and drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can read own data" ON auth.users;
  DROP POLICY IF EXISTS "Users can update own data" ON auth.users;
  DROP POLICY IF EXISTS "Users can manage their sessions" ON auth.sessions;
  DROP POLICY IF EXISTS "Users can manage their identities" ON auth.identities;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS on auth tables if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Add policy for users to read their own data
CREATE POLICY "Users can read own data"
ON auth.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Add policy for users to update their own data
CREATE POLICY "Users can update own data"
ON auth.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure proper grants for auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;

-- Grant necessary permissions on auth.users
GRANT SELECT ON auth.users TO authenticated;
GRANT UPDATE ON auth.users TO authenticated;

-- Add policy for user session management
CREATE POLICY "Users can manage their sessions"
ON auth.sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add policy for user identity management
CREATE POLICY "Users can manage their identities"
ON auth.identities
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());