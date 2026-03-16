/**
 * 🔔 Notification Bell Component
 * Shows unread notification count with bell icon
 * Note: Push notifications only work on mobile (iOS/Android)
 * Web users can still view in-app notifications
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const theme = {
  colors: {
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    background: '#000000',
    card: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
    primary: '#FF6B35',
    error: '#FF3B30',
  },
};

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', {
          p_user_id: user.id,
        });

      if (!error && typeof data === 'number') {
        setUnreadCount(data);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification change:', payload);
          fetchUnreadCount();
          if (showModal) {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const notifications = await notificationService.getNotifications(
        user.id,
        50
      );
      setNotifications(notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellPress = () => {
    setShowModal(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      fetchUnreadCount();
    }

    setShowModal(false);

    const data = notification.data || {};

    switch (notification.type) {
      // ── Event notifications → Event Detail (or list if no id) ────────
      case 'meeting_reminder':
      case 'attendance_marked':
        if (data.eventId) {
          router.push({ pathname: '/event-detail', params: { eventId: data.eventId } } as any);
        } else {
          router.push('/event-meetings' as any);
        }
        break;

      // ── Links → Links channel-detail ────────────────────────────────
      case 'link_received':
      case 'link_sent':
        router.push({
          pathname: '/channel-detail',
          params: { channelId: '', channelSlug: 'links' },
        } as any);
        break;

      // ── Deals → Deals channel-detail ────────────────────────────────
      case 'deal_recorded':
        router.push({
          pathname: '/channel-detail',
          params: { channelId: '', channelSlug: 'deals' },
        } as any);
        break;

      // ── I2WE meetings → 12we-meetings channel-detail ────────────────
      case 'i2we_meeting_scheduled':
      case 'i2we_meeting_recorded':
        router.push({
          pathname: '/channel-detail',
          params: { channelId: '', channelSlug: '12we-meetings' },
        } as any);
        break;

      // ── AI suggestions → Discover tab ───────────────────────────────
      case 'ai_match_suggestion':
        router.push('/(tabs)/discover' as any);
        break;

      // ── AI inactive reminder → AI tab ───────────────────────────────
      case 'ai_inactive_reminder':
        router.push('/(tabs)/index' as any);
        break;

      // ── Application / onboarding → Profile tab ──────────────────────
      case 'application_submitted':
      case 'application_approved':
        router.push('/(tabs)/profile' as any);
        break;

      default:
        console.log('No navigation defined for type:', notification.type);
        break;
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setUnreadCount(0);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const renderNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      link_received: '🔗',
      deal_recorded: '💰',
      meeting_reminder: '📅',
      attendance_marked: '✓',
      ai_match_suggestion: '🤝',
      ai_inactive_reminder: '👋',
      application_submitted: '📝',
      application_approved: '🎉',
      i2we_meeting_scheduled: '📅',
      i2we_meeting_recorded: '✅',
    };
    return iconMap[type] || '🔔';
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconEmoji}>{renderNotificationIcon(item.type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity style={styles.bellContainer} onPress={handleBellPress}>
        <Bell size={24} color={theme.colors.text} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  style={styles.markAllButton}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                We'll notify you when something important happens
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error || '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
  },
  markAllText: {
    fontFamily: 'Poppins-Medium',
    color: theme.colors.primary,
    fontSize: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.colors.card || 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: theme.colors.primary + '15',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  notificationBody: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
