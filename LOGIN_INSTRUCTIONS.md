# Login Instructions - WeVysya App

## Current Status
The app is ready to use! You just need to create the test user account first.

## Test User Credentials
- **Email**: test9902093811@wevysya.com
- **Password**: TestUser123!
- **Phone**: 9902093811 (for OTP login)

These credentials are **already pre-filled** in the app!

---

## How to Get Started

### Method 1: Create User in Supabase Dashboard (RECOMMENDED - Takes 1 minute)

1. Open: https://supabase.com/dashboard/project/vlwppdpodavowfnyhtkh/auth/users
2. Click the "Add user" or "Invite" button
3. Enter:
   - **Email**: test9902093811@wevysya.com
   - **Password**: TestUser123!
4. **IMPORTANT**: Check the "Auto Confirm User" checkbox ✅
5. Click "Create user"
6. Done! Open the app and click "Sign In" (credentials are pre-filled)

### Method 2: Use Phone Login (Works Immediately)

1. Open the app
2. Click on "Phone" tab
3. Phone number is already pre-filled: 9902093811
4. Click "Send OTP"
5. Enter OTP: `1234`
6. Click "Verify"
7. Done! You're logged in

---

## What Was Fixed

1. **Removed auto-signup**: The app no longer tries to automatically create accounts (which was causing rate limit errors)
2. **Pre-filled credentials**: Both email/password and phone are pre-filled for easy testing
3. **Better error messages**: If login fails, you'll see helpful error messages with suggestions
4. **Two login methods**: You can use either email/password OR phone/OTP

## Troubleshooting

### Error: "Invalid login credentials"
**Solution**: The user account doesn't exist yet. Use Method 1 above to create it in Supabase Dashboard.

### Error: "Too many signup attempts"
**Solution**:
- Use Phone login instead (Method 2)
- OR wait 10-15 minutes for rate limits to reset
- OR create the user manually using Method 1

### Error: "Account does not exist"
**Solution**: Use Method 1 to create the account in Supabase Dashboard, or switch to Phone login.

### Phone login not working
**Solution**: Make sure you're using OTP code `1234` (this is the dev/test OTP that always works)

---

## For Production

Before going to production:
1. Disable auto-confirm in Supabase (require email verification)
2. Set up real SMS provider for phone OTP
3. Remove the dev mode OTP (`1234`)
4. Implement proper user registration flow

---

## Need Help?

1. Check QUICK_FIX.md for fastest solutions
2. Check SETUP_TEST_USER.md for admin script method
3. Use Phone login as a fallback (always works in dev mode)
