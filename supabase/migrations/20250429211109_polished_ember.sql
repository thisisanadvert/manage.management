/*
  # Update Demo Accounts

  1. Changes
    - Add dummy data for all demo accounts
    - Disable onboarding for demo accounts
    - Update building management structure for SOF demo
*/

-- Update demo user metadata with dummy data
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', raw_user_meta_data->>'role',
  'isDemo', true,
  'firstName', 
    CASE 
      WHEN email = 'rtm@demo.com' THEN 'Robert'
      WHEN email = 'sof@demo.com' THEN 'Sarah'
      WHEN email = 'leaseholder@demo.com' THEN 'Lisa'
      WHEN email = 'management@demo.com' THEN 'Mark'
    END,
  'lastName',
    CASE 
      WHEN email = 'rtm@demo.com' THEN 'Thompson'
      WHEN email = 'sof@demo.com' THEN 'Foster'
      WHEN email = 'leaseholder@demo.com' THEN 'Parker'
      WHEN email = 'management@demo.com' THEN 'Anderson'
    END,
  'onboardingComplete', true
)
WHERE email LIKE '%@demo.com';

-- Mark onboarding as completed for demo users
INSERT INTO onboarding_status (user_id, building_id, profile_completed, building_setup_completed, documents_uploaded)
SELECT 
  u.id,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  true,
  true,
  true
FROM auth.users u
WHERE u.email LIKE '%@demo.com'
AND NOT EXISTS (
  SELECT 1 FROM onboarding_status os 
  WHERE os.user_id = u.id
);

-- Add completed onboarding steps for demo users
INSERT INTO onboarding_steps (user_id, building_id, step_name, completed, completed_at)
SELECT 
  u.id,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  step_name,
  true,
  NOW()
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('profile_setup'),
    ('building_details'),
    ('unit_setup'),
    ('documents_upload'),
    ('resident_invite')
) AS steps(step_name)
WHERE u.email LIKE '%@demo.com'
AND NOT EXISTS (
  SELECT 1 FROM onboarding_steps os 
  WHERE os.user_id = u.id 
  AND os.step_name = steps.step_name
);

-- Update demo building for Share of Freehold
UPDATE buildings
SET 
  management_structure = 'share-of-freehold',
  management_type = 'Share of Freehold'
WHERE id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';

-- Add share certificates for other demo users
INSERT INTO share_certificates (building_id, unit_id, holder_id, share_percentage, certificate_number)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  bu.unit_id,
  u.id,
  CASE 
    WHEN u.email = 'rtm@demo.com' THEN 35.0
    WHEN u.email = 'leaseholder@demo.com' THEN 40.0
  END,
  CASE 
    WHEN u.email = 'rtm@demo.com' THEN 'SC-002'
    WHEN u.email = 'leaseholder@demo.com' THEN 'SC-003'
  END
FROM auth.users u
JOIN building_users bu ON bu.user_id = u.id
WHERE u.email IN ('rtm@demo.com', 'leaseholder@demo.com')
  AND NOT EXISTS (
    SELECT 1 FROM share_certificates 
    WHERE holder_id = u.id
  );