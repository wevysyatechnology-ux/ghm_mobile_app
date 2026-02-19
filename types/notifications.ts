/**
 * 🔔 Notification Types for WeVysya
 * Defines all notification categories and their payload structures
 */

export type NotificationType =
  // Member Activity
  | 'link_received'
  | 'deal_recorded'
  | 'i2we_meeting_scheduled'
  // House & Events
  | 'meeting_reminder'
  | 'attendance_marked'
  // AI Smart Notifications
  | 'ai_match_suggestion'
  | 'ai_inactive_reminder'
  // Onboarding
  | 'application_submitted'
  | 'application_approved';

export interface BaseNotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Member Activity Notifications
export interface LinkReceivedPayload extends BaseNotificationPayload {
  type: 'link_received';
  data: {
    linkId: string;
    senderName: string;
    senderId: string;
    houseName: string;
    houseId: string;
    linkType: 'business' | 'personal';
  };
}

export interface DealRecordedPayload extends BaseNotificationPayload {
  type: 'deal_recorded';
  data: {
    dealId: string;
    memberName: string;
    memberId: string;
    amount: number;
    currency: string;
    dealType: string;
  };
}

export interface I2WEMeetingScheduledPayload extends BaseNotificationPayload {
  type: 'i2we_meeting_scheduled';
  data: {
    meetingId: string;
    schedulerName: string;
    schedulerId: string;
    meetingDate: string;
    notes?: string;
  };
}

// House & Event Notifications
export interface MeetingReminderPayload extends BaseNotificationPayload {
  type: 'meeting_reminder';
  data: {
    eventId: string;
    houseName: string;
    houseId: string;
    date: string;
    time: string;
    location?: string;
    meetingType: 'house' | 'chapter' | 'special';
  };
}

export interface AttendanceMarkedPayload extends BaseNotificationPayload {
  type: 'attendance_marked';
  data: {
    eventId: string;
    eventName: string;
    eventDate: string;
    attendanceStatus: 'present' | 'absent' | 'excused';
  };
}

// AI Smart Notifications
export interface AIMatchSuggestionPayload extends BaseNotificationPayload {
  type: 'ai_match_suggestion';
  data: {
    matchId: string;
    memberName: string;
    memberId: string;
    matchScore: number;
    matchReason: string;
    industry?: string;
  };
}

export interface AIInactiveReminderPayload extends BaseNotificationPayload {
  type: 'ai_inactive_reminder';
  data: {
    daysSinceLastActivity: number;
    suggestedActions: string[];
  };
}

// Onboarding Notifications
export interface ApplicationSubmittedPayload extends BaseNotificationPayload {
  type: 'application_submitted';
  data: {
    applicationId: string;
    submittedAt: string;
    expectedReviewDays: number;
  };
}

export interface ApplicationApprovedPayload extends BaseNotificationPayload {
  type: 'application_approved';
  data: {
    applicationId: string;
    houseName: string;
    houseId: string;
    welcomeMessage?: string;
    nextSteps?: string[];
  };
}

// Union type for all notification payloads
export type NotificationPayload =
  | LinkReceivedPayload
  | DealRecordedPayload
  | I2WEMeetingScheduledPayload
  | MeetingReminderPayload
  | AttendanceMarkedPayload
  | AIMatchSuggestionPayload
  | AIInactiveReminderPayload
  | ApplicationSubmittedPayload
  | ApplicationApprovedPayload;

// Database schema for notifications
export interface NotificationRecord {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
  read_at?: string;
  // FCM specific
  fcm_message_id?: string;
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
}

// Notification preferences
export interface NotificationPreferences {
  user_id: string;
  // Member Activity
  link_received: boolean;
  deal_recorded: boolean;
  i2we_meeting_scheduled: boolean;
  // House & Events
  meeting_reminder: boolean;
  attendance_marked: boolean;
  // AI Smart
  ai_match_suggestion: boolean;
  ai_inactive_reminder: boolean;
  // Onboarding
  application_submitted: boolean;
  application_approved: boolean;
  // Global settings
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string;
}

// Notification template helpers
export const NotificationTemplates: Record<
  NotificationType,
  (data: any) => { title: string; body: string }
> = {
  link_received: (data) => ({
    title: '🔗 New Business Link',
    body: `You've received a verified business link from ${data.senderName} in ${data.houseName}.`,
  }),
  deal_recorded: (data) => ({
    title: '💰 Deal Recorded',
    body: `${data.memberName} has recorded a deal with you worth ${data.currency}${data.amount.toLocaleString()}.`,
  }),
  i2we_meeting_scheduled: (data) => ({
    title: '📅 I2WE Meeting Scheduled',
    body: `${data.schedulerName} has scheduled a 1-on-1 meeting with you on ${data.meetingDate}.`,
  }),
  meeting_reminder: (data) => ({
    title: '📅 Meeting Reminder',
    body: `Your ${data.houseName} meeting is scheduled on ${data.date} at ${data.time}.`,
  }),
  attendance_marked: (data) => ({
    title: '✓ Attendance Confirmed',
    body: `Your attendance for ${data.eventName} has been successfully recorded.`,
  }),
  ai_match_suggestion: (data) => ({
    title: '🤝 AI Match Found',
    body: `WeVysya AI found a potential collaboration opportunity with ${data.memberName}.`,
  }),
  ai_inactive_reminder: (data) => ({
    title: '👋 We Miss You',
    body: `You haven't interacted within WeVysya recently. Explore new opportunities today.`,
  }),
  application_submitted: (data) => ({
    title: '📝 Application Received',
    body: `Your membership application is under review.`,
  }),
  application_approved: (data) => ({
    title: '🎉 Welcome to WeVysya',
    body: `Your membership has been approved. You are now part of ${data.houseName}.`,
  }),
};

// Navigation mapping for notifications
export const NotificationNavigationMap: Record<NotificationType, string> = {
  link_received: '/links-form',
  deal_recorded: '/deals-form',
  i2we_meeting_scheduled: '/i2we-form',
  meeting_reminder: '/channels',
  attendance_marked: '/(tabs)/activity',
  ai_match_suggestion: '/(tabs)/discover',
  ai_inactive_reminder: '/(tabs)/index',
  application_submitted: '/(tabs)/profile',
  application_approved: '/(tabs)/profile',
};
