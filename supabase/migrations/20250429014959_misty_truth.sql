-- Update demo building with additional details
UPDATE buildings 
SET 
  building_age = 9,
  building_type = 'apartment-block',
  service_charge_frequency = 'quarterly',
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
  ('External lighting failure', 'Three exterior lights on west side not working', 'Electrical', 'Low', 'Reported'),
  ('Intercom system malfunction', 'Intercom not working for units 3A through 5B', 'Electrical', 'Medium', 'In Progress'),
  ('Garden area maintenance', 'Overgrown plants and dead vegetation need removal', 'Grounds', 'Low', 'Scheduled')
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
  ('Annual General Meeting Scheduled', 'The AGM has been scheduled for June 15th at 7 PM in the community room. All leaseholders are encouraged to attend.', 'Meeting', true),
  ('Summer Maintenance Projects', 'Upcoming facade cleaning and landscaping projects planned for July. Work expected to take 3 weeks.', 'Maintenance', false),
  ('New Security System Installation', 'Installation of upgraded security system starting next month. New key fobs will be distributed.', 'Security', false),
  ('Updated Building Rules', 'Please review the updated building rules regarding noise policy and communal spaces.', 'General', false)
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
    'Vote on the proposed 3-year contract with Apex Management Services at £24,000 per year',
    'Contract',
    75,
    NOW(),
    NOW() + INTERVAL '14 days',
    'active'
  ),
  (
    'Major Works Funding Decision',
    'Approval for facade repairs at a cost of £85,000 from reserve fund',
    'Financial',
    50,
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '21 days',
    'upcoming'
  ),
  (
    'Garden Redesign Project',
    'Approve the proposed garden redesign by Green Spaces Ltd at £12,500',
    'Building Improvement',
    50,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '1 day',
    'completed'
  ),
  (
    'Electric Vehicle Charging Points',
    'Installation of 5 EV charging points in parking area at £12,000',
    'Building Improvement',
    50,
    NOW(),
    NOW() + INTERVAL '14 days',
    'active'
  )
) AS t(title, description, category, required_majority, start_date, end_date, status)
WHERE NOT EXISTS (
  SELECT 1 FROM polls WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add sample poll votes
INSERT INTO poll_votes (poll_id, user_id, vote)
SELECT 
  p.id,
  u.id,
  'yes'
FROM polls p
CROSS JOIN auth.users u
WHERE p.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND u.email = 'rtm@demo.com'
  AND NOT EXISTS (
    SELECT 1 FROM poll_votes 
    WHERE poll_id = p.id AND user_id = u.id
  );