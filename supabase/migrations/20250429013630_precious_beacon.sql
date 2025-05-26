/*
  # Add Supplier Network Schema

  1. New Tables
    - `suppliers`
      - Supplier details and categories
    - `supplier_reviews`
      - Reviews and ratings for suppliers
    - `supplier_services`
      - Services offered by suppliers

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  contact_email text,
  contact_phone text,
  website text,
  address text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create supplier reviews table
CREATE TABLE IF NOT EXISTS supplier_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id),
  reviewer_id uuid REFERENCES auth.users(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create supplier services table
CREATE TABLE IF NOT EXISTS supplier_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id),
  service_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can view suppliers"
  ON suppliers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view supplier reviews"
  ON supplier_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create supplier reviews"
  ON supplier_reviews FOR INSERT
  TO public
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Everyone can view supplier services"
  ON supplier_services FOR SELECT
  TO public
  USING (true);

-- Insert demo suppliers
INSERT INTO suppliers (name, description, category, contact_email, contact_phone, website, address, verified)
VALUES
  ('Apex Property Services', 'Full-service property maintenance company specializing in residential buildings.', 'building', 'info@apexservices.com', '020 1234 5678', 'www.apexservices.com', 'London, 2.3 miles', true),
  ('FlowFix Plumbing', 'Professional plumbing services with 24/7 emergency callout.', 'plumbing', 'service@flowfix.com', '020 2345 6789', 'www.flowfix.com', 'London, 1.8 miles', true),
  ('Bright Spark Electricians', 'NICEIC registered electricians for all electrical work.', 'electrical', 'info@brightspark.com', '020 3456 7890', 'www.brightspark.com', 'London, 3.1 miles', true),
  ('Clean Slate Services', 'Commercial cleaning specialists for residential buildings.', 'cleaning', 'info@cleanslate.com', '020 4567 8901', 'www.cleanslate.com', 'London, 1.4 miles', true),
  ('LockTight Security', 'Security systems and access control specialists.', 'security', 'info@locktight.com', '020 5678 9012', 'www.locktight.com', 'London, 4.2 miles', true),
  ('Green Horizons Landscaping', 'Professional garden maintenance and landscaping.', 'garden', 'info@greenhorizons.com', '020 6789 0123', 'www.greenhorizons.com', 'London, 3.7 miles', false);

-- Insert demo services
INSERT INTO supplier_services (supplier_id, service_name, description)
SELECT 
  s.id,
  unnest(ARRAY[
    'General maintenance',
    'Renovations',
    'Emergency repairs'
  ]),
  'Professional service with quality guarantee'
FROM suppliers s
WHERE s.name = 'Apex Property Services';

INSERT INTO supplier_services (supplier_id, service_name, description)
SELECT 
  s.id,
  unnest(ARRAY[
    'Emergency plumbing',
    'Leak repairs',
    'Bathroom installation'
  ]),
  'Expert plumbing solutions'
FROM suppliers s
WHERE s.name = 'FlowFix Plumbing';

-- Insert demo reviews
INSERT INTO supplier_reviews (supplier_id, reviewer_id, rating, comment)
SELECT 
  s.id,
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com'),
  5,
  'Excellent service, very professional'
FROM suppliers s
WHERE s.name = 'Apex Property Services';

INSERT INTO supplier_reviews (supplier_id, reviewer_id, rating, comment)
SELECT 
  s.id,
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com'),
  4,
  'Good response time, fair prices'
FROM suppliers s
WHERE s.name = 'FlowFix Plumbing';