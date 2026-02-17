# 🔔 Push Notifications Setup Guide

This guide will help you set up push notifications for WeVysya using Expo's notification system (which doesn't require Firebase).

## Overview

WeVysya uses **Expo Push Notifications**, which is simpler than Firebase and works out-of-the-box for both iOS and Android without additional setup.

**Why Expo over Firebase?**
- ✅ No Firebase project needed
- ✅ No native configuration (google-services.json, GoogleService-Info.plist)
- ✅ Works immediately in development
- ✅ Built-in Expo Go support
- ✅ Simpler backend integration

---

## 📦 1. Install Dependencies

```bash
npx expo install expo-notifications expo-device
```

These packages are already included in your project.

---

## 🔧 2. Configure app.json

Add the following notification configuration to your `app.json`:

```json
{
  "expo": {
    "name": "WeVysya",
    "slug": "wevysya",
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#FF6B35",
      "androidMode": "default",
      "androidCollapsedTitle": "WeVysya"
    },
    "android": {
      "package": "com.wevysya.app",
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "VIBRATE",
        "USE_FINGERPRINT",
        "NOTIFICATIONS"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.wevysya.app",
      "supportsTablet": true,
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

---

## 🖼️ 3. Create Notification Icon (Android Only)

Create a notification icon at `assets/images/notification-icon.png`:

**Requirements:**
- Size: 96x96 pixels
- Format: PNG with transparency
- Style: White icon on transparent background
- Simple design (will be tinted by Android)

You can use this command to generate it from your app icon:

```bash
# Using ImageMagick (install first)
convert assets/images/icon.png -resize 96x96 -alpha on -channel RGB -negate assets/images/notification-icon.png
```

---

## 🗄️ 4. Set Up Database

Run the migration to create notification tables:

```bash
# If using Supabase local
supabase migration up

# Or apply manually
supabase db reset
```

This creates:
- `notifications` - Stores all sent notifications
- `push_tokens` - Stores user device tokens
- `notification_preferences` - User notification settings

---

## 🚀 5. Deploy Backend Functions

Deploy the notification sending function:

```bash
supabase functions deploy send-notification
```

This Edge Function handles:
- Fetching user push tokens
- Checking notification preferences
- Sending via Expo's push service
- Saving notifications to database

---

## 📱 6. Initialize in Your App

Add notification initialization to your root layout or AuthContext:

**In `app/_layout.tsx`:**

```typescript
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';

export default function RootLayout() {
  const { user } = useAuth();
  const { hasPermission, requestPermission } = useNotifications();

  useEffect(() => {
    if (user && !hasPermission) {
      // Request permission on first launch
      requestPermission();
    }
  }, [user]);

  return (
    // Your layout JSX
  );
}
```

---

## 🔔 7. Add Notification Bell to UI

Add the notification bell component to your navigation header:

**Example in `app/(tabs)/_layout.tsx`:**

```typescript
import { NotificationBell } from '@/components/shared/NotificationBell';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <NotificationBell />,
      }}
    >
      {/* Your tabs */}
    </Tabs>
  );
}
```

---

## 📤 8. Sending Notifications

### From Backend (Recommended)

Call the Supabase Edge Function from your backend logic:

```typescript
// Example: Send notification when deal is recorded
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
  body: JSON.stringify({
    userId: 'recipient-user-id',
    type: 'deal_recorded',
    title: '💰 Deal Recorded',
    body: 'John Doe has recorded a deal with you worth ₹50,000.',
    data: {
      dealId: 'deal-123',
      memberName: 'John Doe',
      memberId: 'user-456',
      amount: 50000,
      currency: '₹',
      dealType: 'service',
    },
  }),
});
```

### From Client (Testing)

For testing, send a local notification:

```typescript
import { notificationService } from '@/services/notificationService';

// Send test notification
await notificationService.sendLocalNotification('deal_recorded', {
  dealId: 'test-123',
  memberName: 'Test User',
  memberId: 'user-123',
  amount: 10000,
  currency: '₹',
  dealType: 'product',
});
```

---

## 🧪 9. Testing Notifications

### Test in Development

1. **Run app on physical device** (notifications don't work in simulator):
   ```bash
   npx expo start
   ```

2. **Scan QR code** with Expo Go app

3. **Send test notification**:
   ```bash
   curl -X POST "https://your-project.supabase.co/functions/v1/send-notification" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{
       "userId": "user-id-here",
       "type": "deal_recorded",
       "title": "Test Notification",
       "body": "This is a test notification"
     }'
   ```

4. **Check console** for push token registration

### Test Notification Delivery

Use Expo's Push Notification Tool: https://expo.dev/notifications

1. Copy your Expo Push Token from logs
2. Paste into the tool
3. Send a test notification

---

## 📋 10. Notification Types Reference

| Type | Trigger | Title | Body |
|------|---------|-------|------|
| `link_received` | Member receives business link | 🔗 New Business Link | You've received a verified business link from {{Name}} in {{House}} |
| `deal_recorded` | Deal posted with member | 💰 Deal Recorded | {{Name}} has recorded a deal with you worth {{Amount}} |
| `meeting_reminder` | Upcoming meeting (1 day before) | 📅 Meeting Reminder | Your {{House}} meeting is scheduled on {{Date}} at {{Time}} |
| `attendance_marked` | Attendance recorded | ✓ Attendance Confirmed | Your attendance for {{Event}} has been successfully recorded |
| `ai_match_suggestion` | AI finds potential match | 🤝 AI Match Found | WeVysya AI found a potential collaboration with {{Name}} |
| `ai_inactive_reminder` | User inactive 7+ days | 👋 We Miss You | You haven't interacted recently. Explore new opportunities today |
| `application_submitted` | Application submitted | 📝 Application Received | Your membership application is under review |
| `application_approved` | Membership approved | 🎉 Welcome to WeVysya | Your membership has been approved. You are now part of {{House}} |

---

## ⚙️ 11. User Notification Preferences

Users can manage notification preferences in their profile:

```typescript
// Get user preferences
const { data } = await supabase
  .from('notification_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();

// Update preferences
await supabase
  .from('notification_preferences')
  .update({
    link_received: true,
    deal_recorded: false, // User disabled this
    meeting_reminder: true,
  })
  .eq('user_id', userId);
```

---

## 🚨 12. Troubleshooting

### No Push Token Generated

**Issue:** Log shows "Failed to get push token"

**Solutions:**
1. Ensure running on **physical device** (not simulator)
2. Check network connection
3. Verify Expo account is set up: `npx expo login`
4. Check `projectId` in `app.json` matches your Expo project

### Notifications Not Received

**Issue:** Token generated but notifications not appearing

**Solutions:**
1. Check notification permissions: Settings → WeVysya → Notifications
2. Verify push token saved to database:
   ```sql
   SELECT * FROM push_tokens WHERE user_id = 'your-user-id';
   ```
3. Check user's notification preferences (all enabled?)
4. Verify Edge Function deployed: `supabase functions list`
5. Check Edge Function logs: `supabase functions logs send-notification`

### Android Notifications Not Showing

**Issue:** iOS works but Android doesn't

**Solutions:**
1. Ensure notification icon exists: `assets/images/notification-icon.png`
2. Check Android permissions in `app.json`
3. Verify notification channel is created (check logs)
4. Try uninstalling and reinstalling the app

### Badge Count Not Updating

**Issue:** Red badge doesn't show unread count

**Solutions:**
1. iOS: Ensure `"supportsTablet": true` in `app.json`
2. Check badge permission granted
3. Verify `setBadgeCountAsync` is called
4. iOS: Check Settings → Notifications → Badges enabled

---

## 🔐 13. Security Best Practices

1. **Never expose push tokens publicly**
   - Push tokens are saved with RLS policies
   - Only user can read their own tokens

2. **Validate notification payloads**
   - Edge Function validates all fields
   - Prevents injection attacks

3. **Rate limiting**
   - Consider adding rate limits to prevent spam
   - Supabase has built-in rate limiting

4. **User preferences**
   - Always check preferences before sending
   - Edge Function automatically filters

---

## 📊 14. Monitoring & Analytics

Track notification metrics:

```sql
-- Delivery rate
SELECT 
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) as delivered,
  ROUND(100.0 * COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) / COUNT(*), 2) as delivery_rate
FROM notifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY type;

-- Read rate
SELECT 
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN read = true THEN 1 END) as read_count,
  ROUND(100.0 * COUNT(CASE WHEN read = true THEN 1 END) / COUNT(*), 2) as read_rate
FROM notifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY type;
```

---

## 🎯 15. Production Deployment

Before going to production:

1. ✅ Build standalone app (not Expo Go):
   ```bash
   eas build --platform all
   ```

2. ✅ Configure iOS certificates and provisioning profiles

3. ✅ Set up FCM for Android (if needed for advanced features)

4. ✅ Test notifications on real devices

5. ✅ Set up monitoring and error tracking

6. ✅ Configure quiet hours support

7. ✅ Add opt-in prompts for better permission rates

---

## 📚 Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Best Practices for Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)

---

## ❓ FAQ

**Q: Do I need a Firebase project?**
A: No! Expo handles everything. Firebase is optional for advanced features.

**Q: Will notifications work in Expo Go?**
A: Yes, during development. Production builds work independently.

**Q: What's the notification limit?**
A: Expo has generous free tier. Check [pricing](https://expo.dev/pricing) for limits.

**Q: Can I customize notification sounds?**
A: Yes, place custom sounds in `assets/sounds/` and reference them.

**Q: How do I handle deep linking?**
A: Use the notification data payload to navigate to specific screens.

---

## ✅ Quick Checklist

- [ ] Dependencies installed (`expo-notifications`, `expo-device`)
- [ ] `app.json` configured with notification settings
- [ ] Notification icon created (Android)
- [ ] Database migration applied
- [ ] Edge Function deployed
- [ ] Notification service initialized in app
- [ ] NotificationBell component added to UI
- [ ] Tested on physical device
- [ ] User preferences working
- [ ] Monitoring set up

---

**Need help?** Check the troubleshooting section or refer to Expo's documentation.
