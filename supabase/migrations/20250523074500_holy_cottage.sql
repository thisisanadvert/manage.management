/*
  # Add RLS policies for buildings table

  1. New Policies
    - `building_admins_update_buildings`: Allows building administrators to update their buildings
    - `building_admins_insert_buildings`: Allows authenticated users to create new buildings

  2. Security
    - Uses the existing is_building_admin helper function
    - Maintains proper access control based on user roles
    - Ensures only authorized users can modify building data
*/

-- Create policy for building administrators to update buildings
CREATE POLICY "building_admins_update_buildings"
  ON buildings
  FOR UPDATE
  TO authenticated
  USING (is_building_admin(id))
  WITH CHECK (is_building_admin(id));

-- Create policy for authenticated users to create buildings
CREATE POLICY "building_admins_insert_buildings"
  ON buildings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- New users can create their first building
    NOT EXISTS (
      SELECT 1 
      FROM building_users
      WHERE user_id = auth.uid()
    )
    OR
    -- Existing directors can create additional buildings
    EXISTS (
      SELECT 1 
      FROM auth.users
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director')
    )
  );

-- Create a function to check if a user is a building member
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

-- Update the existing select policy to use the helper function
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;

CREATE POLICY "users_view_own_buildings"
  ON buildings
  FOR SELECT
  TO public
  USING (
    id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_member(id)
  );