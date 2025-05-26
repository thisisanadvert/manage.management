/*
  # Add Share of Freehold Support

  1. Changes
    - Add new building type for Share of Freehold
    - Update building_users roles to include Share of Freehold roles
    - Add RLS policies for Share of Freehold directors and shareholders

  2. Security
    - Maintain existing security model
    - Add specific permissions for Share of Freehold roles
*/

-- Add Share of Freehold building type
ALTER TABLE buildings
ADD COLUMN IF NOT EXISTS management_structure text CHECK (management_structure IN ('rtm', 'share-of-freehold', 'landlord-managed'));

-- Update building_users roles to include Share of Freehold
ALTER TABLE building_users
DROP CONSTRAINT IF EXISTS building_users_role_check;

ALTER TABLE building_users
ADD CONSTRAINT building_users_role_check 
CHECK (role IN ('rtm-director', 'sof-director', 'leaseholder', 'management-company', 'shareholder'));

-- Create Share of Freehold specific tables
CREATE TABLE IF NOT EXISTS share_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  unit_id uuid REFERENCES units(id),
  holder_id uuid REFERENCES auth.users(id),
  share_percentage decimal NOT NULL,
  certificate_number text NOT NULL,
  issued_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE share_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share certificates
CREATE POLICY "Users can view their own share certificates"
  ON share_certificates
  FOR SELECT
  USING (holder_id = auth.uid());

CREATE POLICY "Directors can view all share certificates for their building"
  ON share_certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = share_certificates.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role = 'sof-director'
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
      AND building_users.role = 'sof-director'
    )
  );

-- Update existing RLS policies to include Share of Freehold roles
CREATE OR REPLACE FUNCTION is_building_admin(building_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = building_uuid
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('rtm-director', 'sof-director', 'management-company')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update building access policies
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
CREATE POLICY "Users can view buildings they belong to"
  ON buildings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = buildings.id
      AND building_users.user_id = auth.uid()
    )
  );

-- Update announcement policies
DROP POLICY IF EXISTS "RTM directors and management can create announcements" ON announcements;
CREATE POLICY "Building administrators can create announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (
    is_building_admin(building_id)
  );

-- Update poll policies to include Share of Freehold directors
DROP POLICY IF EXISTS "Users can create polls" ON polls;
CREATE POLICY "Building administrators can create polls"
  ON polls
  FOR INSERT
  WITH CHECK (
    is_building_admin(building_id)
  );