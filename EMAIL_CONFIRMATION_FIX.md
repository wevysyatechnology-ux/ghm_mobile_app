# Email Confirmation Issue - Fix Guide

## Problem
When logging in with a phone number, you see "Email not confirmed" error. This happens because:
1. The app uses email/password authentication behind the scenes in development mode
2. Supabase requires email confirmation by default
3. New accounts created during testing aren't confirmed

## Quick Solution - Use the Test Account

**The test account is already set up and confirmed:**
- **Phone**: `9902093811`
- **OTP**: `1234`

OR use email login:
- **Email**: `test9902093811@wevysya.com`
- **Password**: `TestUser123!`

## Permanent Fix - Disable Email Confirmation in Supabase

To allow testing with any phone number without email confirmation:

### Step 1: Open Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project

### Step 2: Disable Email Confirmation
1. Navigate to **Authentication** → **Providers**
2. Click on **Email** provider
3. Find the **Email confirmation** setting
4. **Turn OFF** "Confirm email"
5. Click **Save**

### Step 3: Test
1. Go back to your app
2. Try logging in with any phone number
3. Use OTP `1234` (in dev mode)
4. It should work without email confirmation

## Why This Happens

In development mode, the app:
- Accepts any phone number
- Creates an email/password account (e.g., `dev@wevysya.test`)
- Uses this account to authenticate

Supabase's default security requires email confirmation, which is good for production but inconvenient for development testing.

## Production Considerations

For production:
- Re-enable email confirmation for security
- Use proper phone authentication (SMS OTP)
- Or use social auth providers
- Keep the test account for demos

## Alternative: Confirm Emails via SQL (Advanced)

If you want to manually confirm an email for testing:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'dev@wevysya.test';
```

But it's easier to just disable confirmation in the dashboard for development.
