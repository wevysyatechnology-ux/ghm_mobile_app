/**
 * 📘 Notification Usage Examples
 * Copy these examples to implement notifications in your app
 */

import {
  sendLinkReceivedNotification,
  sendDealRecordedNotification,
  sendMeetingReminderNotification,
  sendAttendanceMarkedNotification,
  sendAIMatchSuggestionNotification,
  sendAIInactiveReminderNotification,
  sendApplicationSubmittedNotification,
  sendApplicationApprovedNotification,
} from '@/utils/notificationHelpers';

// ==========================================
// EXAMPLE 1: Send notification when link is shared
// ==========================================

async function onLinkShared(linkData: any) {
  await sendLinkReceivedNotification({
    recipientId: linkData.recipientId,
    linkId: linkData.id,
    senderName: linkData.senderName,
    senderId: linkData.senderId,
    houseName: linkData.houseName,
    houseId: linkData.houseId,
    linkType: 'business',
  });
}

// ==========================================
// EXAMPLE 2: Send notification when deal is recorded
// ==========================================

async function onDealRecorded(dealData: any) {
  // Notify the other party in the deal
  await sendDealRecordedNotification({
    recipientId: dealData.otherPartyId,
    dealId: dealData.id,
    memberName: dealData.creatorName,
    memberId: dealData.creatorId,
    amount: dealData.amount,
    currency: '₹',
    dealType: dealData.type,
  });
}

// ==========================================
// EXAMPLE 3: Send meeting reminder (24 hours before)
// ==========================================

async function sendMeetingReminders() {
  // This could be a cron job or scheduled task
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get all meetings happening tomorrow
  const { data: meetings } = await supabase
    .from('events')
    .select(`
      id,
      title,
      event_date,
      event_time,
      location,
      type,
      house:houses (
        id,
        name,
        members:members (user_id)
      )
    `)
    .gte('event_date', tomorrow.toISOString().split('T')[0])
    .lte('event_date', tomorrow.toISOString().split('T')[0]);

  // Send reminders to all members
  for (const meeting of meetings || []) {
    const memberIds = meeting.house.members.map((m: any) => m.user_id);
    
    await sendMeetingReminderNotification({
      userIds: memberIds,
      eventId: meeting.id,
      houseName: meeting.house.name,
      houseId: meeting.house.id,
      date: new Date(meeting.event_date).toLocaleDateString(),
      time: meeting.event_time,
      location: meeting.location,
      meetingType: meeting.type,
    });
  }
}

// ==========================================
// EXAMPLE 4: Send attendance confirmation
// ==========================================

async function onAttendanceMarked(attendanceData: any) {
  await sendAttendanceMarkedNotification({
    userId: attendanceData.userId,
    eventId: attendanceData.eventId,
    eventName: attendanceData.eventName,
    eventDate: attendanceData.eventDate,
    attendanceStatus: attendanceData.status,
  });
}

// ==========================================
// EXAMPLE 5: AI-powered match suggestions
// ==========================================

async function sendAIMatchSuggestions(userId: string) {
  // Your AI matching logic here
  const matches = await getAIMatches(userId);

  for (const match of matches) {
    await sendAIMatchSuggestionNotification({
      userId: userId,
      matchId: match.id,
      memberName: match.name,
      memberId: match.userId,
      matchScore: match.score,
      matchReason: match.reason,
      industry: match.industry,
    });
  }
}

// ==========================================
// EXAMPLE 6: Send inactive user reminder
// ==========================================

async function sendInactiveUserReminders() {
  // Find users inactive for 7+ days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: inactiveUsers } = await supabase
    .from('profiles')
    .select('id, last_activity_at')
    .lt('last_activity_at', sevenDaysAgo.toISOString());

  for (const user of inactiveUsers || []) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(user.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    await sendAIInactiveReminderNotification({
      userId: user.id,
      daysSinceLastActivity: daysSinceActivity,
      suggestedActions: [
        'Browse new members',
        'Check recent deals',
        'Attend upcoming meetings',
      ],
    });
  }
}

// ==========================================
// EXAMPLE 7: Application lifecycle notifications
// ==========================================

async function onApplicationSubmitted(applicationData: any) {
  await sendApplicationSubmittedNotification({
    userId: applicationData.userId,
    applicationId: applicationData.id,
    submittedAt: new Date().toISOString(),
    expectedReviewDays: 7,
  });
}

async function onApplicationApproved(applicationData: any) {
  await sendApplicationApprovedNotification({
    userId: applicationData.userId,
    applicationId: applicationData.id,
    houseName: applicationData.houseName,
    houseId: applicationData.houseId,
    welcomeMessage: 'Welcome to the WeVysya family!',
    nextSteps: [
      'Complete your profile',
      'Join your house channel',
      'Attend the next meeting',
    ],
  });
}

// ==========================================
// EXAMPLE 8: Integrate with Supabase triggers
// ==========================================

// You can also send notifications via database triggers
// Create a Postgres function and trigger:

/*
-- In Supabase SQL Editor:

CREATE OR REPLACE FUNCTION notify_on_deal_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
    body := json_build_object(
      'userId', NEW.recipient_id,
      'type', 'deal_recorded',
      'title', '💰 Deal Recorded',
      'body', 'A new deal has been recorded with you',
      'data', json_build_object('dealId', NEW.id)
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER deal_notification_trigger
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_deal_created();
*/

// ==========================================
// EXAMPLE 9: Schedule notifications with cron
// ==========================================

// Create a Supabase Edge Function with cron trigger:

/*
// supabase/functions/scheduled-notifications/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // This function runs on schedule (e.g., daily at 9 AM)
  
  // Send meeting reminders
  await sendMeetingReminders();
  
  // Send inactive user reminders
  await sendInactiveUserReminders();
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});

// Deploy with cron schedule:
// supabase functions deploy scheduled-notifications --schedule "0 9 * * *"
*/

// ==========================================
// EXAMPLE 10: Handle notification taps in app
// ==========================================

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

function App() {
  const router = useRouter();

  useEffect(() => {
    // Handle notification tap when app is in foreground/background
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Navigate based on notification type
        switch (data.type) {
          case 'link_received':
            router.push('/links-form');
            break;
          case 'deal_recorded':
            router.push(`/deals/${data.dealId}`);
            break;
          case 'meeting_reminder':
            router.push(`/events/${data.eventId}`);
            break;
          case 'ai_match_suggestion':
            router.push(`/profile/${data.memberId}`);
            break;
          default:
            router.push('/(tabs)');
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return null; // Your app content
}
