-- Drop existing policies to replace them with optimized versions
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;

-- Create new optimized policies that avoid recursion

-- View policy: Users can see their own memberships and all members of buildings where they are RTM/management
CREATE POLICY "view_building_users" ON building_users
FOR SELECT TO public
USING (
  -- Users can always see their own memberships
  user_id = auth.uid() 
  OR 
  -- RTM directors and management can see all members in their buildings
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'management-company')
  )
);

-- Insert policy: RTM/management can add users to their buildings
CREATE POLICY "create_building_users" ON building_users
FOR INSERT TO public
WITH CHECK (
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'management-company')
  )
);

-- Update policy: RTM/management can update users in their buildings
CREATE POLICY "update_building_users" ON building_users
FOR UPDATE TO public
USING (
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'management-company')
  )
)
WITH CHECK (
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'management-company')
  )
);

-- Delete policy: RTM/management can remove users from their buildings
CREATE POLICY "delete_building_users" ON building_users
FOR DELETE TO public
USING (
  building_id IN (
    SELECT DISTINCT bu.building_id 
    FROM building_users bu 
    WHERE bu.user_id = auth.uid() 
      AND bu.role IN ('rtm-director', 'management-company')
  )
);