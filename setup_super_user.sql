-- Setup Super User and Demo Users for Development
-- Run this in Supabase SQL Editor

-- First, let's create a function to create users if they don't exist
-- Note: This is for development only and requires admin privileges

-- Create or update the super user (frankie@manage.management)
-- This user will have special dev privileges

-- Ensure all demo users exist in building_users table
-- (The actual auth.users will be created when they sign up)

-- Insert demo building users if they don't exist
INSERT INTO building_users (building_id, user_id, role, created_at)
SELECT 
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  u.id,
  CASE 
    WHEN u.email = 'rtm@demo.com' THEN 'rtm-director'
    WHEN u.email = 'sof@demo.com' THEN 'sof-director'
    WHEN u.email = 'leaseholder@demo.com' THEN 'leaseholder'
    WHEN u.email = 'shareholder@demo.com' THEN 'shareholder'
    WHEN u.email = 'management@demo.com' THEN 'management-company'
    WHEN u.email = 'frankie@manage.management' THEN 'super-admin'
    ELSE 'leaseholder'
  END,
  NOW()
FROM auth.users u
WHERE u.email IN (
  'rtm@demo.com',
  'sof@demo.com', 
  'leaseholder@demo.com',
  'shareholder@demo.com',
  'management@demo.com',
  'frankie@manage.management'
)
ON CONFLICT (building_id, user_id) DO NOTHING;

-- Create a special RLS policy for the super user
CREATE POLICY IF NOT EXISTS "Super user can access all buildings"
  ON building_users
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  );

-- Allow super user to access all polls
CREATE POLICY IF NOT EXISTS "Super user can access all polls"
  ON polls
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  );

-- Allow super user to access all issues
CREATE POLICY IF NOT EXISTS "Super user can access all issues"
  ON issues
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  );

-- Allow super user to access all buildings
CREATE POLICY IF NOT EXISTS "Super user can access all buildings"
  ON buildings
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'frankie@manage.management'
    )
  );

-- Create a function to help with user switching (for development)
CREATE OR REPLACE FUNCTION get_user_context(target_email text DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
  current_user_email text;
  target_user_id uuid;
  user_context jsonb;
BEGIN
  -- Get current user email
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Only allow super user to use this function
  IF current_user_email != 'frankie@manage.management' THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  
  -- If no target email specified, return current context
  IF target_email IS NULL THEN
    target_email := current_user_email;
  END IF;
  
  -- Get target user info
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;
  
  -- Build user context
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'email', target_email,
    'building_info', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'building_id', bu.building_id,
          'role', bu.role,
          'building_name', b.name,
          'building_address', b.address
        )
      )
      FROM building_users bu
      JOIN buildings b ON b.id = bu.building_id
      WHERE bu.user_id = target_user_id
    )
  ) INTO user_context;
  
  RETURN user_context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create demo data if building doesn't exist
INSERT INTO buildings (id, name, address, total_units, created_at)
VALUES (
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  'Riverside Gardens',
  '123 River Street, London SW1A 1AA',
  24,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create some demo units
INSERT INTO units (building_id, unit_number, floor_plan_type, square_footage, created_at)
SELECT 
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  unit_number,
  floor_plan_type,
  square_footage,
  NOW()
FROM (VALUES
  ('101', '1 Bedroom', 650),
  ('102', '2 Bedroom', 850),
  ('103', '1 Bedroom', 650),
  ('201', '2 Bedroom', 850),
  ('202', '3 Bedroom', 1200),
  ('203', '2 Bedroom', 850),
  ('301', '2 Bedroom', 850),
  ('302', '3 Bedroom', 1200),
  ('303', '2 Bedroom', 850),
  ('Penthouse', '4 Bedroom', 1800)
) AS t(unit_number, floor_plan_type, square_footage)
ON CONFLICT (building_id, unit_number) DO NOTHING;

SELECT 'Super user setup completed! frankie@manage.management now has dev powers.' as status;
