-- Fix core_deals foreign key to reference houses table instead of core_houses

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE core_deals 
DROP CONSTRAINT IF EXISTS core_deals_house_id_fkey;

-- Step 2: Add new foreign key constraint referencing houses table
ALTER TABLE core_deals 
ADD CONSTRAINT core_deals_house_id_fkey 
FOREIGN KEY (house_id) 
REFERENCES public.houses(id);

-- Verification query to check the constraint
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
AND tc.table_name='core_deals'
AND kcu.column_name='house_id';
