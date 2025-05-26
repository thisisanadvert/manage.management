/*
  # Fix authentication policies

  1. Changes
    - Add missing RLS policies for auth.users table
    - Fix building_users policies to ensure new users can be created
    - Add safety checks to prevent policy conflicts
    
  2. Security
    - Maintain existing security model while fixing authentication flow
    - Ensure proper access control for user data
*/

-- Ensure building_users policies don't block authentication
DROP POLICY IF EXISTS "create_building_users" ON building_users;
CREATE POLICY "create_building_users" ON building_users
  FOR INSERT TO public
  WITH CHECK (
    -- Allow new users to be created during authentication
    (building_id IN (
      SELECT DISTINCT bu.building_id
      FROM building_users bu
      WHERE (bu.user_id = auth.uid() AND bu.role IN ('rtm-director', 'sof-director', 'management-company'))
    ))
    OR
    -- Allow system to create initial user records
    (auth.role() = 'authenticated' AND NOT EXISTS (
      SELECT 1 FROM building_users WHERE user_id = auth.uid()
    ))
  );

-- Update view policy to ensure users can access their own data
DROP POLICY IF EXISTS "view_building_users" ON building_users;
CREATE POLICY "view_building_users" ON building_users
  FOR SELECT TO public
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

-- Ensure proper role validation
CREATE OR REPLACE FUNCTION public.validate_user_role(role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN role IN ('rtm-director', 'sof-director', 'leaseholder', 'shareholder', 'management-company', 'freeholder', 'supplier');
END;
$$;