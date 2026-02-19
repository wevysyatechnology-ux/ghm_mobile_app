import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Sparkles, Compass, Activity, User } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBell } from '@/components/shared/NotificationBell';

export default function TabLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
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
          tabBarStyle: {
            backgroundColor: colors.bg_primary,
            borderTopColor: 'rgba(52, 211, 153, 0.15)',
            borderTopWidth: 1,
            height: Platform.OS === 'web' ? 85 : 85,
            paddingBottom: Platform.OS === 'web' ? 18 : 20,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarActiveTintColor: colors.accent_green_bright,
          tabBarInactiveTintColor: colors.text_muted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
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
