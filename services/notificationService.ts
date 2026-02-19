/**
 * 🔔 Notification Service
 * Handles FCM token registration, notification permissions, and local notification display
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import {
  NotificationPayload,
  NotificationType,
  NotificationTemplates,
  NotificationNavigationMap,
} from '@/types/notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize notification service
   * - Request permissions
   * - Register FCM token
   * - Set up listeners
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      console.log('🔔 Initializing notification service...');

      // Skip push notifications on web (requires VAPID keys)
      if (Platform.OS === 'web') {
        console.warn('⚠️ Push notifications not supported on web builds');
        console.warn('📱 Please use the mobile app (iOS/Android) for push notifications');
        return false;
      }

      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices');
        return false;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Notification permissions denied');
        return false;
      }

      // Get Expo push token
      this.expoPushToken = await this.registerForPushNotifications();
      if (!this.expoPushToken) {
        console.error('❌ Failed to get push token');
        return false;
      }

      console.log('✅ Push token obtained:', this.expoPushToken);

      // Save token to database
      await this.saveTokenToDatabase(userId, this.expoPushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      // Set notification channel for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }

      console.log('✅ Notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
      });

      return tokenData.data;
    } catch (error) {
      console.error('❌ Token registration failed:', error);
      return null;
    }
  }

  /**
   * Save push token to database
   */
  async saveTokenToDatabase(
    userId: string,
    token: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: userId,
            expo_push_token: token,
            device_type: Platform.OS,
            device_name: Device.deviceName || 'Unknown',
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,expo_push_token',
          }
        );

      if (error) throw error;
      console.log('✅ Push token saved to database');
    } catch (error) {
      console.error('❌ Failed to save token:', error);
      throw error;
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('🔔 Notification received:', notification);
        this.handleNotificationReceived(notification);
      });

    // Listener for user interactions with notifications
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Notification tapped:', response);
        this.handleNotificationTapped(response);
      });
  }

  /**
   * Handle notification received (foreground)
   */
  private handleNotificationReceived(
    notification: Notifications.Notification
  ): void {
    // Update badge count
    this.updateBadgeCount();

    // Store notification in local state/database
    const payload = notification.request.content.data as unknown as NotificationPayload;
    if (payload && payload.type) {
      this.saveNotificationLocally(payload);
    }
  }

  /**
   * Handle notification tapped (navigation)
   */
  private handleNotificationTapped(
    response: Notifications.NotificationResponse
  ): void {
    const payload = response.notification.request.content
      .data as unknown as NotificationPayload;

    if (!payload || !payload.type) return;

    // Navigate to appropriate screen
    const screen = NotificationNavigationMap[payload.type];
    if (screen) {
      // You'll need to implement navigation logic here
      // Example: router.push(screen)
      console.log('🚀 Navigate to:', screen);
    }

    // Mark notification as read if ID is in data
    const notificationId = (payload.data as any)?.notificationId;
    if (notificationId) {
      this.markAsRead(notificationId);
    }
  }

  /**
   * Set up Android notification channel
   */
  async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
      });

      // High priority channel for important notifications
      await Notifications.setNotificationChannelAsync('high-priority', {
        name: 'High Priority',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
        sound: 'default',
        enableVibrate: true,
      });
    }
  }

  /**
   * Send local notification (for testing or when app receives remote notification)
   */
  async sendLocalNotification(
    type: NotificationType,
    data: any
  ): Promise<void> {
    try {
      const template = NotificationTemplates[type](data);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: template.title,
          body: template.body,
          data: { type, ...data },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      console.log('✅ Local notification sent');
    } catch (error) {
      console.error('❌ Failed to send local notification:', error);
    }
  }

  /**
   * Update badge count
   */
  async updateBadgeCount(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .eq('read', false);

      await Notifications.setBadgeCountAsync(count || 0);
    } catch (error) {
      console.error('❌ Failed to update badge count:', error);
    }
  }

  /**
   * Save notification to database
   */
  async saveNotificationLocally(payload: NotificationPayload): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase.from('notifications').insert({
        user_id: user.user.id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        read: false,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to save notification:', error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      // Update badge count
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Failed to mark as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('read', false);

      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
