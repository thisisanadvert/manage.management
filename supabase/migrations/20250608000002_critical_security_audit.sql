/*
  # CRITICAL SECURITY AUDIT & FIXES
  
  This migration addresses critical security vulnerabilities identified in the production readiness audit:
  
  ## Issues Fixed:
  1. RLS Policy Conflicts - Remove overlapping/conflicting policies
  2. Overly Permissive Policies - Tighten access controls
  3. Missing INSERT Policies - Add required policies for data creation
  4. Storage Security - Fix document access controls
  
  ## Security Principles Applied:
  - Principle of Least Privilege
  - Defense in Depth
  - Fail-Safe Defaults
  - Complete Mediation
*/

-- ============================================================================
-- 1. AUDIT AND FIX BUILDING_USERS TABLE POLICIES
-- ============================================================================

-- Drop all existing building_users policies to start fresh
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_create_users" ON building_users;
DROP POLICY IF EXISTS "directors_update_users" ON building_users;
DROP POLICY IF EXISTS "directors_delete_users" ON building_users;
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
DROP POLICY IF EXISTS "demo_building_access" ON building_users;

-- Create secure, non-recursive policies for building_users
CREATE POLICY "secure_view_own_memberships"
ON building_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_directors_manage_members"
ON building_users
FOR ALL
TO authenticated
USING (
  -- Directors can manage members in buildings where they are directors
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director', 'management-company')
    AND u.raw_user_meta_data->>'buildingId' = building_users.building_id::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director', 'management-company')
    AND u.raw_user_meta_data->>'buildingId' = building_users.building_id::text
  )
);

-- ============================================================================
-- 2. SECURE BUILDINGS TABLE POLICIES
-- ============================================================================

-- Drop existing building policies
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "building_admins_update_buildings" ON buildings;
DROP POLICY IF EXISTS "building_admins_insert_buildings" ON buildings;

-- Create secure building policies
CREATE POLICY "secure_view_own_buildings"
ON buildings
FOR SELECT
TO authenticated
USING (
  -- Users can view buildings they belong to via their metadata
  id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  OR
  -- Or buildings they are explicitly associated with
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = buildings.id
    AND bu.user_id = auth.uid()
  )
);

CREATE POLICY "secure_directors_manage_buildings"
ON buildings
FOR ALL
TO authenticated
USING (
  -- Only directors can manage their own buildings
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director')
    AND u.raw_user_meta_data->>'buildingId' = buildings.id::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director')
    AND u.raw_user_meta_data->>'buildingId' = buildings.id::text
  )
);

-- ============================================================================
-- 3. SECURE ISSUES TABLE POLICIES
-- ============================================================================

-- Drop existing issue policies that may conflict
DROP POLICY IF EXISTS "Users can view issues in their buildings" ON issues;
DROP POLICY IF EXISTS "Allow access to demo building issues" ON issues;
DROP POLICY IF EXISTS "Users can create issues in their buildings" ON issues;
DROP POLICY IF EXISTS "Building administrators can update issues" ON issues;

-- Create comprehensive, secure issue policies
CREATE POLICY "secure_view_building_issues"
ON issues
FOR SELECT
TO authenticated
USING (
  -- Users can view issues in their buildings
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  OR
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = issues.building_id
    AND bu.user_id = auth.uid()
  )
);

CREATE POLICY "secure_create_building_issues"
ON issues
FOR INSERT
TO authenticated
WITH CHECK (
  -- Users can create issues in their buildings
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  AND created_by = auth.uid()
);

CREATE POLICY "secure_update_building_issues"
ON issues
FOR UPDATE
TO authenticated
USING (
  -- Directors and issue creators can update issues
  (
    building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
    AND (
      created_by = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director', 'management-company')
      )
    )
  )
)
WITH CHECK (
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
);

-- ============================================================================
-- 4. SECURE ANNOUNCEMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing announcement policies
DROP POLICY IF EXISTS "users_view_building_announcements" ON announcements;
DROP POLICY IF EXISTS "Building administrators can create announcements" ON announcements;

-- Create secure announcement policies
CREATE POLICY "secure_view_building_announcements"
ON announcements
FOR SELECT
TO authenticated
USING (
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  OR
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = announcements.building_id
    AND bu.user_id = auth.uid()
  )
);

CREATE POLICY "secure_directors_manage_announcements"
ON announcements
FOR ALL
TO authenticated
USING (
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  AND EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director', 'management-company')
  )
)
WITH CHECK (
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  AND posted_by = auth.uid()
);

-- ============================================================================
-- 5. SECURE DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing document policies
DROP POLICY IF EXISTS "Users can view documents in their buildings" ON onboarding_documents;
DROP POLICY IF EXISTS "Directors can upload documents" ON onboarding_documents;

-- Create secure document policies
CREATE POLICY "secure_view_building_documents"
ON onboarding_documents
FOR SELECT
TO authenticated
USING (
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  OR
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = onboarding_documents.building_id
    AND bu.user_id = auth.uid()
  )
);

CREATE POLICY "secure_directors_manage_documents"
ON onboarding_documents
FOR ALL
TO authenticated
USING (
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  AND EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director', 'management-company')
  )
)
WITH CHECK (
  building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  AND uploaded_by = auth.uid()
);

-- ============================================================================
-- 6. SECURE STORAGE BUCKET POLICIES
-- ============================================================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can read documents from their buildings" ON storage.objects;
DROP POLICY IF EXISTS "Directors can upload documents" ON storage.objects;

-- Create secure storage policies
CREATE POLICY "secure_read_building_documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    -- Users can access documents from their building
    SPLIT_PART(name, '/', 1) = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
    OR
    -- Demo building access for demo users
    (
      SPLIT_PART(name, '/', 1) = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
      AND (auth.jwt() -> 'user_metadata' ->> 'email') LIKE '%@demo.com'
    )
  )
);

CREATE POLICY "secure_upload_building_documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    -- Directors can upload to their building folder
    (
      SPLIT_PART(name, '/', 1) = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
      AND EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director', 'management-company')
      )
    )
    OR
    -- Demo users can upload to demo building
    (
      SPLIT_PART(name, '/', 1) = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
      AND (auth.jwt() -> 'user_metadata' ->> 'email') LIKE '%@demo.com'
    )
  )
);

-- ============================================================================
-- 7. ADD SECURITY LOGGING
-- ============================================================================

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  building_id uuid,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow reading audit logs for super admins
CREATE POLICY "super_admin_view_audit_log"
ON security_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'role' = 'super-admin'
  )
);

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_building_id uuid DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    building_id,
    success,
    error_message
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_building_id,
    p_success,
    p_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
