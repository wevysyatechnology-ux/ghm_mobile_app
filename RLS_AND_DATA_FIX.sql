-- Check and Fix RLS Policies and Data Access Issues
-- Run these queries in Supabase SQL Editor to diagnose and fix mobile app data loading problems

-- ================================================================
-- PART 1: Check If RLS Is Enabled and Blocking Queries
-- ================================================================

-- Check if RLS is enabled on each table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('houses', 'profiles', 'core_links', 'core_deals', 'core_i2we', 'core_memberships', 'virtual_memberships', 'users_profile')
ORDER BY tablename;

-- If rowsecurity = 'true' for any table, RLS is enabled on that table
-- You can disable RLS temporarily for testing:
-- ALTER TABLE houses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE core_links DISABLE ROW LEVEL SECURITY;
-- etc.

-- ================================================================
-- PART 2: Check Existing RLS Policies
-- ================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('houses', 'profiles', 'core_links', 'core_deals', 'core_i2we', 'users_profile')
ORDER BY tablename, policyname;

-- ================================================================
-- PART 3: Check Your User ID and Verify Data Exists
-- ================================================================

-- Get current authenticated user ID
SELECT id, email FROM auth.users LIMIT 10;

-- Check if user has profile entry
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID_HERE';

-- Check if user has users_profile entry
SELECT * FROM users_profile WHERE id = 'YOUR_USER_ID_HERE';

-- Check if user's house exists
SELECT * FROM houses WHERE id = (
  SELECT house_id FROM profiles WHERE id = 'YOUR_USER_ID_HERE'
);

-- ================================================================
-- PART 4: Troubleshooting Steps
-- ================================================================

-- If no results returned, the issue is one of:
-- A) User is not authenticated properly
-- B) User profile doesn't exist
-- C) RLS policies are blocking access
-- D) Data doesn't exist in database

-- To test if RLS is the issue, temporarily disable it:
ALTER TABLE houses DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_i2we DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_memberships DISABLE ROW LEVEL SECURITY;

-- Then test the app again on both web and mobile
-- If it works without RLS, you need to fix the RLS policies

-- ================================================================
-- PART 5: Re-enable RLS with Proper Policies (After Fixing)
-- ================================================================

-- Re-enable RLS after you've fixed policies
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_i2we ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_memberships ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PART 6: Create Basic Public Access RLS Policies
-- ================================================================

-- If you want to allow authenticated users to read from these tables:

-- Houses table - anyone authenticated can read
CREATE POLICY "Allow public read on houses"
ON houses FOR SELECT
USING (true);

-- Profiles table - users can read their own profile and all others
CREATE POLICY "Allow public read on profiles"
ON profiles FOR SELECT
USING (true);

-- Core Links - users can see links they sent or received
CREATE POLICY "Allow users to view their links"
ON core_links FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Core Deals - users can see deals in their house
CREATE POLICY "Allow users to view deals"
ON core_deals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.house_id = core_deals.house_id
  )
);

-- Core I2WE - users can see their meetings
CREATE POLICY "Allow users to view their meetings"
ON core_i2we FOR SELECT
USING (auth.uid() = member_1_id OR auth.uid() = member_2_id);

-- Users Profile - anyone authenticated can read
CREATE POLICY "Allow public read on users_profile"
ON users_profile FOR SELECT
USING (true);

-- Core Memberships - users can see their own memberships
CREATE POLICY "Allow users to view their memberships"
ON core_memberships FOR SELECT
USING (auth.uid() = user_id);

-- Virtual Memberships - users can see their own memberships
CREATE POLICY "Allow users to view their virtual memberships"
ON virtual_memberships FOR SELECT
USING (auth.uid() = user_id);

-- ================================================================
-- PART 7: Verify Fix by Checking Counts
-- ================================================================

-- After fixing RLS, test these queries should return data:

-- Count links given
SELECT COUNT(*) as links_given 
FROM core_links 
WHERE from_user_id = 'YOUR_USER_ID_HERE';

-- Count links received
SELECT COUNT(*) as links_received 
FROM core_links 
WHERE to_user_id = 'YOUR_USER_ID_HERE';

-- Count closed deals
SELECT COUNT(*) as closed_deals 
FROM core_deals 
WHERE creator_id = 'YOUR_USER_ID_HERE' 
AND status = 'closed';

-- Count meetings
SELECT COUNT(*) as meetings 
FROM core_i2we 
WHERE member_1_id = 'YOUR_USER_ID_HERE' 
OR member_2_id = 'YOUR_USER_ID_HERE';

-- ================================================================
-- PART 8: Quick Fix - Disable RLS Entirely (Development Only)
-- ================================================================

-- If you just want to test the app and fix RLS policies later:
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
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

-- Then test the app - everything should work
-- Remember to re-enable RLS and fix policies before production!

-- ================================================================
-- PART 9: Common Column Names (For Reference)
-- ================================================================

/* 
CORRECT COLUMN NAMES IN TABLES:
- houses: id, name (NOT house_name), city, state, country, zone, status, created_at
- profiles: id, house_id, full_name, zone, business, created_at, updated_at
- users_profile: id, full_name, phone_number, vertical_type, business_category, country, state, city, created_at
- core_links: id, from_user_id, to_user_id, title, description, contact_name, contact_phone, contact_email, urgency, house_id, status
- core_deals: id, creator_id, house_id, title, description, amount, deal_type, status
- core_i2we: id, member_1_id, member_2_id, house_id, meeting_date, notes, status
- core_memberships: id, user_id, membership_type, membership_status, valid_from, valid_to, financial_year
- virtual_memberships: id, user_id, membership_status, valid_from, valid_to, financial_year

IMPORTANT: Use 'name' for houses table, NOT 'house_name'
*/
