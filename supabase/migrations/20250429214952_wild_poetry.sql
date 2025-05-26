/*
  # Add Financial Data for Demo Accounts

  1. Changes
    - Add sample transactions for demo building
    - Add quarterly budgets for 2025
    - Add service charge records
    - Update building financial details

  2. Security
    - Maintains existing RLS policies
*/

-- Add sample transactions for demo building
INSERT INTO transactions (building_id, amount, description, category, transaction_date, created_by)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  amount,
  description,
  category,
  transaction_date,
  (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
FROM (VALUES
  (2500.00, 'Q1 Service Charge Collection', 'Income', NOW() - INTERVAL '2 months'),
  (-850.00, 'Building Insurance Premium', 'Insurance', NOW() - INTERVAL '45 days'),
  (-450.00, 'Monthly Cleaning Service', 'Maintenance', NOW() - INTERVAL '15 days'),
  (-1200.00, 'Emergency Lighting Repair', 'Repairs', NOW() - INTERVAL '10 days'),
  (2500.00, 'Q2 Service Charge Collection', 'Income', NOW() - INTERVAL '5 days'),
  (-350.00, 'Garden Maintenance', 'Maintenance', NOW() - INTERVAL '2 days'),
  (-750.00, 'Fire Safety Inspection', 'Safety', NOW() - INTERVAL '7 days'),
  (-980.00, 'Elevator Maintenance Contract', 'Maintenance', NOW() - INTERVAL '12 days'),
  (-250.00, 'Window Cleaning', 'Cleaning', NOW() - INTERVAL '3 days'),
  (1200.00, 'Late Service Charge Payment', 'Income', NOW() - INTERVAL '1 day')
) AS t(amount, description, category, transaction_date)
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add quarterly budgets for 2025
INSERT INTO budgets (building_id, year, quarter, category, amount)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  2025,
  quarter,
  category,
  amount
FROM (VALUES
  (1, 'Insurance', 3400.00),
  (1, 'Maintenance', 4800.00),
  (1, 'Utilities', 2400.00),
  (1, 'Cleaning', 1800.00),
  (1, 'Reserve Fund', 2000.00),
  (2, 'Insurance', 3400.00),
  (2, 'Maintenance', 4800.00),
  (2, 'Utilities', 2400.00),
  (2, 'Cleaning', 1800.00),
  (2, 'Reserve Fund', 2000.00),
  (3, 'Insurance', 3400.00),
  (3, 'Maintenance', 4800.00),
  (3, 'Utilities', 2400.00),
  (3, 'Cleaning', 1800.00),
  (3, 'Reserve Fund', 2000.00),
  (4, 'Insurance', 3400.00),
  (4, 'Maintenance', 4800.00),
  (4, 'Utilities', 2400.00),
  (4, 'Cleaning', 1800.00),
  (4, 'Reserve Fund', 2000.00)
) AS t(quarter, category, amount)
WHERE NOT EXISTS (
  SELECT 1 FROM budgets 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND year = 2025
);

-- Add service charge records
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