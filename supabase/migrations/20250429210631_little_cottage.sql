/*
  # Add Share of Freehold Demo Account

  1. Changes
    - Creates demo Share of Freehold director account
    - Links account to demo building
    - Adds share certificate for the demo account
*/

-- Create SOF Director demo account
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'sof@demo.com'
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
      'sof@demo.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"sof-director","isDemo":true}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Link SOF Director to demo building
INSERT INTO building_users (building_id, user_id, role, unit_id)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  u.id,
  'sof-director',
  (SELECT id FROM units WHERE unit_number = '3A' AND building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' LIMIT 1)
FROM auth.users u
WHERE u.email = 'sof@demo.com'
  AND NOT EXISTS (
    SELECT 1 FROM building_users 
    WHERE user_id = u.id 
    AND building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  );

-- Add share certificate for SOF Director
INSERT INTO share_certificates (building_id, unit_id, holder_id, share_percentage, certificate_number)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  bu.unit_id,
  u.id,
  25.0,
  'SC-001'
FROM auth.users u
JOIN building_users bu ON bu.user_id = u.id
WHERE u.email = 'sof@demo.com'
  AND NOT EXISTS (
    SELECT 1 FROM share_certificates 
    WHERE holder_id = u.id
  );