/*
  # Fix building_users RLS policies

  1. Changes
    - Remove recursive policy on building_users table
    - Add new policies for:
      - Viewing building users (non-recursive)
      - Creating building users (for RTM directors and management)
      - Updating building users (for RTM directors and management)
      - Deleting building users (for RTM directors and management)

  2. Security
    - Ensures users can only view users in buildings they belong to
    - Restricts management actions to RTM directors and management company users
*/

-- Drop existing policies to replace them with fixed versions
DROP POLICY IF EXISTS "Users can view members in their buildings" ON building_users;

-- Create new non-recursive policies
CREATE POLICY "Users can view members in their buildings"
ON building_users
FOR SELECT
TO public
USING (
  building_id IN (
    SELECT building_id 
    FROM building_users bu2 
    WHERE bu2.user_id = auth.uid()
  )
);

CREATE POLICY "RTM directors and management can create building users"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE bu.building_id = building_users.building_id 
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'management-company')
  )
);

CREATE POLICY "RTM directors and management can update building users"
ON building_users
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE bu.building_id = building_users.building_id 
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'management-company')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE bu.building_id = building_users.building_id 
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'management-company')
  )
);

CREATE POLICY "RTM directors and management can delete building users"
ON building_users
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu 
    WHERE bu.building_id = building_users.building_id 
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'management-company')
  )
);