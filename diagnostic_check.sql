-- DIAGNOSTIC CHECK - Run this to see what's happening
-- This will show us exactly what data exists and what the user should see

-- 1. Check all users
SELECT 'All users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Check all building_users
SELECT 'All building_users records:' as info;
SELECT user_id, building_id, role, created_at FROM building_users ORDER BY created_at DESC;

-- 3. Check buildings
SELECT 'All buildings:' as info;
SELECT id, name, address FROM buildings;

-- 4. Check if there are any management company users
SELECT 'Management company building_users:' as info;
SELECT bu.user_id, bu.building_id, bu.role, au.email, b.name as building_name
FROM building_users bu
LEFT JOIN auth.users au ON bu.user_id = au.id
LEFT JOIN buildings b ON bu.building_id = b.id
WHERE bu.role = 'management-company';

-- 5. Create a management company association if none exists
-- This will associate the first user with the first building as management company
DO $$
DECLARE
    first_user_id uuid;
    first_building_id uuid;
    existing_count integer;
BEGIN
    -- Check if we already have management company associations
    SELECT COUNT(*) INTO existing_count 
    FROM building_users 
    WHERE role = 'management-company';
    
    IF existing_count = 0 THEN
        -- Get first user
        SELECT id INTO first_user_id FROM auth.users LIMIT 1;
        
        -- Get first building
        SELECT id INTO first_building_id FROM buildings LIMIT 1;
        
        IF first_user_id IS NOT NULL AND first_building_id IS NOT NULL THEN
            INSERT INTO building_users (user_id, building_id, role)
            VALUES (first_user_id, first_building_id, 'management-company')
            ON CONFLICT (building_id, user_id) DO UPDATE SET role = 'management-company';
            
            RAISE NOTICE 'Created management company association: user % with building %', first_user_id, first_building_id;
        END IF;
    ELSE
        RAISE NOTICE 'Management company associations already exist: %', existing_count;
    END IF;
END $$;

-- 6. Final verification
SELECT 'Final check - Management company associations:' as info;
SELECT bu.user_id, bu.building_id, bu.role, au.email, b.name as building_name
FROM building_users bu
LEFT JOIN auth.users au ON bu.user_id = au.id
LEFT JOIN buildings b ON bu.building_id = b.id
WHERE bu.role = 'management-company';
