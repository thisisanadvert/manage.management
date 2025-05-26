/*
  # Role Improvements and Future-Proofing

  1. New Tables
    - `building_metrics`: Track key building performance indicators
    - `building_health`: Monitor building condition and maintenance
    - `compliance_requirements`: Track regulatory compliance
    - `compliance_records`: Store compliance check history
    - `maintenance_schedule`: Planned maintenance tracking
    - `service_bookings`: Homeowner service scheduling

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Maintain role-based permissions
*/

-- Building metrics table
CREATE TABLE IF NOT EXISTS building_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  metric_type text NOT NULL,
  value jsonb NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Building health tracking
CREATE TABLE IF NOT EXISTS building_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  metric_type text NOT NULL,
  value numeric NOT NULL,
  status text NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- Compliance requirements
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  requirement_type text NOT NULL,
  description text NOT NULL,
  frequency text NOT NULL,
  last_checked timestamptz,
  next_due timestamptz NOT NULL
);

-- Compliance records
CREATE TABLE IF NOT EXISTS compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  requirement_id uuid REFERENCES compliance_requirements(id),
  status text NOT NULL,
  checked_at timestamptz NOT NULL,
  checked_by uuid REFERENCES auth.users(id),
  notes text,
  documents jsonb,
  created_at timestamptz DEFAULT now()
);

-- Maintenance schedule
CREATE TABLE IF NOT EXISTS maintenance_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  title text NOT NULL,
  description text,
  frequency text NOT NULL,
  last_completed timestamptz,
  next_due timestamptz NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service bookings
CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  unit_id uuid REFERENCES units(id),
  user_id uuid REFERENCES auth.users(id),
  service_type text NOT NULL,
  requested_date timestamptz NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE building_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Building metrics
CREATE POLICY "Users can view metrics for their buildings"
  ON building_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = building_metrics.building_id
    AND building_users.user_id = auth.uid()
  ));

-- Building health
CREATE POLICY "Users can view health metrics for their buildings"
  ON building_health FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = building_health.building_id
    AND building_users.user_id = auth.uid()
  ));

-- Compliance requirements
CREATE POLICY "Users can view compliance requirements for their buildings"
  ON compliance_requirements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = compliance_requirements.building_id
    AND building_users.user_id = auth.uid()
  ));

CREATE POLICY "Directors can manage compliance requirements"
  ON compliance_requirements
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = compliance_requirements.building_id
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('rtm-director', 'sof-director')
  ));

-- Compliance records
CREATE POLICY "Users can view compliance records for their buildings"
  ON compliance_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = compliance_records.building_id
    AND building_users.user_id = auth.uid()
  ));

CREATE POLICY "Directors can manage compliance records"
  ON compliance_records
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = compliance_records.building_id
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('rtm-director', 'sof-director')
  ));

-- Maintenance schedule
CREATE POLICY "Users can view maintenance schedule for their buildings"
  ON maintenance_schedule FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = maintenance_schedule.building_id
    AND building_users.user_id = auth.uid()
  ));

CREATE POLICY "Directors can manage maintenance schedule"
  ON maintenance_schedule
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = maintenance_schedule.building_id
    AND building_users.user_id = auth.uid()
    AND building_users.role IN ('rtm-director', 'sof-director')
  ));

-- Service bookings
CREATE POLICY "Users can view their own service bookings"
  ON service_bookings FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = service_bookings.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'sof-director', 'management-company')
    )
  );

CREATE POLICY "Users can create service bookings"
  ON service_bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = service_bookings.building_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Add demo data
INSERT INTO compliance_requirements (building_id, requirement_type, description, frequency, next_due)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  requirement_type,
  description,
  frequency,
  next_due
FROM (VALUES
  ('Fire Safety', 'Annual fire safety inspection and certification', 'yearly', NOW() + INTERVAL '3 months'),
  ('Electrical', 'Five-year electrical installation condition report', 'five-yearly', NOW() + INTERVAL '2 years'),
  ('Asbestos', 'Asbestos management survey and risk assessment', 'three-yearly', NOW() + INTERVAL '1 year'),
  ('Gas Safety', 'Annual gas safety inspection for common areas', 'yearly', NOW() + INTERVAL '6 months'),
  ('Insurance', 'Building insurance renewal and compliance check', 'yearly', NOW() + INTERVAL '8 months')
) AS t(requirement_type, description, frequency, next_due)
WHERE NOT EXISTS (
  SELECT 1 FROM compliance_requirements 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add maintenance schedule
INSERT INTO maintenance_schedule (building_id, title, description, frequency, next_due, status)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  title,
  description,
  frequency,
  next_due,
  status
FROM (VALUES
  ('Quarterly Fire Alarm Test', 'Test all fire alarms and emergency lighting', 'quarterly', NOW() + INTERVAL '2 months', 'scheduled'),
  ('Annual Boiler Service', 'Full service and efficiency check of building boilers', 'yearly', NOW() + INTERVAL '5 months', 'scheduled'),
  ('Monthly Lift Inspection', 'Safety check and maintenance of all lifts', 'monthly', NOW() + INTERVAL '2 weeks', 'scheduled'),
  ('Bi-annual Window Cleaning', 'External window cleaning for all floors', 'bi-annual', NOW() + INTERVAL '1 month', 'scheduled'),
  ('Weekly Garden Maintenance', 'Regular garden upkeep and seasonal planting', 'weekly', NOW() + INTERVAL '5 days', 'scheduled')
) AS t(title, description, frequency, next_due, status)
WHERE NOT EXISTS (
  SELECT 1 FROM maintenance_schedule 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add building metrics
INSERT INTO building_metrics (building_id, metric_type, value, period_start, period_end)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  metric_type,
  value,
  NOW() - INTERVAL '1 month',
  NOW()
FROM (VALUES
  ('occupancy', '{"total": 24, "occupied": 22, "vacant": 2}'::jsonb),
  ('service_charge', '{"total_due": 45000, "collected": 42500, "outstanding": 2500}'::jsonb),
  ('maintenance', '{"total": 15, "completed": 12, "in_progress": 2, "pending": 1}'::jsonb),
  ('energy', '{"electricity": 12500, "gas": 8500, "water": 3500}'::jsonb)
) AS t(metric_type, value)
WHERE NOT EXISTS (
  SELECT 1 FROM building_metrics 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);