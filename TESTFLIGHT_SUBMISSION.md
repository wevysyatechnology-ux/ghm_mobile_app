# iOS TestFlight Submission Guide

**Status**: Git initialized ✓ | TypeScript validated ✓ | EAS authenticated ✓

## Quick Start
Your project is ready for TestFlight submission. Follow these steps in your terminal:

### Step 1: Configure iOS Signing Credentials
```bash
eas credentials --platform ios
```
When prompted:
- **Apple ID**: `wevysyatechnology@gmail.com`
- **Password**: Your Apple ID password (or app-specific password if 2FA enabled)
- Choose to automatically manage certificates

### Step 2: Build for Preview (Testing)
```bash
eas build --platform ios --profile preview
```
- Monitor build at: https://dash.expo.dev
- Build takes 10-20 minutes
- Download the `.ipa` file to test on device

### Step 3: Build for Production
```bash
eas build --platform ios --profile production
```
- Uses production code signing
- Will be automatically submitted to TestFlight if --profile production is used

### Step 4: Submit to TestFlight
```bash
eas submit --platform ios --profile production --latest
```
- Submits the latest production build to TestFlight
- No manual upload needed

### Step 5: Manage in App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app (WeVysya AI - ASC ID: 6760703106)
3. Go to **TestFlight** tab
4. Add testers (internal or external)
5. Create release notes
6. Submit for review

---

## Project Configuration Summary

### iOS Build Configuration
**File**: `app.json`
- Bundle ID: `com.wevysya.app`
- Build Number: `3`
- Min iOS: 13.4
- Permissions:
  - Microphone (voice assistant)
  - Camera (profile photos)
  - Photo Library
  - Remote notifications

### EAS Build Profiles
**File**: `eas.json`
- **preview**: Development/debug build
- **production**: Store submission build
- Apple Team ID: `Q8K8U4XH5D`
- ASC App ID: `6760703106`

### Version Information
- App Version: 2.0.0
- Current Build Number: 3
- **NOTE**: Increment build number in `app.json` iOS section before each submission

---

## Troubleshooting

### Apple ID Password Issues
If you get "Invalid username and password":
1. Verify email: `wevysyatechnology@gmail.com`
2. If 2FA enabled on Apple ID:
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Security → App-specific passwords
   - Generate new password for "EAS"
   - Use that instead of regular password

### Build Fails with Credential Issues
```bash
# Clear cached credentials
eas credentials --platform ios --reset

# Reconfigure
eas credentials --platform ios
```

### Cannot Proceed with Automated Submission
You can manually submit via App Store Connect:
1. Download the build `.ipa` from EAS dashboard
2. Go to App Store Connect
3. TestFlight → Builds → Upload build manually using Transporter app

### Check Build Status
```bash
eas build:list --platform ios
```

---

## Before Final Submission Checklist

- [ ] Updated build number in `app.json` (currently 3)
- [ ] App description updated in App Store Connect
- [ ] Privacy policy URL set in App Store Connect
- [ ] Screenshots/previews added for TestFlight
- [ ] Release notes prepared
- [ ] Internal testers added in App Store Connect
- [ ] Tested on physical iOS device (optional but recommended)

---

## Key Credentials
- **EAS Account**: wevysya (wevysyatechnology@gmail.com)
- **Apple ID**: wevysyatechnology@gmail.com
- **Apple Team ID**: Q8K8U4XH5D
- **App ID**: 6760703106

---

## Next Steps
1. Open terminal in project directory
2. Run: `eas credentials --platform ios` (set up Apple signing)
3. Run: `eas build --platform ios --profile preview` (test build)
4. Once confident, run: `eas build --platform ios --profile production`
5. Run: `eas submit --platform ios --profile production --latest`

**Timeline**: Credential setup (~2 min) + Preview build (~15 min) + Production build (~15 min) + Submission (~1 min) = ~33 minutes total
