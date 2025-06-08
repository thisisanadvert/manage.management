-- Fix Foreign Key Constraints for Issues Table
-- Run this in Supabase SQL Editor to fix the foreign key relationship errors

-- First, let's check if the foreign key constraints exist
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='issues'
    AND tc.table_schema='public';

-- Drop existing foreign key constraints if they exist (to recreate them properly)
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop reported_by foreign key constraint
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'issues'
      AND kcu.column_name = 'reported_by'
      AND tc.table_schema = 'public';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE issues DROP CONSTRAINT ' || constraint_name;
    END IF;
    
    -- Find and drop assigned_to foreign key constraint
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'issues'
      AND kcu.column_name = 'assigned_to'
      AND tc.table_schema = 'public';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE issues DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Recreate the foreign key constraints properly
ALTER TABLE issues 
ADD CONSTRAINT issues_reported_by_fkey 
FOREIGN KEY (reported_by) REFERENCES auth.users(id);

ALTER TABLE issues 
ADD CONSTRAINT issues_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES auth.users(id);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the constraints were created
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='issues'
    AND tc.table_schema='public'
    AND kcu.column_name IN ('reported_by', 'assigned_to');

SELECT 'Foreign key constraints fixed!' as status;
