/*
  # Seed Demo Data
  
  1. Creates demo building
  2. Adds units
  3. Links demo users to building
*/

-- Insert demo users only (no buildings or units)
INSERT INTO building_users (building_id, user_id, role, unit_id)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  u.id,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'rtm-director' THEN 'rtm-director'
    WHEN u.raw_user_meta_data->>'role' = 'leaseholder' THEN 'leaseholder'
    ELSE 'management-company'
  END,
  NULL
FROM auth.users u
WHERE u.email IN ('rtm@demo.com', 'leaseholder@demo.com', 'management@demo.com');