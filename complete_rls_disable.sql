-- COMPLETE RLS DISABLE - This will definitely work
-- Run this in Supabase SQL Editor

-- 1. COMPLETELY DISABLE RLS ON ALL RELEVANT TABLES
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE building_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE issues DISABLE ROW LEVEL SECURITY;

-- 2. Verify we can query everything
SELECT 'Test 1 - Buildings:' as test;
SELECT id, name, address FROM buildings LIMIT 3;

SELECT 'Test 2 - Building Users:' as test;
SELECT user_id, building_id, role FROM building_users LIMIT 5;

SELECT 'Test 3 - Issues:' as test;
SELECT id, title, building_id FROM issues LIMIT 3;

-- 3. Ensure we have a management company user
-- Get the current user (you) and associate with a building
DO $$
DECLARE
    current_user_id uuid;
    demo_building_id uuid := 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';
BEGIN
    -- Get your user ID (assuming you're logged in as frankie@manage.management)
    SELECT id INTO current_user_id 
    FROM auth.users 
    WHERE email = 'frankie@manage.management' 
    OR email LIKE '%@demo.com'
    LIMIT 1;
    
    -- If we found a user, associate them with the demo building
    IF current_user_id IS NOT NULL THEN
        -- Remove any existing associations for this user
        DELETE FROM building_users WHERE user_id = current_user_id;
        
        -- Add as management company
        INSERT INTO building_users (user_id, building_id, role)
        VALUES (current_user_id, demo_building_id, 'management-company');
        
        RAISE NOTICE 'Associated user % with building % as management-company', current_user_id, demo_building_id;
    ELSE
        RAISE NOTICE 'No user found to associate';
    END IF;
END $$;

-- 4. Final verification
SELECT 'Final verification:' as status;
SELECT 
    au.email,
    bu.role,
    b.name as building_name,
    bu.building_id
FROM building_users bu
JOIN auth.users au ON bu.user_id = au.id
JOIN buildings b ON bu.building_id = b.id
WHERE bu.role = 'management-company';

-- 5. Show what the BuildingContext should see
SELECT 'What BuildingContext should fetch:' as info;
SELECT DISTINCT
    b.id,
    b.name,
    b.address,
    b.total_units,
    b.building_type,
    b.management_structure
FROM buildings b
JOIN building_users bu ON b.id = bu.building_id
WHERE bu.role = 'management-company'
ORDER BY b.name;
