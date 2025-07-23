-- EMERGENCY FIX: Management company buildings
-- This MUST work for the demo

-- Delete any existing conflicting data
DELETE FROM building_users WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('management@demo.com', 'frankie@manage.management')
) AND building_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Delete existing buildings if they exist
DELETE FROM buildings WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Create the 3 buildings fresh
INSERT INTO buildings (id, name, address, total_units, building_age, building_type, service_charge_frequency, management_structure, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Riverside Apartments',
    '123 Thames Street, London SE1 9RT',
    24,
    15,
    'residential',
    'Monthly',
    'landlord-managed',
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Victoria Court',
    '45 Victoria Road, Manchester M1 4BT',
    18,
    8,
    'residential',
    'Quarterly',
    'landlord-managed',
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Garden View Flats',
    '78 Garden Lane, Birmingham B2 5HG',
    12,
    20,
    'residential',
    'Monthly',
    'landlord-managed',
    NOW()
  );

-- Associate with BOTH management@demo.com AND frankie@manage.management
INSERT INTO building_users (building_id, user_id, role, created_at)
SELECT
  building_id::uuid,
  u.id,
  'management-company',
  NOW()
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333')
) AS buildings(building_id)
CROSS JOIN auth.users u
WHERE u.email IN ('management@demo.com', 'frankie@manage.management');

-- Verify the data was inserted
DO $$
DECLARE
    building_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO building_count FROM buildings WHERE id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333'
    );
    
    SELECT COUNT(*) INTO user_count FROM building_users bu
    JOIN auth.users u ON bu.user_id = u.id
    WHERE u.email IN ('management@demo.com', 'frankie@manage.management')
    AND bu.role = 'management-company';
    
    RAISE NOTICE 'Buildings created: %, User associations created: %', building_count, user_count;
END $$;
