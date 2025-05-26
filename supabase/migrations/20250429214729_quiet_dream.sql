/*
  # Add Financial Data for Demo Accounts

  1. New Tables
    - `transactions`
      - Service charge payments
      - Maintenance expenses
      - Building improvements
    - `budgets`
      - Annual and quarterly budgets
      - Expense categories
    - `service_charges`
      - Service charge schedules
      - Payment tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  amount decimal NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  transaction_date timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  year integer NOT NULL,
  quarter integer,
  category text NOT NULL,
  amount decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create service_charges table
CREATE TABLE IF NOT EXISTS service_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  unit_id uuid REFERENCES units(id),
  amount decimal NOT NULL,
  due_date timestamptz NOT NULL,
  paid_date timestamptz,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view transactions in their buildings"
  ON transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = transactions.building_id
    AND building_users.user_id = auth.uid()
  ));

CREATE POLICY "Users can view budgets in their buildings"
  ON budgets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = budgets.building_id
    AND building_users.user_id = auth.uid()
  ));

CREATE POLICY "Users can view service charges in their buildings"
  ON service_charges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = service_charges.building_id
    AND building_users.user_id = auth.uid()
  ));

-- Add sample transactions for demo building
INSERT INTO transactions (building_id, amount, description, category, transaction_date, created_by)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  amount,
  description,
  category,
  transaction_date,
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com')
FROM (VALUES
  (2500.00, 'Q1 Service Charge Collection', 'Income', NOW() - INTERVAL '2 months'),
  (-850.00, 'Building Insurance Premium', 'Insurance', NOW() - INTERVAL '45 days'),
  (-450.00, 'Monthly Cleaning Service', 'Maintenance', NOW() - INTERVAL '15 days'),
  (-1200.00, 'Emergency Lighting Repair', 'Repairs', NOW() - INTERVAL '10 days'),
  (2500.00, 'Q2 Service Charge Collection', 'Income', NOW() - INTERVAL '5 days'),
  (-350.00, 'Garden Maintenance', 'Maintenance', NOW() - INTERVAL '2 days')
) AS t(amount, description, category, transaction_date)
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add sample budgets
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
  (2, 'Insurance', 3400.00),
  (2, 'Maintenance', 4800.00),
  (2, 'Utilities', 2400.00),
  (2, 'Cleaning', 1800.00),
  (3, 'Insurance', 3400.00),
  (3, 'Maintenance', 4800.00),
  (3, 'Utilities', 2400.00),
  (3, 'Cleaning', 1800.00),
  (4, 'Insurance', 3400.00),
  (4, 'Maintenance', 4800.00),
  (4, 'Utilities', 2400.00),
  (4, 'Cleaning', 1800.00)
) AS t(quarter, category, amount)
WHERE NOT EXISTS (
  SELECT 1 FROM budgets 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add sample service charges
INSERT INTO service_charges (building_id, unit_id, amount, due_date, paid_date, status)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  u.id,
  625.00,
  due_date,
  CASE 
    WHEN RANDOM() > 0.3 THEN due_date - INTERVAL '5 days'
    ELSE NULL
  END,
  CASE 
    WHEN RANDOM() > 0.3 THEN 'Paid'
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