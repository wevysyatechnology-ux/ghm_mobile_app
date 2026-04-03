# iOS TestFlight Submission Guide

## Current Status
✅ Project initialized with Git  
✅ App.json updated - iOS build number incremented to 5  
✅ EAS CLI is installed and you're logged in as: wevysya@wevysyatechnolog.com  

## Manual Submission Steps

### Step 1: Set Up iOS Code Signing Credentials
Run this command in your terminal and follow the interactive prompts:

```bash
eas credentials --platform ios
```

**What to expect:**
- EAS will ask if you want to reuse existing credentials or create new ones
- Select appropriate options based on your Apple Developer account setup
- Choose "Let EAS handle the provisioning" (recommended)
- The Team ID (Q8K8U4XH5D) is already configured in `eas.json`

**If you have 2FA enabled on your Apple ID:**
- Use an **App-Specific Password** instead of your account password
- Create one at: https://appleid.apple.com → Security → App-specific passwords
- Generate password labeled "EAS"

### Step 2: Build for iOS Production
After credentials are set up, run:

```bash
eas build --platform ios --profile production
```

**What happens:**
- EAS compiles your React Native app for iOS
- Signs the build with your Apple Developer certificate
- Takes 10-20 minutes to complete
- You'll see build progress in the terminal and can track it at: https://expo.dev/accounts/wevysya/builds

**Important:** Don't close the terminal during the build.

### Step 3: Submit to TestFlight
Once the build completes successfully, run:

```bash
eas submit --platform ios --profile production --latest
```

**This will:**
- Automatically upload the build to App Store Connect TestFlight
- No manual download or upload required
- Takes 2-5 minutes
- You'll get confirmation when submission is complete

**Alternative: Manual Upload**
If you prefer to upload manually to App Store Connect:
1. During `eas build`, download the `.ipa` file when prompted
2. Go to https://appstoreconnect.apple.com
3. Login with wevysyatechnology@gmail.com
4. Navigate to TestFlight → iOS Builds
5. Click "+" and upload the .ipa file

### Step 4: Configure TestFlight in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Select your app (WeVysya AI)
3. Go to TestFlight → iOS Builds
4. Click on your new build (Build 5)
5. Add testing details:
   - Add release notes
   - Select which user groups can test
   - Add internal testers (you, your team)

### Step 5: Invite Testers & Wait for Review
1. Add Apple IDs of testers in TestFlight section
2. They'll receive invitation email
3. They download TestFlight app from App Store and install your build
4. App Store reviews your TestFlight build (usually 24-48 hours for new apps, 1-24 hours for updates)
5. Once approved, status changes to "Ready to Test"

### Step 6: Test Before Going Live
- Have testers run through the app features
- Check crash logs in App Store Connect → TestFlight → Crashes
- Verify push notifications work
- Test voice assistant functionality

## App Configuration Summary

**Bundle ID:** `com.wevysya.app`  
**iOS Build Number:** 5  
**Version:** 2.0.0  
**ASC App ID:** 6760703106  
**Team ID:** Q8K8U4XH5D  
**Apple ID:** wevysyatechnology@gmail.com  

## Troubleshooting

### Build Fails with "Certificate Not Found"
- Run: `eas credentials --platform ios`
- Choose "Revoke and generate new certificate"
- Retry the build

### "Authorization failed" During Build
- Your Apple ID password might be wrong
- If using 2FA, use an App-Specific Password instead
- Verify credentials: `eas credentials --platform ios --show`

### Build Succeeds but Submit Fails
- Verify Apple ID in `eas.json` is correct (wevysyatechnology@gmail.com)
- Check that ASC App ID (6760703106) is active in App Store Connect
- Ensure your Apple Developer account is in good standing

### TestFlight Build Shows "Invalid Binary"
- This means App Store review found issues
- Check email from Apple with details
- Common issues:
  - Missing privacy policy
  - Undeclared permissions
  - Crash on startup

## Important Reminders

⚠️ **Before you submit:**
- Review app description and keywords in App Store Connect
- Ensure all permissions are justified in app description
- Have a privacy policy URL ready (if collecting data)
- Take screenshots for TestFlight page

⚠️ **After submission:**
- Monitor App Store Connect for review status
- Check TestFlight email for tester feedback
- Be ready to provide review info if Apple asks
- Plan for 1-2 review cycles before going live

## Quick Command Reference

```bash
# Show current EAS credentials
eas credentials --platform ios --show

# Start fresh if credentials are corrupt
eas credentials --platform ios --revoke

# View build progress
eas build --list

# Download a specific build
eas build --list  # Get build ID
eas build:download --id <build-id>
```

---

**Run Step 1 now** in your terminal and follow the prompts! Let me know when the build completes.
