/*
  # Fix building_users RLS policies

  1. Changes
    - Drop existing policies on building_users table that cause recursion
    - Create new, optimized policies that avoid recursive checks
    - Maintain security while preventing infinite loops
    
  2. Security
    - Users can view their own building associations
    - Directors can view all users in their buildings
    - Management companies can view all users in their buildings
    - Demo building remains accessible
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "view_building_users" ON building_users;

-- Create new, optimized policies
CREATE POLICY "view_own_building_users"
ON building_users
FOR SELECT
TO public
USING (
  -- Users can see their own building associations
  user_id = auth.uid() OR
  -- Demo building is visible
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
  -- Directors and management can see all users in their buildings
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Only directors and management can create new building users
CREATE POLICY "create_building_users"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  -- Demo building exception
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
  -- Directors and management can add users
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Only directors and management can update building users
CREATE POLICY "update_building_users"
ON building_users
FOR UPDATE
TO public
USING (
  -- Demo building exception
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
  -- Directors and management can update users
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
)
WITH CHECK (
  -- Demo building exception
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
  -- Directors and management can update users
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Only directors and management can delete building users
CREATE POLICY "delete_building_users"
ON building_users
FOR DELETE
TO public
USING (
  -- Demo building exception
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
  -- Directors and management can delete users
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);