/*
  # Fix Building Users RLS Policies with Helper Functions

  1. Changes
    - Create helper functions with SECURITY DEFINER to avoid recursion
    - Replace recursive policies with non-recursive versions
    - Drop all existing problematic policies
    - Create new policies that use the helper functions

  2. Security
    - Maintain existing security model
    - Prevent infinite recursion in policy evaluation
    - Keep role-based access control
*/

-- Drop all existing policies on building_users
DO $$ 
BEGIN
  -- Try to drop all policies on building_users
  DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
  DROP POLICY IF EXISTS "demo_building_access" ON building_users;
  DROP POLICY IF EXISTS "directors_view_members" ON building_users;
  DROP POLICY IF EXISTS "directors_create_users" ON building_users;
  DROP POLICY IF EXISTS "directors_update_users" ON building_users;
  DROP POLICY IF EXISTS "directors_delete_users" ON building_users;
  DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
  DROP POLICY IF EXISTS "onboarding_create_first_building" ON building_users;
  
  -- Drop any other policies that might exist
  DROP POLICY IF EXISTS "view_building_users" ON building_users;
  DROP POLICY IF EXISTS "create_building_users" ON building_users;
  DROP POLICY IF EXISTS "update_building_users" ON building_users;
  DROP POLICY IF EXISTS "delete_building_users" ON building_users;
  DROP POLICY IF EXISTS "Allow access to demo building users" ON building_users;
END $$;

-- Create helper functions with SECURITY DEFINER to avoid recursion

-- 1. Function to check if user is a director of a building
CREATE OR REPLACE FUNCTION is_building_director(building_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = building_uuid
    AND user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director', 'management-company')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to check if user has no buildings
CREATE OR REPLACE FUNCTION user_has_no_buildings()
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM building_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to check if user is a member of a building
CREATE OR REPLACE FUNCTION is_building_member(building_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = building_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new, non-recursive policies using the helper functions

-- 1. Allow users to view their own memberships
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- 2. Allow access to demo building
CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);

-- 3. Allow directors to view all members in their buildings
CREATE POLICY "directors_view_members"
ON building_users
FOR SELECT
TO public
USING (is_building_director(building_id));

-- 4. Allow directors to create new building users
CREATE POLICY "directors_create_users"
ON building_users
FOR INSERT
TO public
WITH CHECK (is_building_director(building_id));

-- 5. Allow directors to update building users
CREATE POLICY "directors_update_users"
ON building_users
FOR UPDATE
TO public
USING (is_building_director(building_id));

-- 6. Allow directors to delete building users
CREATE POLICY "directors_delete_users"
ON building_users
FOR DELETE
TO public
USING (is_building_director(building_id));

-- 7. Allow new users to create their first building association
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  user_has_no_buildings()
);

-- 8. Special policy for onboarding - allow users to create their first building
CREATE POLICY "onboarding_create_first_building"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  (auth.role() = 'authenticated')
);

-- Update other policies that might reference building_users

-- Fix buildings access policy
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
CREATE POLICY "users_view_own_buildings"
ON buildings
FOR SELECT
TO public
USING (
  id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  is_building_member(id)
);

-- Fix issues access policy
DROP POLICY IF EXISTS "users_view_building_issues" ON issues;
CREATE POLICY "users_view_building_issues"
ON issues
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  is_building_member(building_id)
);

-- Fix announcements access policy
DROP POLICY IF EXISTS "users_view_building_announcements" ON announcements;
CREATE POLICY "users_view_building_announcements"
ON announcements
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  is_building_member(building_id)
);

-- Fix polls access policy
DROP POLICY IF EXISTS "users_view_building_polls" ON polls;
CREATE POLICY "users_view_building_polls"
ON polls
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  is_building_member(building_id)
);

-- Update the handle_new_user_signup function to avoid recursion
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  v_building_id uuid;
  v_user_metadata jsonb;
  v_role text;
  v_management_structure text;
BEGIN
  -- Skip if no role is provided
  IF NEW.raw_user_meta_data->>'role' IS NULL THEN
    RETURN NEW;
  END IF;

  v_role := NEW.raw_user_meta_data->>'role';
  
  -- Only create buildings for directors
  IF v_role IN ('rtm-director', 'sof-director') THEN
    -- Determine management structure based on role
    IF v_role = 'rtm-director' THEN
      v_management_structure := 'rtm';
    ELSE
      v_management_structure := 'share-of-freehold';
    END IF;
    
    -- Create the building
    INSERT INTO buildings (
      name,
      address,
      total_units,
      management_structure
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'buildingName', 'My Building'),
      COALESCE(NEW.raw_user_meta_data->>'buildingAddress', 'Address not set'),
      COALESCE((NEW.raw_user_meta_data->>'totalUnits')::integer, 1),
      v_management_structure
    )
    RETURNING id INTO v_building_id;

    -- Create building_users entry using direct SQL to bypass RLS
    -- This is executed with security definer privileges
    EXECUTE 'INSERT INTO building_users (building_id, user_id, role) VALUES ($1, $2, $3::user_role)'
    USING v_building_id, NEW.id, v_role;

    -- Update user metadata with building ID
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('buildingId', v_building_id)
    WHERE id = NEW.id;
    
    -- Create onboarding steps for the user
    BEGIN
      PERFORM create_user_onboarding_steps(
        NEW.id,
        v_building_id,
        v_role
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating onboarding steps: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();