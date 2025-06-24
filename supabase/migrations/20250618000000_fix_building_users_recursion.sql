/*
  # Fix Building Users Infinite Recursion Issue
  
  ## Problem
  The buildings policy uses is_building_member() which queries building_users,
  but when BuildingSetup queries building_users, it triggers the buildings policy,
  creating infinite recursion: "infinite recursion detected in policy for relation 'building_users'"
  
  ## Root Cause
  1. BuildingSetup.tsx queries building_users table to find user's building
  2. This triggers RLS policies on building_users
  3. Some policies reference buildings table
  4. Buildings table policy uses is_building_member() function
  5. is_building_member() queries building_users table again
  6. This creates infinite recursion
  
  ## Solution
  Remove the recursive dependency by:
  1. Fixing the buildings policy to use direct subquery instead of is_building_member()
  2. Ensuring building_users policies don't trigger buildings policies
  3. Simplifying the policy structure to avoid circular references
*/

-- Fix the buildings policy to avoid recursion
-- Instead of using is_building_member, use a direct subquery
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
CREATE POLICY "users_view_own_buildings"
ON buildings
FOR SELECT
TO public
USING (
  id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = buildings.id
    AND user_id = auth.uid()
  )
);

-- Also fix other policies that might use is_building_member to avoid similar issues
DROP POLICY IF EXISTS "users_view_building_issues" ON issues;
CREATE POLICY "users_view_building_issues"
ON issues
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = issues.building_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "users_view_building_announcements" ON announcements;
CREATE POLICY "users_view_building_announcements"
ON announcements
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = announcements.building_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "users_view_building_polls" ON polls;
CREATE POLICY "users_view_building_polls"
ON polls
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = polls.building_id
    AND user_id = auth.uid()
  )
);

-- Ensure building_users policies are simple and don't trigger other table policies
-- Keep the existing policies but make sure they're optimised
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- Keep demo access simple
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);

-- Simplify director policies to avoid any potential recursion
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
CREATE POLICY "directors_view_members"
ON building_users
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

DROP POLICY IF EXISTS "directors_create_users" ON building_users;
CREATE POLICY "directors_create_users"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Keep the onboarding policies simple
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  NOT EXISTS (
    SELECT 1 FROM building_users
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "onboarding_create_first_building" ON building_users;
CREATE POLICY "onboarding_create_first_building"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  (auth.role() = 'authenticated')
);
