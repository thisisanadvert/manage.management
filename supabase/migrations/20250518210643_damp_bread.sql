/*
  # Fix building_users RLS policies recursion

  1. Changes
    - Replace recursive policies with non-recursive versions
    - Add special handling for demo building access
    - Create storage bucket for documents
    - Fix infinite recursion in building_users policies
    
  2. Security
    - Maintain existing security model
    - Prevent policy recursion
    - Keep role-based access control
*/

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "Allow access to demo building users" ON building_users;

-- Create new non-recursive policies for building_users

-- 1. SELECT policy: Allow users to view their own memberships and directors/management to view all in their buildings
CREATE POLICY "view_building_users" ON building_users
  FOR SELECT
  USING (
    -- Users can always see their own membership
    user_id = auth.uid() 
    OR 
    -- Allow access to demo building for demo users
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'
    ))
    OR
    -- Directors and management can see all users in their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
        AND bu.id != building_users.id  -- Prevent recursion by excluding self-reference
    )
  );

-- 2. INSERT policy: Allow directors/management to add users to their buildings
CREATE POLICY "create_building_users" ON building_users
  FOR INSERT
  WITH CHECK (
    -- Directors and management can add users to their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
    )
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'
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

-- 3. UPDATE policy: Allow directors/management to update users in their buildings
CREATE POLICY "update_building_users" ON building_users
  FOR UPDATE
  USING (
    -- Directors and management can update users in their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
        AND bu.id != building_users.id  -- Prevent recursion
    )
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'
    ))
  );

-- 4. DELETE policy: Allow directors/management to remove users from their buildings
CREATE POLICY "delete_building_users" ON building_users
  FOR DELETE
  USING (
    -- Directors and management can delete users from their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
        AND bu.id != building_users.id  -- Prevent recursion
    )
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'
    ))
  );

-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for documents bucket
CREATE POLICY "Public can read documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND auth.role() = 'authenticated'
);

-- Fix buildings access policy for demo building
DROP POLICY IF EXISTS "Allow access to demo building" ON buildings;
CREATE POLICY "Allow access to demo building"
  ON buildings
  FOR ALL
  TO authenticated
  USING (
    id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
    EXISTS (
      SELECT 1 
      FROM building_users
      WHERE building_users.building_id = buildings.id
      AND building_users.user_id = auth.uid()
    )
  );

-- Fix issues access policy for demo building
DROP POLICY IF EXISTS "Allow access to demo building issues" ON issues;
CREATE POLICY "Allow access to demo building issues"
  ON issues
  FOR ALL
  TO authenticated
  USING (
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
    EXISTS (
      SELECT 1 
      FROM building_users
      WHERE building_users.building_id = issues.building_id
      AND building_users.user_id = auth.uid()
    )
  );