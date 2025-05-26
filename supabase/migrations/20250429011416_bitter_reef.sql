/*
  # Seed Demo Data
  
  1. Creates demo building and data
  2. Only applies to demo user accounts
*/

-- Insert demo building only if it doesn't exist
INSERT INTO buildings (id, name, address, total_units)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  'Waterside Apartments',
  '123 Riverside Drive, London, SE1 7TH',
  24
WHERE NOT EXISTS (
  SELECT 1 FROM buildings WHERE id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Insert demo units
INSERT INTO units (building_id, unit_number, floor_plan_type, square_footage)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  CASE 
    WHEN number <= 8 THEN concat(1, chr(64 + number))
    WHEN number <= 16 THEN concat(2, chr(64 + (number - 8)))
    ELSE concat(3, chr(64 + (number - 16)))
  END,
  CASE number % 3
    WHEN 0 THEN '2 Bedroom'
    WHEN 1 THEN '1 Bedroom'
    ELSE 'Studio'
  END,
  CASE number % 3
    WHEN 0 THEN 850
    WHEN 1 THEN 650
    ELSE 450
  END
FROM generate_series(1, 24) number
WHERE NOT EXISTS (
  SELECT 1 FROM units WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Link demo users to building
INSERT INTO building_users (building_id, user_id, role, unit_id)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  u.id,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'rtm-director' THEN 'rtm-director'
    WHEN u.raw_user_meta_data->>'role' = 'leaseholder' THEN 'leaseholder'
    ELSE 'management-company'
  END,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'rtm-director' THEN (SELECT id FROM units WHERE unit_number = '2A' AND building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' LIMIT 1)
    WHEN u.raw_user_meta_data->>'role' = 'leaseholder' THEN (SELECT id FROM units WHERE unit_number = '1B' AND building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' LIMIT 1)
    ELSE NULL
  END
FROM auth.users u
WHERE u.email IN ('rtm@demo.com', 'leaseholder@demo.com', 'management@demo.com')
  AND (u.raw_user_meta_data->>'isDemo')::boolean = true
  AND NOT EXISTS (
    SELECT 1 FROM building_users 
    WHERE user_id = u.id 
    AND building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  );