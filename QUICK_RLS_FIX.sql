-- Quick RLS Fix for Mobile App Data Loading
-- This script disables RLS policies to allow data access
-- Run this as your Supabase admin account in the SQL Editor

-- ================================================================
-- STEP 1: Disable RLS on Public Tables (Works with Standard Account)
-- ================================================================

-- These commands work with a regular authenticated user:
ALTER TABLE houses DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_i2we DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 2: Verify RLS is Disabled
-- ================================================================

SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'houses', 'profiles', 'core_links', 'core_deals', 'core_i2we', 
    'users_profile', 'core_memberships', 'virtual_memberships'
  )
ORDER BY tablename;

-- All should show rowsecurity = false

-- ================================================================
-- STEP 3: Test Data Access
-- ================================================================

-- Run these to verify data is now accessible:

-- Test 1: Get user profile
SELECT id, full_name, phone_number FROM users_profile LIMIT 5;

-- Test 2: Get houses
SELECT id, name, city, state, country FROM houses LIMIT 5;

-- Test 3: Get user's house from profiles
SELECT id, house_id, full_name FROM profiles LIMIT 5;

-- Test 4: Get links
SELECT id, from_user_id, to_user_id, title FROM core_links LIMIT 5;

-- Test 5: Get deals
SELECT id, creator_id, title, amount FROM core_deals LIMIT 5;

-- Test 6: Get I2WE meetings
SELECT id, member_1_id, member_2_id, meeting_date FROM core_i2we LIMIT 5;

-- All these should return data if data exists in your database

-- ================================================================
-- AFTER TESTING: Re-Enable RLS with Proper Policies
-- ================================================================
-- When you're ready, run these to add security back with proper policies:

/*
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_i2we ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_memberships ENABLE ROW LEVEL SECURITY;

-- Then create proper policies (see APP_DATA_NOT_LOADING.md for examples)
*/

-- ================================================================
-- TROUBLESHOOTING
-- ================================================================

-- If you get "permission denied" errors:
-- 1. Make sure you're logged in as the Supabase project owner
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Make sure you have "All queries" permission selected
-- 4. Try running one table at a time if still having issues

-- If RLS is still blocking on mobile but works on web:
-- This often means RLS policies exist but are too restrictive
-- Disabling RLS temporarily will help you see if that's the issue
