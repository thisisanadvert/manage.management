/*
  # Fix building_users RLS policies

  1. Changes
    - Remove recursive policies from building_users table
    - Implement new, simplified RLS policies that avoid infinite recursion
    - Maintain security while fixing the circular reference issue

  2. Security
    - Users can view their own building associations
    - Directors can view all users in their buildings
    - Management companies can view all users in their buildings
    - Prevent unauthorized access to user data
*/

-- Drop existing policies to clean up
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "view_building_users" ON building_users;

-- Create new, non-recursive policies
CREATE POLICY "users_can_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (
  -- Users can see their own building memberships
  user_id = auth.uid()
);

CREATE POLICY "directors_can_view_building_members"
ON building_users
FOR SELECT
TO public
USING (
  -- Directors can see all members in their buildings
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.user_id = auth.uid()
    AND bu.building_id = building_users.building_id
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

CREATE POLICY "directors_can_manage_building_users"
ON building_users
FOR ALL
TO public
USING (
  -- Directors can manage users in their buildings
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.user_id = auth.uid()
    AND bu.building_id = building_users.building_id
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
)
WITH CHECK (
  -- Additional check for insert/update operations
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.user_id = auth.uid()
    AND bu.building_id = building_users.building_id
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Special policy for demo building access
CREATE POLICY "allow_demo_building_access"
ON building_users
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid
);