-- Quick fix for management company buildings
-- This will ensure the management@demo.com user has access to the 3 demo buildings

-- First, ensure the 3 buildings exist
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
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  total_units = EXCLUDED.total_units,
  building_age = EXCLUDED.building_age,
  building_type = EXCLUDED.building_type,
  service_charge_frequency = EXCLUDED.service_charge_frequency,
  management_structure = EXCLUDED.management_structure;

-- Associate the management company user with these buildings
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
WHERE u.email = 'management@demo.com'
ON CONFLICT (building_id, user_id) DO NOTHING;

-- Add some demo issues for these buildings
INSERT INTO issues (building_id, title, description, category, priority, status, reported_by, created_at)
SELECT
  building_id::uuid,
  title,
  description,
  category,
  priority,
  status,
  u.id,
  NOW()
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111', 'Lift maintenance', 'Annual lift service required', 'Maintenance', 'Medium', 'Open'),
  ('11111111-1111-1111-1111-111111111111', 'Roof leak', 'Water damage in top floor corridor', 'Maintenance', 'High', 'In Progress'),
  ('22222222-2222-2222-2222-222222222222', 'Heating system', 'Boiler needs replacement', 'Maintenance', 'High', 'Open'),
  ('22222222-2222-2222-2222-222222222222', 'Garden maintenance', 'Landscaping required for communal areas', 'Maintenance', 'Low', 'Open'),
  ('33333333-3333-3333-3333-333333333333', 'Security system', 'CCTV cameras need updating', 'Security', 'Medium', 'Open'),
  ('33333333-3333-3333-3333-333333333333', 'Intercom repair', 'Entry intercom system not working', 'Security', 'High', 'Open')
) AS demo_issues(building_id, title, description, category, priority, status)
CROSS JOIN auth.users u
WHERE u.email = 'management@demo.com'
ON CONFLICT DO NOTHING;

SELECT 'Management company buildings fixed successfully!' as status;
