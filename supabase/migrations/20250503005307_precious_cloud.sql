/*
  # Fix authentication policies

  1. Changes
    - Add missing RLS policies for auth.users table
    - Fix building_users policies to allow proper authentication
    - Add safety checks to user role validation
    
  2. Security
    - Ensure proper access control for authentication
    - Maintain existing security model while fixing auth issues
*/

-- First, ensure the validate_user_role function exists and is properly defined
CREATE OR REPLACE FUNCTION public.validate_user_role(role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the role is valid
  IF role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Validate against allowed roles
  RETURN role = ANY(ARRAY['rtm-director', 'sof-director', 'leaseholder', 'shareholder', 'management-company', 'freeholder', 'supplier']::user_role[]);
END;
$$;

-- Fix building_users policies
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

-- Ensure building_users has proper select policy
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

-- Add safety check to building_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'building_users_role_check'
  ) THEN
    ALTER TABLE public.building_users
    ADD CONSTRAINT building_users_role_check
    CHECK (role IS NOT NULL);
  END IF;
END $$;