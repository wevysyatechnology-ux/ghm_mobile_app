# Fix: "No House Found" Error in Android App

## Problem
When you click on the "Links Form" button in the Android app, you see this error:

```
No House Found
You are not assigned to a house yet. 
Please contact your administrator.
```

## Root Cause
The user's profile doesn't have a `house_id` assigned in the Supabase `profiles` table. The app correctly identifies this and shows a helpful error message.

## Solution: Assign House to User Profile

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh/sql
   - Click "New Query"

2. **Step 1: Find Your User ID**
   ```sql
   SELECT id, email FROM auth.users LIMIT 10;
   ```
   - Run this and note the `id` of the user you logged in with (copy the UUID)

3. **Step 2: Check Existing Houses**
   ```sql
   SELECT id, house_name, city, state, country FROM houses LIMIT 10;
   ```
   - Copy the house `id` you want to assign

4. **Step 3: Create a House (if needed)**
   ```sql
   INSERT INTO houses (house_name, city, state, country, status)
   VALUES ('Main House', 'San Jose', 'California', 'USA', 'active')
   RETURNING id, house_name;
   ```
   - Note the returned `id`

5. **Step 4: Assign House to Your Profile**
   ```sql
   INSERT INTO profiles (id, house_id, full_name, created_at)
   VALUES (
     'YOUR_USER_ID_HERE',      -- Replace with user ID from Step 1
     'YOUR_HOUSE_ID_HERE',     -- Replace with house ID from Step 2 or 3
     'Test User',
     NOW()
   )
   ON CONFLICT (id) DO UPDATE SET
     house_id = 'YOUR_HOUSE_ID_HERE',
     full_name = 'Test User',
     updated_at = NOW();
   ```

6. **Step 5: Verify the Assignment**
   ```sql
   SELECT p.id, p.house_id, p.full_name, h.house_name 
   FROM profiles p
   LEFT JOIN houses h ON p.house_id = h.id
   WHERE p.id = 'YOUR_USER_ID_HERE';
   ```
   - Should show your user with house_id and house_name populated

### Option 2: Using SQL Script File

A helper script has been created at `ASSIGN_USER_TO_HOUSE.sql` with all the queries you need. Follow the steps:

1. Open Supabase SQL Editor
2. Copy the entire contents of `ASSIGN_USER_TO_HOUSE.sql`
3. Run the queries in order:
   - First: Get user IDs
   - Second: Check existing houses
   - Third: Create house (if needed)
   - Fourth: Assign house to profile
   - Fifth: Verify

## Testing After Fix

Once you've assigned a house to your user:

1. **Restart the Android App**
   - Close the app completely
   - Reopen it

2. **Navigate to Links Form**
   - Click the "Links" button
   - The form should now load with:
     - ✅ "Choose Member" dropdown showing house members
     - ✅ All other form fields available

3. **Test Other Forms**
   - Try the "Deals" form - should also show house members
   - Try the "1on1" form - should also show house members

## Troubleshooting

### Still Seeing "No House Found"
- **Check Step 5 verification query results**
  - Make sure `house_id` is not NULL
  - Make sure the `house_name` appears (confirming house exists)
  
- **Clear app cache and restart**
  - On Android: Settings > Apps > Your App > Storage > Clear Cache
  - Restart the app

- **Verify house exists**
  ```sql
  SELECT id, house_name FROM houses WHERE id = 'YOUR_HOUSE_ID_HERE';
  ```
  - Should return the house details
  - If not found, create it (Step 3 above)

### Members Not Loading
- Make sure at least 2 users are assigned to the same house:
  ```sql
  SELECT id, full_name, house_id FROM profiles WHERE house_id = 'YOUR_HOUSE_ID_HERE';
  ```
  - Should show multiple users

- If only 1 user, create another test profile and assign to same house

### Database Query Errors
- Make sure you're using the correct table names (case-sensitive on Linux):
  - `auth.users` (not `users`)
  - `profiles` (not `profile`)
  - `houses` (not `house`)

## Expected Behavior After Fix

### Links Form should show:
1. ✅ "Choose Member" dropdown with other house members
2. ✅ Title field (e.g., "Task Header")
3. ✅ Contact Name field
4. ✅ Contact Phone field
5. ✅ Contact Email field
6. ✅ Send button to create link and send notification

### Deals Form should show:
1. ✅ "Choose Member" dropdown with other house members
2. ✅ Deal title input
3. ✅ Deal description
4. ✅ Amount field
5. ✅ Create Deal button

### 1on1 (I2WE) Form should show:
1. ✅ "Choose Member" dropdown with other house members
2. ✅ Meeting date picker
3. ✅ Notes field
4. ✅ Schedule Meeting button

## Sample Data Setup

Here's a complete example to set up everything from scratch:

```sql
-- 1. Get your actual user ID
SELECT id, email FROM auth.users WHERE email LIKE '%@%' LIMIT 1;
-- Copy the id (replace 'abc123...' in next queries)

-- 2. Create a house
INSERT INTO houses (house_name, city, state, country, status)
VALUES ('Demo House', 'San Francisco', 'CA', 'USA', 'active')
RETURNING id;
-- Copy the id (replace 'def456...' in next queries)

-- 3. Assign house to your profile
INSERT INTO profiles (id, house_id, full_name, created_at)
VALUES ('abc123...', 'def456...', 'Your Name', NOW())
ON CONFLICT (id) DO UPDATE SET house_id = 'def456...';

-- 4. Create a second test user (optional, for testing member selection)
INSERT INTO auth.users (email, email_confirmed_at, encrypted_password, role)
VALUES ('testuser2@test.com', NOW(), '$2a$10$test', 'authenticated')
RETURNING id;
-- Copy the id

-- 5. Assign second user to same house
INSERT INTO profiles (id, house_id, full_name, created_at)
VALUES ('ghi789...', 'def456...', 'Test User 2', NOW())
ON CONFLICT (id) DO UPDATE SET house_id = 'def456...';

-- 6. Verify setup
SELECT p.id, p.full_name, h.house_name 
FROM profiles p
LEFT JOIN houses h ON p.house_id = h.id
WHERE p.house_id = 'def456...'
ORDER BY p.created_at;
```

## Questions?

If the issue persists after following these steps:

1. **Check user authentication**
   - Verify you're logged in (should see your profile)
   - Try logging out and back in

2. **Check database records**
   - Run the verification query (Step 5)
   - Ensure house_id is populated and not NULL

3. **Check app logs**
   - In Android Logcat, search for "🏠" or "getUserHouses"
   - Should show detailed console logs from the service

4. **Restart everything**
   - Kill the app completely
   - Clear cache if needed
   - Reopen the app

The error message is working correctly - it's identifying the missing house assignment and guiding you to fix it!
