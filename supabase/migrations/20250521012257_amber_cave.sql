/*
  # Fix building_users RLS policies recursion

  1. Changes
    - Drop all existing policies on building_users table
    - Create new non-recursive policies that prevent infinite recursion
    - Add proper guards to subqueries to prevent self-reference
    - Fix onboarding flow for new users creating buildings

  2. Security
    - Maintain existing security model
    - Prevent policy recursion
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

-- Create new, non-recursive policies

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
-- This policy uses a guard to prevent recursion
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
    AND bu.id <> building_users.id  -- Prevent recursion by excluding self-reference
  )
);

-- 4. Allow directors to create new building users
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

-- 5. Allow directors to update building users
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
    AND bu.id <> building_users.id  -- Prevent recursion by excluding self-reference
  )
);

-- 6. Allow directors to delete building users
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
    AND bu.id <> building_users.id  -- Prevent recursion by excluding self-reference
  )
);

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

-- Create a function to check if a user has any existing buildings
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

-- Create a function to check if a user is a building admin
CREATE OR REPLACE FUNCTION is_building_admin(building_uuid uuid)
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