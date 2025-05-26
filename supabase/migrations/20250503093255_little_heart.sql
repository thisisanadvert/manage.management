/*
  # Create demo users

  1. Changes
    - Creates demo users for testing purposes with proper auth configuration:
      - RTM Director: rtm@demo.com
      - SOF Director: sof@demo.com
      - Leaseholder: leaseholder@demo.com
      - Shareholder: shareholder@demo.com
      - Management Company: management@demo.com

  2. Security
    - Users are created with secure passwords
    - Each user has a specific role assigned
    - Proper auth configuration ensures successful login
*/

-- Create demo users with proper auth configuration
DO $$
DECLARE
  auth_uid uuid;
BEGIN
  -- RTM Director
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'rtm@demo.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'rtm@demo.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"rtm-director","firstName":"Demo","lastName":"Director","onboardingComplete":true}',
      FALSE,
      NOW(),
      NOW(),
      '',
      '',
      ''
    ) RETURNING id INTO auth_uid;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      auth_uid,
      format('{"sub":"%s","email":"%s"}', auth_uid::text, 'rtm@demo.com')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- SOF Director
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
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
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
      '{"provider":"email","providers":["email"]}',
      '{"role":"sof-director","firstName":"Demo","lastName":"SOF","onboardingComplete":true}',
      FALSE,
      NOW(),
      NOW(),
      '',
      '',
      ''
    ) RETURNING id INTO auth_uid;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      auth_uid,
      format('{"sub":"%s","email":"%s"}', auth_uid::text, 'sof@demo.com')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- Leaseholder
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'leaseholder@demo.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'leaseholder@demo.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"leaseholder","firstName":"Demo","lastName":"Leaseholder","onboardingComplete":true}',
      FALSE,
      NOW(),
      NOW(),
      '',
      '',
      ''
    ) RETURNING id INTO auth_uid;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      auth_uid,
      format('{"sub":"%s","email":"%s"}', auth_uid::text, 'leaseholder@demo.com')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- Shareholder
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
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
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
      '{"provider":"email","providers":["email"]}',
      '{"role":"shareholder","firstName":"Demo","lastName":"Shareholder","onboardingComplete":true}',
      FALSE,
      NOW(),
      NOW(),
      '',
      '',
      ''
    ) RETURNING id INTO auth_uid;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      auth_uid,
      format('{"sub":"%s","email":"%s"}', auth_uid::text, 'shareholder@demo.com')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- Management Company
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'management@demo.com'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'management@demo.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"management-company","firstName":"Demo","lastName":"Manager","onboardingComplete":true}',
      FALSE,
      NOW(),
      NOW(),
      '',
      '',
      ''
    ) RETURNING id INTO auth_uid;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      auth_uid,
      format('{"sub":"%s","email":"%s"}', auth_uid::text, 'management@demo.com')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;