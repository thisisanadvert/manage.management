-- Create shareholder demo account
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'shareholder@demo.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'shareholder@demo.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'role', 'shareholder',
        'isDemo', true,
        'firstName', 'Simon',
        'lastName', 'Harris',
        'onboardingComplete', true
      ),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Link shareholder to demo building
INSERT INTO building_users (building_id, user_id, role, unit_id)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  u.id,
  'shareholder',
  (SELECT id FROM units WHERE unit_number = '2C' AND building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' LIMIT 1)
FROM auth.users u
WHERE u.email = 'shareholder@demo.com'
  AND NOT EXISTS (
    SELECT 1 FROM building_users 
    WHERE user_id = u.id 
    AND building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  );

-- Add share certificate for shareholder
INSERT INTO share_certificates (building_id, unit_id, holder_id, share_percentage, certificate_number)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  bu.unit_id,
  u.id,
  15.0,
  'SC-004'
FROM auth.users u
JOIN building_users bu ON bu.user_id = u.id
WHERE u.email = 'shareholder@demo.com'
  AND NOT EXISTS (
    SELECT 1 FROM share_certificates 
    WHERE holder_id = u.id
  );