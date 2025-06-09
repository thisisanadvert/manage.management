/*
  # Add Comprehensive Demo Data

  1. Changes
    - Add realistic property metrics
    - Create activity feed entries
    - Add maintenance issues with different statuses
    - Generate financial records and transactions
    - Add documents and announcements
    - Create voting records and AGM data

  2. Security
    - Maintains existing RLS policies
    - Only affects demo building
*/

-- Update demo building with metrics
UPDATE buildings
SET
  total_units = 24,
  building_age = 9,
  building_type = 'apartment-block',
  service_charge_frequency = 'quarterly',
  management_type = 'Share of Freehold',
  management_structure = 'share-of-freehold'
WHERE id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';

-- Add maintenance issues
INSERT INTO issues (building_id, title, description, category, priority, status, reported_by, created_at)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  title,
  description,
  category,
  priority,
  status,
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com'),
  created_at
FROM (VALUES
  -- Urgent/In-Progress
  ('Water leak in Unit 204', 'Active water leak from ceiling, affecting bathroom and hallway', 'Plumbing', 'High', 'In Progress', NOW() - INTERVAL '2 days'),
  ('Elevator malfunction', 'Main elevator stopping between floors, requires immediate attention', 'Mechanical', 'Critical', 'In Progress', NOW() - INTERVAL '1 day'),
  ('HVAC repair for common area', 'Common area heating system not functioning properly', 'HVAC', 'High', 'In Progress', NOW() - INTERVAL '3 days'),
  ('Garage door sensor replacement', 'Safety sensors malfunctioning, door not closing properly', 'Electrical', 'Medium', 'In Progress', NOW() - INTERVAL '4 days'),
  ('Security camera system upgrade', 'Multiple cameras offline, system requires upgrade', 'Security', 'High', 'In Progress', NOW() - INTERVAL '5 days'),

  -- Completed
  ('Lobby lighting replacement', 'Replaced all lobby light fixtures with LED units', 'Electrical', 'Medium', 'Completed', NOW() - INTERVAL '15 days'),
  ('Window cleaning', 'Quarterly external window cleaning completed', 'Maintenance', 'Low', 'Completed', NOW() - INTERVAL '20 days'),
  ('Fire alarm testing', 'Annual fire alarm system inspection and testing', 'Safety', 'High', 'Completed', NOW() - INTERVAL '25 days'),
  ('Roof inspection', 'Regular roof inspection and minor repairs', 'Maintenance', 'Medium', 'Completed', NOW() - INTERVAL '30 days'),
  ('Intercom system repair', 'Fixed connection issues with building intercom', 'Electrical', 'Medium', 'Completed', NOW() - INTERVAL '35 days'),
  ('Garden maintenance', 'Spring garden maintenance and planting', 'Grounds', 'Low', 'Completed', NOW() - INTERVAL '40 days'),
  ('Pest control treatment', 'Preventive pest control treatment completed', 'Maintenance', 'Medium', 'Completed', NOW() - INTERVAL '45 days'),
  ('Parking lot repainting', 'Refreshed parking space lines and signage', 'Maintenance', 'Low', 'Completed', NOW() - INTERVAL '50 days'),

  -- Scheduled
  ('Annual boiler service', 'Schedule annual boiler maintenance and inspection', 'HVAC', 'Medium', 'Scheduled', NOW() + INTERVAL '5 days'),
  ('Carpet cleaning', 'Deep clean all common area carpets', 'Maintenance', 'Low', 'Scheduled', NOW() + INTERVAL '10 days'),
  ('Fire door inspection', 'Quarterly fire door inspection and maintenance', 'Safety', 'Medium', 'Scheduled', NOW() + INTERVAL '15 days'),
  ('Gutter cleaning', 'Clean and inspect all building gutters', 'Maintenance', 'Medium', 'Scheduled', NOW() + INTERVAL '20 days'),
  ('External painting', 'Touch up external paintwork where needed', 'Maintenance', 'Low', 'Scheduled', NOW() + INTERVAL '25 days'),
  ('Lift annual service', 'Complete annual lift service and certification', 'Mechanical', 'High', 'Scheduled', NOW() + INTERVAL '30 days'),
  ('Security system audit', 'Review and update security protocols', 'Security', 'Medium', 'Scheduled', NOW() + INTERVAL '35 days')
) AS t(title, description, category, priority, status, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM issues 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add announcements
INSERT INTO announcements (building_id, title, content, category, posted_by, is_pinned, created_at)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  title,
  content,
  category,
  (SELECT id FROM auth.users WHERE email = 'sof@demo.com'),
  is_pinned,
  created_at
FROM (VALUES
  -- High priority
  ('Emergency Maintenance: Lift Repair', 'Main lift will undergo emergency repairs on Tuesday. Engineers will be on site from 9 AM.', 'Maintenance', true, NOW() - INTERVAL '2 days'),
  ('Important: Fire Safety Inspection', 'Annual fire safety inspection scheduled for next week. Access required to all units.', 'Safety', true, NOW() - INTERVAL '4 days'),
  ('Security System Upgrade Notice', 'Building security system will be upgraded next month. New key fobs will be distributed.', 'Security', true, NOW() - INTERVAL '6 days'),

  -- Medium priority
  ('Summer Garden Maintenance', 'Garden maintenance work scheduled for next week. Please avoid using the garden area.', 'Maintenance', false, NOW() - INTERVAL '8 days'),
  ('Quarterly Service Charge Update', 'Q2 service charge statements have been issued. Please check your email.', 'Financial', false, NOW() - INTERVAL '10 days'),
  ('New Waste Management Schedule', 'Updated recycling and waste collection schedule now available in the lobby.', 'General', false, NOW() - INTERVAL '12 days'),
  ('Building Insurance Renewal', 'Building insurance has been renewed. Updated certificates available in the portal.', 'Administrative', false, NOW() - INTERVAL '14 days'),

  -- Low priority
  ('Community Newsletter: June 2025', 'Monthly newsletter with updates on building improvements and community events.', 'Community', false, NOW() - INTERVAL '16 days'),
  ('Window Cleaning Schedule', 'External window cleaning scheduled for next month. Dates per floor in attachment.', 'Maintenance', false, NOW() - INTERVAL '18 days'),
  ('Updated Resident Directory', 'Building resident directory has been updated. Available in the secure portal.', 'Administrative', false, NOW() - INTERVAL '20 days')
) AS t(title, content, category, is_pinned, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM announcements 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add polls
INSERT INTO polls (building_id, title, description, category, required_majority, start_date, end_date, status, created_by)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  title,
  description,
  category,
  required_majority,
  start_date,
  end_date,
  status,
  (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
FROM (VALUES
  -- Completed polls
  ('Board Member Election 2025', 'Annual election of Share of Freehold board members', 'Administrative', 50, NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days', 'completed'),
  ('Building Improvement Fund', 'Approval for creation of building improvement sinking fund', 'Financial', 75, NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days', 'completed'),
  ('Updated Pet Policy', 'Revised pet policy for building residents', 'Policy', 50, NOW() - INTERVAL '120 days', NOW() - INTERVAL '90 days', 'completed'),

  -- Active polls
  ('Landscape Renovation Proposal', 'Approval for garden redesign and new planting scheme', 'Building Improvement', 50, NOW(), NOW() + INTERVAL '14 days', 'active'),
  ('Security System Upgrade', 'Proposal for enhanced building security measures', 'Security', 75, NOW(), NOW() + INTERVAL '21 days', 'active'),

  -- Upcoming polls
  ('2026 Budget Approval', 'Review and approval of annual building budget', 'Financial', 75, NOW() + INTERVAL '30 days', NOW() + INTERVAL '60 days', 'upcoming'),
  ('Common Area Usage Policy', 'Updated rules for common area facilities', 'Policy', 50, NOW() + INTERVAL '45 days', NOW() + INTERVAL '75 days', 'upcoming'),
  ('Electric Vehicle Charging', 'Installation of EV charging points in car park', 'Building Improvement', 75, NOW() + INTERVAL '60 days', NOW() + INTERVAL '90 days', 'upcoming')
) AS t(title, description, category, required_majority, start_date, end_date, status)
WHERE NOT EXISTS (
  SELECT 1 FROM polls 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add financial records
INSERT INTO transactions (building_id, amount, description, category, transaction_date, created_by)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  amount,
  description,
  category,
  transaction_date,
  (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
FROM (VALUES
  -- Income
  (15000.00, 'Q1 Service Charge Collection', 'Income', NOW() - INTERVAL '90 days'),
  (15000.00, 'Q2 Service Charge Collection', 'Income', NOW() - INTERVAL '1 day'),
  (2500.00, 'Late Payment Fees', 'Income', NOW() - INTERVAL '15 days'),
  (1000.00, 'Common Area Booking Fees', 'Income', NOW() - INTERVAL '7 days'),

  -- Expenses
  (-4500.00, 'Building Insurance Premium', 'Insurance', NOW() - INTERVAL '45 days'),
  (-2800.00, 'Monthly Cleaning Service', 'Maintenance', NOW() - INTERVAL '15 days'),
  (-3500.00, 'Emergency Lighting Repair', 'Repairs', NOW() - INTERVAL '10 days'),
  (-1200.00, 'Garden Maintenance', 'Maintenance', NOW() - INTERVAL '5 days'),
  (-2500.00, 'Fire Safety Inspection', 'Safety', NOW() - INTERVAL '20 days'),
  (-1800.00, 'Elevator Maintenance Contract', 'Maintenance', NOW() - INTERVAL '25 days'),
  (-950.00, 'Window Cleaning', 'Cleaning', NOW() - INTERVAL '30 days'),
  (-750.00, 'Pest Control Service', 'Maintenance', NOW() - INTERVAL '35 days'),
  (-1500.00, 'Security System Maintenance', 'Security', NOW() - INTERVAL '40 days'),
  (-2200.00, 'Plumbing Repairs', 'Repairs', NOW() - INTERVAL '12 days')
) AS t(amount, description, category, transaction_date)
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add budgets
INSERT INTO budgets (building_id, year, quarter, category, amount)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  2025,
  quarter,
  category,
  amount
FROM (VALUES
  (1, 'Insurance', 18000.00),
  (1, 'Maintenance', 24000.00),
  (1, 'Utilities', 12000.00),
  (1, 'Cleaning', 9600.00),
  (1, 'Security', 7200.00),
  (1, 'Reserve Fund', 15000.00),
  
  (2, 'Insurance', 18000.00),
  (2, 'Maintenance', 24000.00),
  (2, 'Utilities', 12000.00),
  (2, 'Cleaning', 9600.00),
  (2, 'Security', 7200.00),
  (2, 'Reserve Fund', 15000.00),
  
  (3, 'Insurance', 18000.00),
  (3, 'Maintenance', 24000.00),
  (3, 'Utilities', 12000.00),
  (3, 'Cleaning', 9600.00),
  (3, 'Security', 7200.00),
  (3, 'Reserve Fund', 15000.00),
  
  (4, 'Insurance', 18000.00),
  (4, 'Maintenance', 24000.00),
  (4, 'Utilities', 12000.00),
  (4, 'Cleaning', 9600.00),
  (4, 'Security', 7200.00),
  (4, 'Reserve Fund', 15000.00)
) AS t(quarter, category, amount)
WHERE NOT EXISTS (
  SELECT 1 FROM budgets 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND year = 2025
);

-- Add service charges
INSERT INTO service_charges (building_id, unit_id, amount, due_date, paid_date, status)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  u.id,
  CASE 
    WHEN u.floor_plan_type = '2 Bedroom' THEN 750.00
    WHEN u.floor_plan_type = '1 Bedroom' THEN 625.00
    ELSE 500.00
  END,
  due_date,
  CASE 
    WHEN RANDOM() > 0.2 THEN due_date - INTERVAL '5 days'
    ELSE NULL
  END,
  CASE 
    WHEN RANDOM() > 0.2 THEN 'Paid'
    ELSE 'Pending'
  END
FROM units u
CROSS JOIN (
  VALUES 
    (NOW() - INTERVAL '3 months'),
    (NOW()),
    (NOW() + INTERVAL '3 months')
) AS dates(due_date)
WHERE u.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
AND NOT EXISTS (
  SELECT 1 FROM service_charges 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);