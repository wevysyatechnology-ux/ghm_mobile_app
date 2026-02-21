/**
 * 📤 Notification Sender Utilities
 * Helper functions to send specific notification types
 */

import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const NOTIFICATION_ENDPOINT = `${SUPABASE_URL}/functions/v1/send-notification`;

interface SendNotificationOptions {
  userId?: string;
  userIds?: string[];
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Base function to send notification via Edge Function
 */
async function sendNotification(options: SendNotificationOptions): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      console.warn('⚠️ Skipping push send on web. Mobile push flow only.');
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(NOTIFICATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send notification:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Notification sent:', result);
    return true;
  } catch (error) {
    console.error('❌ Notification error:', error);
    return false;
  }
}

/**
 * 🔗 Send Link Received Notification
 */
export async function sendLinkReceivedNotification(params: {
  recipientId: string;
  linkId: string;
  senderName: string;
  senderId: string;
  houseName: string;
  houseId: string;
  linkType: 'business' | 'personal';
}): Promise<boolean> {
  return sendNotification({
    userId: params.recipientId,
    type: 'link_received',
    title: '🔗 New Business Link',
    body: `You've received a verified business link from ${params.senderName} in ${params.houseName}.`,
    data: {
      linkId: params.linkId,
      senderName: params.senderName,
      senderId: params.senderId,
      houseName: params.houseName,
      houseId: params.houseId,
      linkType: params.linkType,
    },
    priority: 'high',
  });
}

/**
 * 💰 Send Deal Recorded Notification
 */
export async function sendDealRecordedNotification(params: {
  recipientId: string;
  dealId: string;
  memberName: string;
  memberId: string;
  amount: number;
  currency: string;
  dealType: string;
}): Promise<boolean> {
  return sendNotification({
    userId: params.recipientId,
    type: 'deal_recorded',
    title: '💰 Deal Recorded',
    body: `${params.memberName} has recorded a deal with you worth ${params.currency}${params.amount.toLocaleString()}.`,
    data: {
      dealId: params.dealId,
      memberName: params.memberName,
      memberId: params.memberId,
      amount: params.amount,
      currency: params.currency,
      dealType: params.dealType,
    },
    priority: 'high',
  });
}

/**
 * 📅 Send Meeting Reminder Notification
 */
export async function sendMeetingReminderNotification(params: {
  userIds: string[]; // All members in house
  eventId: string;
  houseName: string;
  houseId: string;
  date: string;
  time: string;
  location?: string;
  meetingType: 'house' | 'chapter' | 'special';
}): Promise<boolean> {
  return sendNotification({
    userIds: params.userIds,
    type: 'meeting_reminder',
    title: '📅 Meeting Reminder',
    body: `Your ${params.houseName} meeting is scheduled on ${params.date} at ${params.time}.`,
    data: {
      eventId: params.eventId,
      houseName: params.houseName,
      houseId: params.houseId,
      date: params.date,
      time: params.time,
      location: params.location,
      meetingType: params.meetingType,
    },
    priority: 'high',
  });
}

/**
 * ✓ Send Attendance Marked Notification
 */
export async function sendAttendanceMarkedNotification(params: {
  userId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  attendanceStatus: 'present' | 'absent' | 'excused';
}): Promise<boolean> {
  return sendNotification({
    userId: params.userId,
    type: 'attendance_marked',
    title: '✓ Attendance Confirmed',
    body: `Your attendance for ${params.eventName} has been successfully recorded.`,
    data: {
      eventId: params.eventId,
      eventName: params.eventName,
      eventDate: params.eventDate,
      attendanceStatus: params.attendanceStatus,
    },
    priority: 'normal',
  });
}

/**
 * 📅 Send I2WE Meeting Scheduled Notification
 */
export async function sendI2WEMeetingScheduledNotification(params: {
  recipientId: string;
  meetingId: string;
  schedulerName: string;
  schedulerId: string;
  meetingDate: string;
  notes?: string;
}): Promise<boolean> {
  return sendNotification({
    userId: params.recipientId,
    type: 'i2we_meeting_scheduled',
    title: '📅 I2WE Meeting Scheduled',
    body: `${params.schedulerName} has scheduled a 1-on-1 meeting with you on ${params.meetingDate}.`,
    data: {
      meetingId: params.meetingId,
      schedulerName: params.schedulerName,
      schedulerId: params.schedulerId,
      meetingDate: params.meetingDate,
      notes: params.notes,
    },
    priority: 'high',
  });
}

/**
 * 🤝 Send AI Match Suggestion Notification
 */
export async function sendAIMatchSuggestionNotification(params: {
  userId: string;
  matchId: string;
  memberName: string;
  memberId: string;
  matchScore: number;
  matchReason: string;
  industry?: string;
}): Promise<boolean> {
  return sendNotification({
    userId: params.userId,
    type: 'ai_match_suggestion',
    title: '🤝 AI Match Found',
    body: `WeVysya AI found a potential collaboration opportunity with ${params.memberName}.`,
    data: {
      matchId: params.matchId,
      memberName: params.memberName,
      memberId: params.memberId,
      matchScore: params.matchScore,
      matchReason: params.matchReason,
      industry: params.industry,
    },
    priority: 'normal',
  });
}

/**
 * 👋 Send AI Inactive Reminder Notification
 */
export async function sendAIInactiveReminderNotification(params: {
  userId: string;
  daysSinceLastActivity: number;
  suggestedActions: string[];
}): Promise<boolean> {
  return sendNotification({
    userId: params.userId,
    type: 'ai_inactive_reminder',
    title: '👋 We Miss You',
    body: `You haven't interacted within WeVysya recently. Explore new opportunities today.`,
    data: {
      daysSinceLastActivity: params.daysSinceLastActivity,
      suggestedActions: params.suggestedActions,
    },
    priority: 'normal',
  });
}

/**
 * 📝 Send Application Submitted Notification
 */
export async function sendApplicationSubmittedNotification(params: {
  userId: string;
  applicationId: string;
  submittedAt: string;
  expectedReviewDays: number;
}): Promise<boolean> {
  return sendNotification({
    userId: params.userId,
    type: 'application_submitted',
    title: '📝 Application Received',
    body: `Your membership application is under review.`,
    data: {
      applicationId: params.applicationId,
      submittedAt: params.submittedAt,
      expectedReviewDays: params.expectedReviewDays,
    },
    priority: 'normal',
  });
}

/**
 * 🎉 Send Application Approved Notification
 */
export async function sendApplicationApprovedNotification(params: {
  userId: string;
  applicationId: string;
  houseName: string;
  houseId: string;
  welcomeMessage?: string;
  nextSteps?: string[];
}): Promise<boolean> {
  return sendNotification({
    userId: params.userId,
    type: 'application_approved',
    title: '🎉 Welcome to WeVysya',
    body: `Your membership has been approved. You are now part of ${params.houseName}.`,
    data: {
      applicationId: params.applicationId,
      houseName: params.houseName,
      houseId: params.houseId,
      welcomeMessage: params.welcomeMessage,
      nextSteps: params.nextSteps,
    },
    priority: 'high',
  });
}

/**
 * 🔄 Batch send notifications (for announcements, etc.)
 */
export async function sendBatchNotification(params: {
  userIds: string[];
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<boolean> {
  return sendNotification({
    userIds: params.userIds,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data,
    priority: 'normal',
  });
}
