/*
  # Add Budget Items and Budget Periods Tables

  1. Problem
    - BudgetsPlanning component is trying to use budget_items and budget_periods tables
    - These tables don't exist in the database
    - Error: relation "budget_items" does not exist

  2. Solution
    - Create budget_items table for individual budget line items
    - Create budget_periods table for quarterly/annual budget periods
    - Add proper RLS policies for building-based access
    - Add indexes for performance
*/

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  quarterly_estimate decimal(10,2) DEFAULT 0,
  annual_estimate decimal(10,2) DEFAULT 0,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  notes text,
  year integer NOT NULL,
  quarter integer, -- NULL for annual items
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget_periods table
CREATE TABLE IF NOT EXISTS budget_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  year integer NOT NULL,
  quarter integer NOT NULL CHECK (quarter IN (1, 2, 3, 4)),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  total_income decimal(10,2) DEFAULT 0,
  total_expenses decimal(10,2) DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(building_id, year, quarter)
);

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for building-based access
CREATE POLICY "Users can access budget items for their buildings" ON budget_items
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access budget periods for their buildings" ON budget_periods
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_budget_items_building_id ON budget_items(building_id);
CREATE INDEX idx_budget_items_year_quarter ON budget_items(year, quarter);
CREATE INDEX idx_budget_items_type ON budget_items(type);
CREATE INDEX idx_budget_periods_building_id ON budget_periods(building_id);
CREATE INDEX idx_budget_periods_year_quarter ON budget_periods(year, quarter);

-- Create triggers for automatic updates
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_periods_updated_at BEFORE UPDATE ON budget_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
