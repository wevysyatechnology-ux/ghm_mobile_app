-- Setup House and Assign to Test User
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh/sql

-- Step 1: Get the logged-in user's ID from auth.users
-- First, check what users exist in the system
SELECT id, email FROM auth.users LIMIT 10;

-- Step 2: Create a house if it doesn't exist
-- Check existing houses (note: column is 'name', NOT 'house_name')
SELECT id, name, city, state, country FROM houses LIMIT 10;

-- Step 3: Insert a test house (if needed)
INSERT INTO houses (house_name, city, state, country, status)
VALUES ('Main House', 'San Jose', 'California', 'USA', 'active')
ON CONFLICT DO NOTHING
RETURNING id, house_name;

-- Step 4: Get the house ID (use the ID from the result above)
-- This will help you find which house to assign
SELECT id, house_name FROM houses WHERE house_name = 'Main House' LIMIT 1;

-- Step 5: Create/Update the profiles entry with the house_id
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users
-- Replace 'HOUSE_ID_HERE' with the actual house ID from the houses table
INSERT INTO profiles (id, house_id, full_name, created_at)
VALUES (
  'USER_ID_HERE',
  'HOUSE_ID_HERE',
  'Test User',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  house_id = 'HOUSE_ID_HERE',
  full_name = 'Test User',
  updated_at = NOW();

-- Step 6: Verify the profile was created with house_id
SELECT id, house_id, full_name FROM profiles WHERE id = 'USER_ID_HERE';

-- Step 7: Verify the house exists and is accessible
SELECT id, house_name, city FROM houses WHERE id = 'HOUSE_ID_HERE';

-- EXAMPLE: If your user ID is '12345678-1234-1234-1234-123456789abc' 
-- and your house ID is '87654321-4321-4321-4321-cba987654321'
-- Run this:
/*
INSERT INTO profiles (id, house_id, full_name, created_at)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  '87654321-4321-4321-4321-cba987654321',
  'Test User',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  house_id = '87654321-4321-4321-4321-cba987654321',
  full_name = 'Test User',
  updated_at = NOW();
*/
