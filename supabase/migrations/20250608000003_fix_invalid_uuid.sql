/*
  # Fix Invalid UUID Issue
  
  This migration fixes the invalid UUID issue that was causing errors when creating issues.
  
  ## Problem
  - Invalid UUID "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6" contained non-hexadecimal characters
  - This was causing PostgreSQL UUID validation errors
  
  ## Solution
  - Replace with valid UUID "c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6"
  - Create the Central Park building record for Frankie's real account
  - Add proper units and demo data for this building
  
  ## Changes
  1. Create Central Park building with valid UUID
  2. Add units for the building
  3. Update any existing references to the old invalid UUID
*/

-- Create Central Park building for Frankie's real account
INSERT INTO buildings (
  id,
  name,
  address,
  total_units,
  building_type,
  building_age,
  service_charge_frequency,
  management_structure,
  created_at,
  updated_at
) VALUES (
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  'Central Park',
  'Central Park, London',
  12,
  'Luxury Apartment Block',
  5,
  'Quarterly',
  'rtm',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  total_units = EXCLUDED.total_units,
  building_type = EXCLUDED.building_type,
  building_age = EXCLUDED.building_age,
  service_charge_frequency = EXCLUDED.service_charge_frequency,
  management_structure = EXCLUDED.management_structure,
  updated_at = NOW();

-- Create units for Central Park building
INSERT INTO units (building_id, unit_number, floor_plan_type, square_footage)
SELECT
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  unit_number,
  floor_plan_type,
  square_footage
FROM (VALUES
  ('Penthouse', '3 Bedroom Penthouse', 1200),
  ('1A', '2 Bedroom', 850),
  ('1B', '2 Bedroom', 850),
  ('1C', '1 Bedroom', 650),
  ('2A', '2 Bedroom', 850),
  ('2B', '2 Bedroom', 850),
  ('2C', '1 Bedroom', 650),
  ('3A', '2 Bedroom', 850),
  ('3B', '2 Bedroom', 850),
  ('3C', '1 Bedroom', 650),
  ('4A', '2 Bedroom', 850),
  ('4B', '1 Bedroom', 650)
) AS t(unit_number, floor_plan_type, square_footage)
ON CONFLICT (building_id, unit_number) DO UPDATE SET
  floor_plan_type = EXCLUDED.floor_plan_type,
  square_footage = EXCLUDED.square_footage;

-- Create building_users association for Frankie
INSERT INTO building_users (building_id, user_id, role, unit_number)
SELECT 
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  u.id,
  'rtm-director',
  'Penthouse'
FROM auth.users u
WHERE u.email = 'frankie@manage.management'
ON CONFLICT (building_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  unit_number = EXCLUDED.unit_number;

-- Add some sample data for Central Park building
INSERT INTO announcements (building_id, title, content, category, posted_by, is_pinned, created_at)
SELECT
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  title,
  content,
  category,
  u.id,
  is_pinned,
  NOW() - (random() * INTERVAL '30 days')
FROM (VALUES
  ('Welcome to Central Park', 'Welcome to our luxury building management system. This is your central hub for all building-related communications and services.', 'General', true),
  ('Quarterly Service Charge Notice', 'The quarterly service charge statements have been distributed. Please review and contact management with any questions.', 'Financial', false),
  ('Building Maintenance Schedule', 'Scheduled maintenance for the elevator and common areas will take place next week. Minimal disruption expected.', 'Maintenance', false)
) AS t(title, content, category, is_pinned)
CROSS JOIN auth.users u
WHERE u.email = 'frankie@manage.management'
ON CONFLICT DO NOTHING;

-- Add sample issues for Central Park
INSERT INTO issues (building_id, title, description, category, priority, status, reported_by, location, created_at)
SELECT
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  title,
  description,
  category,
  priority,
  status,
  u.id,
  location,
  NOW() - (random() * INTERVAL '60 days')
FROM (VALUES
  ('Penthouse Balcony Door Adjustment', 'The sliding door to the penthouse balcony needs adjustment - it''s difficult to open and close smoothly.', 'Mechanical', 'Low', 'Reported', 'Penthouse balcony'),
  ('Lobby Lighting Upgrade', 'Consider upgrading the lobby lighting to LED for better energy efficiency and ambiance.', 'Electrical', 'Low', 'Scheduled', 'Main lobby'),
  ('Roof Garden Irrigation', 'The roof garden irrigation system needs maintenance - some areas are not receiving adequate water.', 'Plumbing', 'Medium', 'In Progress', 'Roof garden')
) AS t(title, description, category, priority, status, location)
CROSS JOIN auth.users u
WHERE u.email = 'frankie@manage.management'
ON CONFLICT DO NOTHING;

-- Update any existing user metadata that might have the old invalid UUID
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{buildingId}',
  '"c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6"'
)
WHERE email = 'frankie@manage.management'
AND raw_user_meta_data->>'buildingId' = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';

-- Clean up any data that might reference the old invalid UUID
-- (This is safe because the old UUID was invalid and couldn't have been used successfully)
DELETE FROM issues WHERE building_id::text = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';
DELETE FROM announcements WHERE building_id::text = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';
DELETE FROM building_users WHERE building_id::text = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';
DELETE FROM units WHERE building_id::text = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6';

-- Add financial setup for Central Park
INSERT INTO financial_setup (
  building_id,
  total_annual_budget,
  reserve_fund_target,
  service_charge_frequency,
  payment_due_day,
  late_payment_fee,
  created_at
) VALUES (
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  120000.00,
  25000.00,
  'quarterly',
  15,
  50.00,
  NOW()
) ON CONFLICT (building_id) DO UPDATE SET
  total_annual_budget = EXCLUDED.total_annual_budget,
  reserve_fund_target = EXCLUDED.reserve_fund_target,
  service_charge_frequency = EXCLUDED.service_charge_frequency,
  payment_due_day = EXCLUDED.payment_due_day,
  late_payment_fee = EXCLUDED.late_payment_fee,
  updated_at = NOW();

-- Add compliance requirements for Central Park
INSERT INTO compliance_requirements (building_id, requirement_type, description, frequency, next_due)
SELECT
  'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
  requirement_type,
  description,
  frequency,
  next_due
FROM (VALUES
  ('Fire Safety', 'Annual fire safety inspection and certification for luxury building', 'yearly', NOW() + INTERVAL '4 months'),
  ('Electrical', 'Five-year electrical installation condition report', 'five-yearly', NOW() + INTERVAL '3 years'),
  ('Elevator', 'Six-monthly elevator safety inspection and certification', 'six-monthly', NOW() + INTERVAL '2 months'),
  ('Insurance', 'Building insurance renewal and compliance check', 'yearly', NOW() + INTERVAL '7 months'),
  ('Gas Safety', 'Annual gas safety inspection for common areas and penthouse', 'yearly', NOW() + INTERVAL '5 months')
) AS t(requirement_type, description, frequency, next_due)
ON CONFLICT (building_id, requirement_type) DO UPDATE SET
  description = EXCLUDED.description,
  frequency = EXCLUDED.frequency,
  next_due = EXCLUDED.next_due;
