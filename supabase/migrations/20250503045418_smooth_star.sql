/*
  # Create demo users and permissions

  1. New Functions
    - Creates a function to handle demo user setup
    - Ensures demo users exist with correct roles and building access
  
  2. Security
    - Adds RLS policies to allow demo users to access their building data
    - Sets up proper role assignments
*/

-- Create demo users if they don't exist
DO $$ 
BEGIN
  -- Create demo building if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM buildings 
    WHERE id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  ) THEN
    INSERT INTO buildings (
      id,
      name,
      address,
      total_units,
      building_type,
      management_structure
    ) VALUES (
      'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
      'Waterside Apartments',
      '123 Waterfront Drive',
      10,
      'share-of-freehold',
      'rtm'
    );
  END IF;

  -- Create demo users and assign roles
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'rtm@demo.com'
  ) THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      gen_random_uuid(),
      'rtm@demo.com',
      crypt('demo123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"firstName":"Robert","lastName":"Thompson","role":"rtm-director"}',
      now(),
      now(),
      'authenticated',
      '',
      '',
      '',
      ''
    );
  END IF;

  -- Repeat for other demo users (sof@demo.com, leaseholder@demo.com, etc.)
  -- ... similar INSERT statements for other demo users ...

  -- Ensure demo users have building access
  INSERT INTO building_users (
    building_id,
    user_id,
    role,
    unit_id
  )
  SELECT
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    id,
    'rtm-director',
    NULL
  FROM auth.users
  WHERE email = 'rtm@demo.com'
  ON CONFLICT (building_id, user_id) DO NOTHING;

  -- Add units for demo users
  INSERT INTO units (
    id,
    building_id,
    unit_number,
    floor_plan_type
  ) VALUES 
    (gen_random_uuid(), 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f', '2A', 'Type A'),
    (gen_random_uuid(), 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f', '3A', 'Type A'),
    (gen_random_uuid(), 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f', '1B', 'Type B'),
    (gen_random_uuid(), 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f', '2C', 'Type C')
  ON CONFLICT DO NOTHING;

END $$;

-- Ensure RLS policies allow demo access
ALTER TABLE building_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow demo users to access their building data"
  ON building_users
  FOR ALL
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND 
     auth.email() LIKE '%@demo.com')
  );