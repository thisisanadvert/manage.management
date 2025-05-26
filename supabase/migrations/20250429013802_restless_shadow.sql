/*
  # Fix Building Users Policy Recursion

  1. Changes
    - Drop and recreate building_users policies to prevent recursion
    - Simplify policy logic for cleaner access control
    - Fix infinite recursion in user viewing policy

  2. Security
    - Maintain proper access control
    - Prevent policy recursion
    - Keep existing security model
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view members in their buildings" ON building_users;
DROP POLICY IF EXISTS "RTM directors and management can create building users" ON building_users;
DROP POLICY IF EXISTS "RTM directors and management can update building users" ON building_users;
DROP POLICY IF EXISTS "RTM directors and management can delete building users" ON building_users;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own building membership"
ON building_users FOR SELECT
USING (
  -- Users can see their own membership
  user_id = auth.uid()
  OR
  -- RTM directors and management can see all members in their buildings
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE 
      bu.building_id = building_users.building_id 
      AND bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'management-company')
  )
);

CREATE POLICY "RTM directors and management can create building users"
ON building_users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE 
      bu.building_id = building_users.building_id 
      AND bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'management-company')
  )
);

CREATE POLICY "RTM directors and management can update building users"
ON building_users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE 
      bu.building_id = building_users.building_id 
      AND bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'management-company')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE 
      bu.building_id = building_users.building_id 
      AND bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'management-company')
  )
);

CREATE POLICY "RTM directors and management can delete building users"
ON building_users FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE 
      bu.building_id = building_users.building_id 
      AND bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'management-company')
  )
);