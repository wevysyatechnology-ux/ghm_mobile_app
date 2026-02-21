# App Not Showing Data - Complete Troubleshooting Guide

## Problem Summary
- ✅ Authentication is working (you can login)
- ❌ Profile page showing "Not set" for all fields
- ❌ Dashboard showing 0 counts (Links Given: 0, Links Received: 0, Closed Deals: 0, Meetings: 0)
- ❌ "No House Found" error in forms
- ✅ Web app works fine with data visible
- ❌ Android/iOS app shows no data

## Root Cause: Row Level Security (RLS)

The most likely issue is **Row Level Security (RLS)** policies on the Supabase database tables are blocking mobile app queries.

**Why does this happen?**
- RLS is a security feature that restricts which rows users can access
- If RLS policies are too restrictive, authenticated users can't read any data
- Web app might work if using service role key (which bypasses RLS), but mobile app uses anon key (which respects RLS)

## Solution: Check and Fix RLS Policies

### Step 1: Diagnose the Problem

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh/sql
   - Click "New Query"

2. **Run this diagnostic query:**
   ```sql
   SELECT 
     schemaname,
     tablename,
     rowsecurity
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('houses', 'profiles', 'core_links', 'core_deals', 'core_i2we', 'users_profile', 'core_memberships', 'virtual_memberships')
   ORDER BY tablename;
   ```

3. **Check the results:**
   - If `rowsecurity = true` for ANY table → RLS is enabled and likely blocking access
   - If `rowsecurity = false` for ALL tables → RLS is disabled (should work)

### Step 2: Quick Fix (For Development/Testing)

**Option A: Temporarily Disable RLS**

Run this in SQL Editor to disable RLS on all tables:

```sql
ALTER TABLE houses DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_i2we DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_memberships DISABLE ROW LEVEL SECURITY;
```

**Then:**
1. Restart your Android/iOS app completely (force close)
2. Login again
3. Check if data now appears

**If data appears:** RLS was the problem. Now you need to create proper RLS policies (see Step 3).

**If data still doesn't appear:** Problem is something else (check Step 3 - Data Verification).

### Step 3: Verify Data Exists & User Profile Is Set

1. **Check your user exists:**
   ```sql
   SELECT id, email FROM auth.users WHERE email LIKE '%your-email%' LIMIT 5;
   ```
   - Copy the user `id` (UUID like `12345678-1234...`)

2. **Check you have a profile:**
   ```sql
   SELECT * FROM profiles WHERE id = 'YOUR_USER_ID_HERE';
   ```
   - Should return a row with `house_id` populated
   - If empty: Need to create profile and assign house (see ASSIGN_USER_TO_HOUSE.sql)

3. **Check your house exists:**
   ```sql
   SELECT * FROM houses 
   WHERE id = (
     SELECT house_id FROM profiles WHERE id = 'YOUR_USER_ID_HERE'
   );
   ```
   - Should return house details with `name` column populated
   - If empty: House doesn't exist, need to create and assign

4. **Check data in core tables:**
   ```sql
   -- Check if you have any links
   SELECT COUNT(*) FROM core_links WHERE from_user_id = 'YOUR_USER_ID_HERE';
   SELECT COUNT(*) FROM core_links WHERE to_user_id = 'YOUR_USER_ID_HERE';
   
   -- Check if you have any deals
   SELECT COUNT(*) FROM core_deals WHERE creator_id = 'YOUR_USER_ID_HERE';
   
   -- Check if you have any meetings
   SELECT COUNT(*) FROM core_i2we WHERE member_1_id = 'YOUR_USER_ID_HERE' OR member_2_id = 'YOUR_USER_ID_HERE';
   ```

### Step 4: Create Proper RLS Policies (Production)

If disabling RLS worked, you need to create secure policies. Run these:

```sql
-- Enable RLS again
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_i2we ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies that allow authenticated users to read
CREATE POLICY "Allow authenticated to read houses" 
ON houses FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to read profiles" 
ON profiles FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow unauthenticated or authenticated on core_links" 
ON core_links FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id OR auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to read core_deals" 
ON core_deals FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to read core_i2we" 
ON core_i2we FOR SELECT 
USING (auth.uid() = member_1_id OR auth.uid() = member_2_id OR auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to read users_profile" 
ON users_profile FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to read own memberships" 
ON core_memberships FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to read own virtual memberships" 
ON virtual_memberships FOR SELECT 
USING (auth.uid() = user_id);
```

Then test again on the app.

## Important Notes

### Column Names (Don't Confuse These!)
- **houses table**: `id`, `name` (NOT `house_name`), `city`, `state`, `country`, `zone`
- **profiles table**: `id`, `house_id`, `full_name`, `zone`
- **users_profile table**: `id`, `full_name`, `phone_number`, `vertical_type`, `business_category`

### Testing Workflow
1. ❌ App shows no data
2. → Check RLS (Step 1)
3. → Disable RLS temporarily (Step 2)
4. → Restart app and test
5. ✅ If works: Create proper policies (Step 4)
6. ❌ If still doesn't work: Check data exists (Step 3)

## Key File
- See `RLS_AND_DATA_FIX.sql` for complete SQL queries

## If Still Not Working

**Check these in order:**
1. ✅ User is authenticated (login works)
2. ✅ User has `profiles` entry with `house_id` (Step 3.2)
3. ✅ House record exists in `houses` table (Step 3.3)
4. ✅ RLS is disabled OR proper policies are set (Step 3.1, 3.4)
5. ✅ Data exists in tables like `core_links`, `core_deals` (Step 3.4)
6. ❌ If all above are OK but still no data, there's a code issue

### Debug Logs
Check your browser console (web) or Android Logcat (mobile) for:
```
❌ Error fetching user profile
❌ Error fetching house
❌ Exception in getUserHouses
```

These logs will show the exact error from Supabase.

## Next Build Version

All code has been fixed and committed. When you rebuild:
1. Run: `eas build --platform android --profile preview`
2. Wait for build to complete
3. Test after applying RLS fix above
