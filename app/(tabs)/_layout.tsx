import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Sparkles, Compass, Activity, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBell } from '@/components/shared/NotificationBell';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();

  const androidExtraBottom = Platform.OS === 'android' ? 12 : 0;
  const tabBarPaddingBottom =
    Platform.OS === 'web' ? 18 : Math.max(insets.bottom, 8) + androidExtraBottom;
  const tabBarHeight = 64 + tabBarPaddingBottom;

  // Initialize notifications when authenticated
  useNotifications();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <View style={styles.notificationContainer}>
        <NotificationBell />
      </View>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: colors.bg_primary,
            borderTopColor: 'rgba(52, 211, 153, 0.15)',
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingBottom: tabBarPaddingBottom,
            paddingTop: 8,
            position: 'absolute',
            bottom: Platform.OS === 'android' ? 4 : 0,
            left: 0,
            right: 0,
          },
          tabBarActiveTintColor: colors.accent_green_bright,
          tabBarInactiveTintColor: colors.text_muted,
          tabBarLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 11,
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'AI',
            tabBarIcon: ({ size, color }) => (
              <Sparkles size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ size, color }) => (
              <Compass size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ size, color }) => (
              <Activity size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: spacing.lg,
    zIndex: 9999,
  },
});
