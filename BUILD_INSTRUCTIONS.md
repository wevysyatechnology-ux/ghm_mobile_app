# EAS Build Instructions

## ✅ What's Already Done

- ✅ EAS CLI installed
- ✅ `expo-dev-client` installed
- ✅ `eas.json` configuration created
- ✅ `app.json` updated with build settings
- ✅ Babel configuration added for react-native-reanimated

## 📱 Steps to Create Your Development Build

### Step 1: Login to EAS

Open a **new terminal** in your project directory and run:

```bash
npx eas-cli login
```

This will:
1. Open your browser
2. Ask you to login with your Expo account (or create one if you don't have it)
3. Authenticate in the terminal

**Don't have an Expo account?**
- Go to https://expo.dev/signup
- Sign up for free
- Then run the login command above

### Step 2: Configure Your Project

After logging in, run:

```bash
npx eas-cli build:configure
```

This will:
1. Create a project on Expo's servers
2. Update your `app.json` with the project ID
3. Prepare everything for building

### Step 3: Build for Android

To create your development build, run:

```bash
npx eas-cli build --profile development --platform android
```

This will:
1. Upload your code to EAS servers
2. Build a custom APK with your exact dependencies
3. Take about 10-15 minutes
4. Give you a download link when done

**The build happens in the cloud, so you can close the terminal and check back later!**

### Step 4: Install on Your Phone

Once the build completes:

1. You'll get a download link in the terminal
2. Open that link on your phone
3. Download and install the APK
4. Grant installation permissions if asked

### Step 5: Run Your App

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your custom development build (not regular Expo Go)
3. Scan the QR code from the terminal
4. Your app will load with all the correct dependencies!

## 🎯 Quick Command Reference

```bash
# Login to EAS
npx eas-cli login

# Configure project
npx eas-cli build:configure

# Build for Android (development)
npx eas-cli build --profile development --platform android

# Check build status
npx eas-cli build:list

# Start dev server
npm run dev
```

## 💡 What's Different from Expo Go?

**Expo Go** (what you were using):
- Pre-built app with fixed native modules
- Fast to get started
- Can't use custom native code
- Version mismatches cause errors

**Development Build** (what you're creating):
- Custom built for YOUR project
- Has YOUR exact dependencies
- Works like Expo Go but without limitations
- No version mismatch errors
- Free to use!

## 🚀 Alternative: Build for iOS (if you have a Mac)

```bash
npx eas-cli build --profile development --platform ios
```

Note: iOS builds require an Apple Developer account ($99/year) for device installation.

## ❓ Troubleshooting

### "Not logged in" error
Run: `npx eas-cli login`

### "No project ID" error
Run: `npx eas-cli build:configure`

### Build taking too long
Builds run on cloud servers and typically take 10-15 minutes. You can:
- Check status: `npx eas-cli build:list`
- Close terminal and check back later
- Get notified via email when done

### Can't install APK
1. Enable "Install from Unknown Sources" in Android settings
2. Try downloading again
3. Make sure you have enough storage space

## 📊 Build Profiles Explained

Your `eas.json` has three profiles:

- **development**: For testing during development (what we're using now)
- **preview**: For internal testing/QA
- **production**: For app store releases

## 🎉 Next Steps

After your build is ready:

1. Install the APK on your phone
2. Start the dev server: `npm run dev`
3. Open your custom build app
4. Scan the QR code
5. Test your app with all features working!

The app will connect to your local dev server just like Expo Go did, but without any version conflicts!
