-- Setup Management Company Buildings
-- This creates the 3 buildings shown in the management dashboard and associates them with the management user

-- Create the 3 buildings that match the management dashboard
INSERT INTO buildings (id, name, address, total_units, building_age, building_type, service_charge_frequency, management_structure, created_at)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
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
    '22222222-2222-2222-2222-222222222222',
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
    '33333333-3333-3333-3333-333333333333',
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
  building_id,
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

-- Create some demo issues for these buildings to test the selector
INSERT INTO issues (building_id, title, description, category, priority, status, reported_by, created_at)
SELECT 
  building_id,
  title,
  description,
  category,
  priority,
  status,
  u.id,
  NOW()
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111', 'Lift maintenance required', 'The main lift is making unusual noises', 'Mechanical', 'High', 'Open'),
  ('11111111-1111-1111-1111-111111111111', 'Lobby lighting issue', 'Several bulbs in the lobby need replacement', 'Electrical', 'Medium', 'Open'),
  ('11111111-1111-1111-1111-111111111111', 'Heating system check', 'Annual heating system maintenance due', 'HVAC', 'Critical', 'Scheduled'),
  ('22222222-2222-2222-2222-222222222222', 'Garden maintenance', 'Communal garden needs landscaping', 'Grounds', 'Low', 'Open'),
  ('33333333-3333-3333-3333-333333333333', 'Roof leak in flat 5', 'Water damage reported in top floor flat', 'Structural', 'Critical', 'In Progress'),
  ('33333333-3333-3333-3333-333333333333', 'Fire alarm testing', 'Monthly fire alarm test required', 'Safety', 'High', 'Scheduled'),
  ('33333333-3333-3333-3333-333333333333', 'Parking area cleaning', 'Underground parking needs deep clean', 'Cleaning', 'Medium', 'Open'),
  ('33333333-3333-3333-3333-333333333333', 'Window cleaning', 'External window cleaning overdue', 'Cleaning', 'Low', 'Open'),
  ('33333333-3333-3333-3333-333333333333', 'Intercom repair', 'Entry intercom system not working', 'Security', 'High', 'Open')
) AS demo_issues(building_id, title, description, category, priority, status)
CROSS JOIN auth.users u
WHERE u.email = 'management@demo.com';

SELECT 'Management company buildings and demo issues created successfully!' as status;
