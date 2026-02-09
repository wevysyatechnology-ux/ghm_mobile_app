# Setup Test User - Instructions

## Problem
The app is hitting Supabase rate limits when trying to auto-create users. You need to manually create the test user using admin privileges.

## Solution

### Step 1: Get Your Supabase Service Role Key

1. Go to https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh
2. Click on "Settings" in the left sidebar
3. Click on "API"
4. Find "Service role key" (NOT the anon key)
5. Copy the service role key (starts with `eyJ...`)

**⚠️ IMPORTANT: Keep this key secret! Never commit it to git.**

### Step 2: Create the Test User

Run this command in your terminal (replace `YOUR_SERVICE_ROLE_KEY` with the actual key):

```bash
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY npx tsx scripts/create-test-user-admin.ts
```

Example:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... npx tsx scripts/create-test-user-admin.ts
```

### Step 3: Sign In

After the user is created, you can sign in using:

- **Email**: test9902093811@wevysya.com
- **Password**: TestUser123!

Or with phone:
- **Phone**: 9902093811
- **OTP**: 1234

## What If I Don't Have Access to the Service Role Key?

If you can't access the Supabase dashboard, you have two options:

1. **Use Phone Login**: The phone login with OTP `1234` will automatically create accounts
2. **Wait 10-15 minutes**: Supabase rate limits reset after a few minutes, then try signing in again

## Troubleshooting

### "Rate limit exceeded"
- Wait 10-15 minutes for rate limits to reset
- Use the admin script above with service role key
- Or use phone login instead of email login

### "Invalid login credentials"
- The account doesn't exist yet
- Run the admin script to create it
- Or wait for rate limits to clear and the app will create it

### "Project with name already exists"
- This is a backend error, ignore it
- Just run the admin script instead
