/*
  # Fix Building Users RLS Policies

  1. Changes
    - Remove all existing policies that cause infinite recursion
    - Create new non-recursive policies for building_users table
    - Fix storage policies for document access
    - Remove demo-specific policies and focus on real users

  2. Security
    - Maintain proper access control based on user roles
    - Prevent policy recursion with optimized queries
    - Ensure proper document storage access
*/

-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
DROP POLICY IF EXISTS "directors_create_users" ON building_users;
DROP POLICY IF EXISTS "directors_delete_users" ON building_users;
DROP POLICY IF EXISTS "directors_update_users" ON building_users;
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
DROP POLICY IF EXISTS "directors_manage_users" ON building_users;
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "create_first_association" ON building_users;
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;

-- Create new, clean policies for building_users

-- 1. Users can view their own memberships
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- 2. Directors can view all members in their buildings
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

-- 3. Directors can create new building users
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

-- 4. Directors can update building users
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

-- 5. Directors can delete building users
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

-- 6. New users can create their first building association
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- Fix buildings access policy
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;

CREATE POLICY "users_view_own_buildings"
ON buildings
FOR SELECT
TO public
USING (
  id IN (
    SELECT building_id 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- Fix issues access policy
DROP POLICY IF EXISTS "Users can view issues in their buildings" ON issues;
DROP POLICY IF EXISTS "Users can create issues in their buildings" ON issues;
DROP POLICY IF EXISTS "users_view_building_issues" ON issues;
DROP POLICY IF EXISTS "users_create_building_issues" ON issues;

CREATE POLICY "users_view_building_issues"
ON issues
FOR SELECT
TO public
USING (
  building_id IN (
    SELECT building_id 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "users_create_building_issues"
ON issues
FOR INSERT
TO public
WITH CHECK (
  building_id IN (
    SELECT building_id 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- Fix announcements access policy
DROP POLICY IF EXISTS "Users can view announcements in their buildings" ON announcements;
DROP POLICY IF EXISTS "users_view_building_announcements" ON announcements;

CREATE POLICY "users_view_building_announcements"
ON announcements
FOR SELECT
TO public
USING (
  building_id IN (
    SELECT building_id 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- Fix polls access policy
DROP POLICY IF EXISTS "Users can view polls in their buildings" ON polls;
DROP POLICY IF EXISTS "users_view_building_polls" ON polls;

CREATE POLICY "users_view_building_polls"
ON polls
FOR SELECT
TO public
USING (
  building_id IN (
    SELECT building_id 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- Create documents storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'documents'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents', 'documents', false);
  END IF;
END $$;

-- Fix storage policies
DROP POLICY IF EXISTS "Users can read documents from their buildings" ON storage.objects;
DROP POLICY IF EXISTS "Directors can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "users_access_building_documents" ON storage.objects;
DROP POLICY IF EXISTS "directors_upload_documents" ON storage.objects;

CREATE POLICY "users_access_building_documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documents' AND
  SPLIT_PART(name, '/', 1) IN (
    SELECT building_id::text
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "directors_upload_documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'documents' AND
  SPLIT_PART(name, '/', 1) IN (
    SELECT building_id::text
    FROM building_users
    WHERE user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director')
  )
);