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

-- Ensure building_users has proper policies
DROP POLICY IF EXISTS "create_building_users" ON public.building_users;
CREATE POLICY "create_building_users" ON public.building_users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow directors and management company to create users
    (building_id IN (
      SELECT DISTINCT bu.building_id
      FROM building_users bu
      WHERE bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
    ))
    OR
    -- Allow new users to create their first building association
    (
      auth.role() = 'authenticated' 
      AND NOT EXISTS (
        SELECT 1 
        FROM building_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Ensure proper view policy
DROP POLICY IF EXISTS "view_building_users" ON public.building_users;
CREATE POLICY "view_building_users" ON public.building_users
  FOR SELECT
  TO public
  USING (
    user_id = auth.uid()
    OR
    building_id IN (
      SELECT DISTINCT bu.building_id
      FROM building_users bu
      WHERE bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
    )
  );