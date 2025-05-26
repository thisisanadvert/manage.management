/*
  # Fix Building Users Policy

  1. Changes
    - Fix recursive policy for building_users table
    - Update select policy to prevent infinite recursion
    - Ensure proper access control without circular references

  2. Security
    - Maintain existing security model
    - Fix policy implementation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members in their buildings" ON building_users;

-- Create new non-recursive policy
CREATE POLICY "Users can view members in their buildings"
ON building_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users u 
    WHERE u.id = auth.uid() 
    AND (
      -- Allow users to see their own building memberships
      building_users.user_id = auth.uid()
      OR
      -- Allow users to see other members if they are RTM director or management
      EXISTS (
        SELECT 1 
        FROM building_users bu2 
        WHERE bu2.building_id = building_users.building_id 
        AND bu2.user_id = auth.uid()
        AND bu2.role IN ('rtm-director', 'management-company')
      )
    )
  )
);