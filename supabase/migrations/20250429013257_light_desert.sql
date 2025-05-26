/*
  # Add Demo Data

  1. Changes
    - Add sample issues for demo building
    - Add sample announcements
    - Add sample polls
    - Update building details

  2. Security
    - Only affects demo building
*/

-- Update demo building with additional details
UPDATE buildings 
SET 
  building_age = 9,
  building_type = 'Apartment Block',
  service_charge_frequency = 'Quarterly',
  management_type = 'RTM'
WHERE id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';

-- Add sample issues
INSERT INTO issues (building_id, title, description, category, priority, status, reported_by)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  title,
  description,
  category,
  priority,
  status,
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com' LIMIT 1)
FROM (VALUES
  ('Elevator maintenance required', 'Elevator making loud noises when operating above the 3rd floor', 'Mechanical', 'High', 'In Progress'),
  ('Leak in garage ceiling', 'Water leaking from ceiling near parking spaces 12-14', 'Plumbing', 'Medium', 'Scheduled'),
  ('External lighting failure', 'Three exterior lights on west side not working', 'Electrical', 'Low', 'Reported')
) AS t(title, description, category, priority, status)
WHERE NOT EXISTS (
  SELECT 1 FROM issues WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add sample announcements
INSERT INTO announcements (building_id, title, content, category, posted_by, is_pinned)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  title,
  content,
  category,
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com' LIMIT 1),
  is_pinned
FROM (VALUES
  ('Annual General Meeting Scheduled', 'The AGM has been scheduled for June 15th at 7 PM', 'Meeting', true),
  ('Summer Maintenance Projects', 'Upcoming facade cleaning and landscaping projects planned', 'Maintenance', false),
  ('New Security System Installation', 'Installation of upgraded security system starting next month', 'Security', false)
) AS t(title, content, category, is_pinned)
WHERE NOT EXISTS (
  SELECT 1 FROM announcements WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add sample polls
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
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com' LIMIT 1)
FROM (VALUES
  (
    'Building Management Contract Renewal',
    'Vote on the proposed 3-year contract with Apex Management Services',
    'Contract',
    75,
    NOW(),
    NOW() + INTERVAL '14 days',
    'active'
  ),
  (
    'Major Works Funding Decision',
    'Approval for facade repairs at a cost of £85,000',
    'Financial',
    50,
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '21 days',
    'upcoming'
  ),
  (
    'Garden Redesign Project',
    'Approve the proposed garden redesign by Green Spaces Ltd',
    'Building Improvement',
    50,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '1 day',
    'completed'
  )
) AS t(title, description, category, required_majority, start_date, end_date, status)
WHERE NOT EXISTS (
  SELECT 1 FROM polls WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);