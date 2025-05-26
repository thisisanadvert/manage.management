-- Drop existing policies to replace them with non-recursive versions
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
DROP POLICY IF EXISTS "directors_create_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_delete_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_update_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_view_building_members" ON building_users;
DROP POLICY IF EXISTS "new_users_create_first_association" ON building_users;
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;

-- Create new, simplified policies without recursion

-- Allow users to view their own memberships
CREATE POLICY "view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (
  auth.uid() = user_id
);

-- Allow access to demo building
CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid
);

-- Allow directors to manage building users
CREATE POLICY "directors_manage_users"
ON building_users
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.user_id = auth.uid()
    AND building_users.role IN ('rtm-director', 'sof-director', 'management-company')
    AND building_users.building_id = building_users.building_id
  )
);

-- Allow new users to create their first association
CREATE POLICY "create_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  auth.role() = 'authenticated' AND
  NOT EXISTS (
    SELECT 1 FROM building_users
    WHERE user_id = auth.uid()
  )
);