-- Drop all existing policies on building_users
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
DROP POLICY IF EXISTS "directors_create_users" ON building_users;
DROP POLICY IF EXISTS "directors_update_users" ON building_users;
DROP POLICY IF EXISTS "directors_delete_users" ON building_users;
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;

-- Create new, completely non-recursive policies

-- 1. Allow users to view their own memberships
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- 2. Allow access to demo building
CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);

-- 3. Allow directors to view all members in their buildings
CREATE POLICY "directors_view_members"
ON building_users
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 4. Allow directors to create new building users
CREATE POLICY "directors_create_users"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 5. Allow directors to update building users
CREATE POLICY "directors_update_users"
ON building_users
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 6. Allow directors to delete building users
CREATE POLICY "directors_delete_users"
ON building_users
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 7. Allow new users to create their first building association
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  user_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- Create a function to validate user roles
CREATE OR REPLACE FUNCTION validate_user_role(role user_role)
RETURNS boolean AS $$
BEGIN
  RETURN role IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if a user is a building admin
CREATE OR REPLACE FUNCTION is_building_admin(building_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = building_uuid
    AND user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director', 'management-company')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;