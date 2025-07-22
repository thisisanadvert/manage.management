-- IMMEDIATE DEMO FIX - Run this in Supabase SQL Editor
-- This will fix both the building selector and add demo issues

-- 1. FIX BUILDING SELECTOR RLS POLICY
-- Drop any conflicting policies
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
DROP POLICY IF EXISTS "management_company_view_buildings" ON buildings;

-- Create a working policy for buildings
CREATE POLICY "users_can_view_their_buildings"
ON buildings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = buildings.id
    AND building_users.user_id = auth.uid()
  )
);

-- 2. VERIFY BUILDING DATA EXISTS
-- Check current buildings and building_users
SELECT 'Current buildings:' as status;
SELECT id, name, address FROM buildings ORDER BY name;

SELECT 'Current building_users for management companies:' as status;
SELECT bu.user_id, bu.building_id, bu.role, b.name as building_name
FROM building_users bu
JOIN buildings b ON b.id = bu.building_id
WHERE bu.role = 'management-company'
ORDER BY b.name;

-- 3. ADD DEMO ISSUES FOR TOMORROW'S DEMO
-- First, let's get the demo building ID
DO $$
DECLARE
    demo_building_id uuid := 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';
    mgmt_user_id uuid;
BEGIN
    -- Get a management company user ID
    SELECT user_id INTO mgmt_user_id 
    FROM building_users 
    WHERE role = 'management-company' 
    LIMIT 1;

    -- If no management user found, use the demo building user
    IF mgmt_user_id IS NULL THEN
        SELECT user_id INTO mgmt_user_id 
        FROM building_users 
        WHERE building_id = demo_building_id 
        LIMIT 1;
    END IF;

    -- Clear existing demo issues to avoid duplicates
    DELETE FROM issues WHERE building_id = demo_building_id;

    -- Insert demo issues for the demo
    INSERT INTO issues (building_id, title, description, category, priority, status, reported_by, created_at) VALUES
    (demo_building_id, 'Lift Out of Service - Urgent Repair Needed', 'The main passenger lift has been out of service since Monday morning. Residents on upper floors are having difficulty accessing their flats. Engineer has been contacted and parts are on order.', 'mechanical', 'Critical', 'In Progress', mgmt_user_id, NOW() - INTERVAL '2 days'),
    
    (demo_building_id, 'Communal Garden Gate Lock Broken', 'The electronic lock on the communal garden gate is not working properly. Residents are unable to access the garden area. The lock appears to be jammed and may need replacement.', 'security', 'High', 'Reported', mgmt_user_id, NOW() - INTERVAL '1 day'),
    
    (demo_building_id, 'Water Pressure Issues in Flats 15-20', 'Multiple residents have reported low water pressure in their flats. The issue seems to be affecting the upper floors primarily. Plumber scheduled to investigate the main water pump system.', 'plumbing', 'High', 'Scheduled', mgmt_user_id, NOW() - INTERVAL '3 hours'),
    
    (demo_building_id, 'Heating System Annual Service Due', 'The communal heating system requires its annual service and safety inspection. This is a regulatory requirement and must be completed before the winter season.', 'heating', 'Medium', 'Scheduled', mgmt_user_id, NOW() - INTERVAL '1 hour'),
    
    (demo_building_id, 'Entrance Hall Light Flickering', 'The main entrance hall light has been flickering intermittently. This could be a wiring issue or a faulty bulb. Electrician to investigate and replace if necessary.', 'electrical', 'Medium', 'Reported', mgmt_user_id, NOW() - INTERVAL '6 hours'),
    
    (demo_building_id, 'Fire Alarm System Monthly Test', 'Monthly fire alarm system test completed successfully. All smoke detectors and alarm points are functioning correctly. Next test scheduled for next month.', 'safety', 'Low', 'Completed', mgmt_user_id, NOW() - INTERVAL '5 days'),
    
    (demo_building_id, 'Roof Gutter Cleaning Required', 'Annual roof gutter cleaning is due. Some debris has been noticed and should be cleared before the winter weather arrives. Contractor to be scheduled.', 'maintenance', 'Medium', 'Reported', mgmt_user_id, NOW() - INTERVAL '2 hours'),
    
    (demo_building_id, 'Intercom System Upgrade Complete', 'The building intercom system has been successfully upgraded to the new digital system. All residents have been provided with new access codes and instructions.', 'security', 'Low', 'Completed', mgmt_user_id, NOW() - INTERVAL '1 week');

    RAISE NOTICE 'Demo issues created successfully for building: %', demo_building_id;
END $$;

-- 4. VERIFY THE FIX
SELECT 'Demo issues created:' as status;
SELECT id, title, category, priority, status, created_at
FROM issues 
WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
ORDER BY created_at DESC;

-- 5. TEST BUILDING QUERY
SELECT 'Testing building query for management company:' as status;
SELECT b.id, b.name, b.address
FROM buildings b
WHERE EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = b.id
    AND bu.role = 'management-company'
)
ORDER BY b.name;
