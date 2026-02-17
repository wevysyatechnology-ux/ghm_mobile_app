#!/bin/bash

# WeVysya Push Notifications - Complete Installation Script
# Run this script to set up push notifications in your WeVysya app

set -e

echo "🔔 WeVysya Push Notifications Installation"
echo "=========================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/5: Installing dependencies..."
npx expo install expo-notifications expo-device date-fns
echo "✅ Dependencies installed"
echo ""

# Step 2: Check Supabase connection
echo "🔗 Step 2/5: Checking Supabase connection..."
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Install it with:"
    echo "   npm install -g supabase"
    exit 1
fi
echo "✅ Supabase CLI found"
echo ""

# Step 3: Apply database migration
echo "🗄️  Step 3/5: Applying database migration..."
supabase db push
echo "✅ Database migration applied"
echo ""

# Step 4: Deploy Edge Functions
echo "☁️  Step 4/5: Deploying Edge Functions..."
supabase functions deploy send-notification
echo "✅ Edge Function deployed"
echo ""

# Step 5: Summary
echo "🎉 Step 5/5: Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Add NotificationBell component to your app header"
echo "  2. Initialize notifications in your root layout"
echo "  3. Test on physical device (not simulator)"
echo "  4. Send your first test notification"
echo ""
echo "📖 Documentation:"
echo "  - Setup Guide: PUSH_NOTIFICATIONS_SETUP.md"
echo "  - Examples: NOTIFICATION_EXAMPLES.md"
echo "  - Summary: NOTIFICATIONS_README.md"
echo ""
echo "✨ Ready to send notifications! 🚀"
