-- First, clear any existing poll data
DELETE FROM poll_votes WHERE poll_id IN (
  SELECT id FROM polls WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);
DELETE FROM polls WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';

-- Add comprehensive poll data
INSERT INTO polls (building_id, title, description, category, required_majority, start_date, end_date, status, created_by)
VALUES
  -- Completed polls (Policy Changes)
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Updated Pet Policy 2025',
    'Proposal to update building pet policy to allow cats and small dogs under 15kg. Includes new registration requirements and responsible pet ownership guidelines.',
    'Policy',
    75,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '30 days',
    'completed',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Noise Policy Amendment',
    'Proposed changes to quiet hours and construction work timing restrictions. New quiet hours: 10 PM - 8 AM weekdays, 11 PM - 9 AM weekends.',
    'Policy',
    50,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '60 days',
    'completed',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),

  -- Completed polls (Financial Decisions)
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Reserve Fund Increase',
    'Proposal to increase monthly reserve fund contribution by 10% to ensure adequate funding for future major works.',
    'Financial',
    75,
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '90 days',
    'completed',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Building Insurance Renewal',
    'Approval for new building insurance policy with enhanced coverage for flood and subsidence risks.',
    'Financial',
    75,
    NOW() - INTERVAL '150 days',
    NOW() - INTERVAL '120 days',
    'completed',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),

  -- Active polls (Building Improvements)
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Electric Vehicle Charging Installation',
    'Installation of 5 EV charging points in residents parking area. Total cost: £12,500 from reserve fund.',
    'Building Improvement',
    75,
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    'active',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Garden Redesign Project',
    'Comprehensive garden redesign including new seating area, improved lighting, and sustainable planting. Budget: £15,000.',
    'Building Improvement',
    50,
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '16 days',
    'active',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Security System Upgrade',
    'Installation of new HD CCTV cameras and upgraded door entry system. Total cost: £18,500.',
    'Security',
    75,
    NOW(),
    NOW() + INTERVAL '21 days',
    'active',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),

  -- Scheduled polls (Future Decisions)
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Annual Budget 2026',
    'Review and approval of proposed building budget for 2026, including service charge calculations.',
    'Financial',
    75,
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    'upcoming',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Major Works Program',
    'Five-year major works program including facade repairs, window replacement, and roof maintenance.',
    'Building Improvement',
    75,
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '75 days',
    'upcoming',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  ),
  (
    'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
    'Building Management Contract',
    'Renewal of building management contract with current provider for next 3 years.',
    'Administrative',
    75,
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '90 days',
    'upcoming',
    (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
  );

-- Add vote records for completed polls
INSERT INTO poll_votes (poll_id, user_id, vote, created_at)
SELECT 
  p.id,
  u.id,
  'yes',
  p.start_date + INTERVAL '5 days'
FROM polls p
CROSS JOIN auth.users u
WHERE p.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND p.status = 'completed'
  AND u.email IN ('rtm@demo.com', 'sof@demo.com', 'shareholder@demo.com')
  AND p.title IN ('Updated Pet Policy 2025', 'Reserve Fund Increase', 'Building Insurance Renewal');

-- Add no votes for completed polls
INSERT INTO poll_votes (poll_id, user_id, vote, created_at)
SELECT 
  p.id,
  u.id,
  'no',
  p.start_date + INTERVAL '5 days'
FROM polls p
CROSS JOIN auth.users u
WHERE p.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND p.status = 'completed'
  AND u.email = 'leaseholder@demo.com'
  AND p.title IN ('Updated Pet Policy 2025', 'Reserve Fund Increase', 'Building Insurance Renewal');

-- Add mixed votes for Noise Policy Amendment
INSERT INTO poll_votes (poll_id, user_id, vote, created_at)
SELECT 
  p.id,
  u.id,
  CASE WHEN u.email IN ('rtm@demo.com', 'leaseholder@demo.com') THEN 'yes' ELSE 'no' END,
  p.start_date + INTERVAL '5 days'
FROM polls p
CROSS JOIN auth.users u
WHERE p.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND p.status = 'completed'
  AND p.title = 'Noise Policy Amendment'
  AND u.email != 'management@demo.com';

-- Add votes for active polls
INSERT INTO poll_votes (poll_id, user_id, vote, created_at)
SELECT 
  p.id,
  u.id,
  'yes',
  NOW() - INTERVAL '2 days'
FROM polls p
CROSS JOIN auth.users u
WHERE p.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND p.status = 'active'
  AND (
    (u.email IN ('rtm@demo.com', 'sof@demo.com'))
    OR (u.email = 'shareholder@demo.com' AND p.title = 'Electric Vehicle Charging Installation')
    OR (u.email = 'leaseholder@demo.com' AND p.title = 'Garden Redesign Project')
  );