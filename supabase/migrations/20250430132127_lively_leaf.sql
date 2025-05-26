-- First drop all dependent policies
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "Directors can view all share certificates for their building" ON share_certificates;
DROP POLICY IF EXISTS "Directors can manage share certificates" ON share_certificates;
DROP POLICY IF EXISTS "RTM directors can update their building details" ON building_details;
DROP POLICY IF EXISTS "RTM directors can upload documents" ON onboarding_documents;

-- Drop existing role constraint
ALTER TABLE building_users 
DROP CONSTRAINT IF EXISTS building_users_role_check;

-- Create role types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    -- Directors
    'rtm-director',
    'sof-director',
    
    -- Home owners
    'leaseholder',
    'shareholder',
    
    -- Management
    'management-company',
    'freeholder',
    'supplier'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create temporary column for role migration
ALTER TABLE building_users
ADD COLUMN new_role user_role;

-- Copy existing roles to temporary column
UPDATE building_users
SET new_role = role::user_role;

-- Drop original role column and rename new_role
ALTER TABLE building_users
DROP COLUMN role CASCADE;

ALTER TABLE building_users
RENAME COLUMN new_role TO role;

-- Create role hierarchy view
CREATE OR REPLACE VIEW role_hierarchy AS
SELECT 
  role,
  CASE 
    -- Directors have highest access
    WHEN role IN ('rtm-director', 'sof-director') THEN 1
    -- Management companies next
    WHEN role = 'management-company' THEN 2
    -- Home owners
    WHEN role IN ('shareholder', 'leaseholder') THEN 3
    -- Future roles
    WHEN role IN ('freeholder', 'supplier') THEN 4
  END as hierarchy_level,
  CASE
    WHEN role IN ('rtm-director', 'sof-director') THEN 'director'
    WHEN role IN ('leaseholder', 'shareholder') THEN 'homeowner'
    WHEN role IN ('management-company', 'freeholder', 'supplier') THEN 'management'
  END as role_category
FROM unnest(enum_range(NULL::user_role)) as role;

-- Create role validation function
CREATE OR REPLACE FUNCTION validate_user_role(role user_role)
RETURNS boolean AS $$
BEGIN
  -- Freeholder and Supplier roles are not yet available
  IF role IN ('freeholder', 'supplier') THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Add role validation to building_users
ALTER TABLE building_users
ADD CONSTRAINT valid_role CHECK (validate_user_role(role));

-- Update is_building_admin function to use new role structure
CREATE OR REPLACE FUNCTION is_building_admin(building_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM building_users bu
    JOIN role_hierarchy rh ON bu.role::text = rh.role::text
    WHERE bu.building_id = building_uuid
    AND bu.user_id = auth.uid()
    AND rh.hierarchy_level = 1  -- Directors only
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing demo users with proper roles
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  CASE 
    WHEN email = 'rtm@demo.com' THEN '"rtm-director"'
    WHEN email = 'sof@demo.com' THEN '"sof-director"'
    WHEN email = 'leaseholder@demo.com' THEN '"leaseholder"'
    WHEN email = 'shareholder@demo.com' THEN '"shareholder"'
    WHEN email = 'management@demo.com' THEN '"management-company"'
    ELSE raw_user_meta_data->'role'
  END
)
WHERE email LIKE '%@demo.com';

-- Update building_users table with new roles
UPDATE building_users bu
SET role = CASE 
  WHEN u.raw_user_meta_data->>'role' = 'rtm-director' THEN 'rtm-director'
  WHEN u.raw_user_meta_data->>'role' = 'sof-director' THEN 'sof-director'
  WHEN u.raw_user_meta_data->>'role' = 'leaseholder' THEN 'leaseholder'
  WHEN u.raw_user_meta_data->>'role' = 'shareholder' THEN 'shareholder'
  WHEN u.raw_user_meta_data->>'role' = 'management-company' THEN 'management-company'
  ELSE bu.role::text::user_role
END
FROM auth.users u
WHERE bu.user_id = u.id;

-- Recreate all policies with new role type
CREATE POLICY "view_building_users" ON building_users
FOR SELECT TO public
USING (
  user_id = auth.uid() OR
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

CREATE POLICY "create_building_users" ON building_users
FOR INSERT TO public
WITH CHECK (
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

CREATE POLICY "update_building_users" ON building_users
FOR UPDATE TO public
USING (
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

CREATE POLICY "delete_building_users" ON building_users
FOR DELETE TO public
USING (
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

CREATE POLICY "Directors can view all share certificates for their building"
ON share_certificates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = share_certificates.building_id
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('sof-director', 'rtm-director')
  )
);

CREATE POLICY "Directors can manage share certificates"
ON share_certificates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = share_certificates.building_id
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('sof-director', 'rtm-director')
  )
);

CREATE POLICY "RTM directors can update their building details"
ON building_details
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = building_details.building_id
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('rtm-director', 'sof-director')
  )
);

CREATE POLICY "RTM directors can upload documents"
ON onboarding_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = onboarding_documents.building_id
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('rtm-director', 'sof-director')
  )
);