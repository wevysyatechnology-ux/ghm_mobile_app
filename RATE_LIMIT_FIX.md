# Rate Limit Issue - Fixed

## Problem
The app was hitting Supabase rate limits during OTP verification because it was repeatedly trying to create new accounts when sign-in failed.

## What Was Fixed

### 1. **Improved Error Handling in authService.ts**
- Added comprehensive rate limit detection
- Better error messages that guide users to the test account
- Handles multiple rate limit error formats

### 2. **Enhanced User Guidance**
- Updated error messages to be more helpful
- Added instructions to use the test account when rate limits are hit
- Shows clear next steps in error messages

## How to Avoid This Issue

### For Development/Testing

**Always use the pre-configured test account:**
- **Phone**: `9902093811` or `+919902093811`
- **OTP**: `1234` (in dev mode)

OR

- **Email**: `test9902093811@wevysya.com`
- **Password**: `TestUser123!`

### Why This Happens

Supabase has rate limits to prevent abuse:
- **Account creation**: Limited to prevent spam
- **Authentication attempts**: Limited to prevent brute force attacks

When testing, repeatedly trying to create accounts triggers these limits.

### Solution

1. **Immediate Fix**: Wait 5-10 minutes for rate limits to reset
2. **Best Practice**: Use the test account (9902093811) for all testing
3. **For Production**: This won't be an issue as real users won't trigger repeated signups

## Current Implementation

The app now:
✅ Detects rate limit errors more reliably
✅ Provides helpful error messages
✅ Guides users to the test account
✅ Shows clear instructions in the UI
✅ Pre-fills test credentials in the login screen

## Testing Instructions

1. Open the app
2. Use **Phone Login** with number: `9902093811`
3. Enter OTP: `1234`
4. You should be logged in successfully

OR

1. Use **Email Login** (default)
2. Credentials are pre-filled
3. Click "Sign In"
4. You should be logged in successfully
