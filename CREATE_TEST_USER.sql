-- Create Test User in Supabase
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh/sql)

-- This will create the test user account
-- Email: test9902093811@wevysya.com
-- Password: TestUser123!
-- Phone: +919902093811

-- Step 1: Create the auth user
-- Note: You may need to use the Supabase Dashboard Auth section instead:
-- Go to Authentication > Users > Add User
-- Email: test9902093811@wevysya.com
-- Password: TestUser123!
-- Auto Confirm User: YES

-- Step 2: After creating the user in the dashboard, get their ID and run this:
-- Replace 'USER_ID_HERE' with the actual UUID from the auth.users table

INSERT INTO users_profile (id, full_name, phone_number, vertical_type)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'Test User',
  '+919902093811',
  'open_circle'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone_number = EXCLUDED.phone_number,
  vertical_type = EXCLUDED.vertical_type;

-- Or if you know the user already exists, you can link their profile like this:
INSERT INTO users_profile (id, full_name, phone_number, vertical_type)
SELECT
  id,
  'Test User',
  '+919902093811',
  'open_circle'
FROM auth.users
WHERE email = 'test9902093811@wevysya.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone_number = EXCLUDED.phone_number,
  vertical_type = EXCLUDED.vertical_type;
