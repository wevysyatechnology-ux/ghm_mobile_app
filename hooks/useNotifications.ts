/**
 * 🔔 useNotifications Hook
 * Manages notification permissions, initialization, and state
 */

import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initializeNotifications();
    }

    return () => {
      notificationService.cleanup();
    };
  }, [user]);

  const initializeNotifications = async () => {
    if (!user) return;

    // Skip initialization on web
    if (Platform.OS === 'web') {
      console.log('📱 Push notifications are only available on mobile apps');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const success = await notificationService.initialize(user.id);
      setIsInitialized(success);
      setHasPermission(success);

      if (success) {
        const token = notificationService.getPushToken();
        setPushToken(token);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);

    if (granted && user) {
      await initializeNotifications();
    }

    return granted;
  }, [user]);

  const checkPermissionStatus = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  return {
    isInitialized,
    hasPermission,
    pushToken,
    isLoading,
    requestPermission,
    checkPermissionStatus,
  };
}
