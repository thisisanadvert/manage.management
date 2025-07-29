/*
  # Consolidated Demo Data Seeding Script
  
  This script consolidates all demo data creation into a single, idempotent
  seeding script that can be run safely multiple times without conflicts.
  
  ## Demo Data Includes:
  - Demo building (b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f)
  - Demo users for all user types
  - Sample issues, announcements, polls
  - Sample financial data
  - Sample documents and notifications
  
  ## Usage:
  Run this script in Supabase SQL Editor or via CLI:
  supabase db reset --seed
*/

-- ============================================================================
-- DEMO BUILDING SETUP
-- ============================================================================

-- Insert demo building (idempotent)
INSERT INTO buildings (
  id,
  name,
  address,
  total_units,
  management_structure,
  created_by,
  created_at
) VALUES (
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Riverside Apartments',
  '123 River Street, London, SW1A 1AA',
  24,
  'rtm',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  total_units = EXCLUDED.total_units,
  management_structure = EXCLUDED.management_structure;

-- ============================================================================
-- DEMO USERS SETUP
-- ============================================================================

-- Note: Demo users are created via the ensureDemoUsers.ts utility
-- This section documents the expected demo users for reference

/*
Expected Demo Users (created by frontend utility):
- rtm@demo.com (RTM Director)
- rmc@demo.com (RMC Director) 
- homeowner@demo.com (Homeowner)
- leaseholder@demo.com (Leaseholder)
- management@demo.com (Management Company)
- freeholder@demo.com (Block Freeholder)
*/

-- ============================================================================
-- DEMO BUILDING ASSOCIATIONS
-- ============================================================================

-- Create building associations for demo users (idempotent)
-- These will be created when demo users are provisioned

-- ============================================================================
-- DEMO ISSUES
-- ============================================================================

-- Insert sample issues
INSERT INTO issues (
  id,
  building_id,
  title,
  description,
  category,
  priority,
  status,
  reported_by,
  location,
  created_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Heating System Not Working',
  'The central heating system in the building has stopped working. Multiple residents have reported cold radiators.',
  'mechanical',
  'high',
  'reported',
  '00000000-0000-0000-0000-000000000000'::uuid,
  '{"unit": "Common Area", "area": "Boiler Room"}',
  NOW() - INTERVAL '2 days'
),
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Lift Out of Order',
  'The main lift is making strange noises and has stopped working between floors 2 and 3.',
  'mechanical',
  'medium',
  'in_progress',
  '00000000-0000-0000-0000-000000000000'::uuid,
  '{"unit": "Common Area", "area": "Lift Shaft"}',
  NOW() - INTERVAL '1 day'
),
(
  '33333333-3333-3333-3333-333333333333'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Water Leak in Flat 4B',
  'There is a water leak coming from the ceiling in the bathroom. It appears to be coming from the flat above.',
  'plumbing',
  'high',
  'reported',
  '00000000-0000-0000-0000-000000000000'::uuid,
  '{"unit": "4B", "area": "Bathroom"}',
  NOW() - INTERVAL '3 hours'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  status = EXCLUDED.status;

-- ============================================================================
-- DEMO ANNOUNCEMENTS
-- ============================================================================

-- Insert sample announcements
INSERT INTO announcements (
  id,
  building_id,
  title,
  content,
  priority,
  created_by,
  created_at,
  expires_at
) VALUES
(
  '44444444-4444-4444-4444-444444444444'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Annual General Meeting - 15th March',
  'The Annual General Meeting will be held on 15th March at 7:00 PM in the community room. All residents are encouraged to attend. Agenda items include budget review, maintenance updates, and election of new board members.',
  'high',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW() - INTERVAL '1 week',
  NOW() + INTERVAL '2 weeks'
),
(
  '55555555-5555-5555-5555-555555555555'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Planned Maintenance - Water System',
  'Please be advised that planned maintenance on the water system will take place on Saturday 10th March from 9:00 AM to 3:00 PM. Water supply may be interrupted during this time.',
  'medium',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '1 week'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  priority = EXCLUDED.priority;

-- ============================================================================
-- DEMO POLLS
-- ============================================================================

-- Insert sample polls
INSERT INTO polls (
  id,
  building_id,
  title,
  description,
  poll_type,
  status,
  created_by,
  created_at,
  ends_at
) VALUES
(
  '66666666-6666-6666-6666-666666666666'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Choose New Cleaning Service Provider',
  'We need to select a new cleaning service provider for the common areas. Please review the options and vote for your preferred choice.',
  'supplier_selection',
  'active',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '5 days'
),
(
  '77777777-7777-7777-7777-777777777777'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Garden Improvement Project Priority',
  'Which garden improvement should we prioritize for this year? Your input will help us allocate the maintenance budget effectively.',
  'project_prioritization',
  'active',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '1 week'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poll_type = EXCLUDED.poll_type,
  status = EXCLUDED.status;

-- ============================================================================
-- DEMO FINANCIAL SETUP
-- ============================================================================

-- Insert demo financial setup
INSERT INTO financial_setup (
  id,
  building_id,
  annual_service_charge,
  reserve_fund_target,
  insurance_premium,
  management_fee,
  utilities_budget,
  maintenance_budget,
  professional_fees_budget,
  other_expenses_budget,
  total_annual_budget,
  created_by,
  created_at
) VALUES (
  '88888888-8888-8888-8888-888888888888'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  120000.00,
  50000.00,
  8500.00,
  15000.00,
  18000.00,
  25000.00,
  5000.00,
  3000.00,
  194500.00,
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  annual_service_charge = EXCLUDED.annual_service_charge,
  reserve_fund_target = EXCLUDED.reserve_fund_target,
  insurance_premium = EXCLUDED.insurance_premium,
  management_fee = EXCLUDED.management_fee,
  utilities_budget = EXCLUDED.utilities_budget,
  maintenance_budget = EXCLUDED.maintenance_budget,
  professional_fees_budget = EXCLUDED.professional_fees_budget,
  other_expenses_budget = EXCLUDED.other_expenses_budget,
  total_annual_budget = EXCLUDED.total_annual_budget;

-- ============================================================================
-- DEMO TRANSACTIONS
-- ============================================================================

-- Insert sample transactions
INSERT INTO transactions (
  id,
  building_id,
  description,
  amount,
  transaction_type,
  category,
  transaction_date,
  created_by,
  created_at
) VALUES
(
  '99999999-9999-9999-9999-999999999999'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Service Charge Payment - Q1 2025',
  30000.00,
  'income',
  'service_charges',
  NOW() - INTERVAL '1 month',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW() - INTERVAL '1 month'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Cleaning Service - February',
  1200.00,
  'expense',
  'maintenance',
  NOW() - INTERVAL '2 weeks',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW() - INTERVAL '2 weeks'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid,
  'Insurance Premium Payment',
  2125.00,
  'expense',
  'insurance',
  NOW() - INTERVAL '1 week',
  '00000000-0000-0000-0000-000000000000'::uuid,
  NOW() - INTERVAL '1 week'
)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  amount = EXCLUDED.amount,
  transaction_type = EXCLUDED.transaction_type,
  category = EXCLUDED.category,
  transaction_date = EXCLUDED.transaction_date;

-- Add comment for tracking
COMMENT ON SCHEMA public IS 'Consolidated demo data seeded on 2025-07-29';
