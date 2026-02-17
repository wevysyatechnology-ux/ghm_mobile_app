import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AIProfileActions from '@/components/profile/AIProfileActions';
import MembershipCard from '@/components/profile/MembershipCard';
import AttendanceStatusBanner from '@/components/profile/AttendanceStatusBanner';
import FloatingLogo from '@/components/shared/FloatingLogo';
import { LogOut } from 'lucide-react-native';

export default function Profile() {
  const { profile, user, coreMembership, virtualMembership, signOut } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to logout?')) {
        try {
          await signOut();
        } catch (error) {
          console.error('Logout error:', error);
          alert('Failed to logout. Please try again.');
        }
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            },
          },
        ]
      );
    }
  };

  const circleType: 'inner' | 'open' = profile?.vertical_type === 'inner_circle' ? 'inner' : 'open';
  const tierType: 'privileged' | 'virtual' | 'regular' = coreMembership ? 'privileged' : virtualMembership ? 'virtual' : 'regular';

  // Get house and zone information
  const houseName = profile?.house?.house_name;
  const zoneName = profile?.zone;
  
  // Category line: show house name if available, otherwise business category
  const categoryText = houseName || profile?.business_category || profile?.business || 'Not set';
  
  // Location line: show zone if available, otherwise location
  const locationText = zoneName || 
    [profile?.city, profile?.state, profile?.country]
      .filter(Boolean)
      .join(', ') || 'Not set';

  const userData = {
    id: profile?.id || '',
    name: profile?.full_name || 'User',
    email: user?.email || '',
    category: categoryText,
    location: locationText,
    circle: circleType,
    tier: tierType,
    profile_photo: undefined,
    is_online: true,
    created_at: profile?.created_at || new Date().toISOString(),
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <FloatingLogo size="medium" />
        </View>
        <ProfileHeader user={userData} />
        {profile?.vertical_type === 'inner_circle' && profile.attendance_status && (
          <AttendanceStatusBanner
            attendanceStatus={profile.attendance_status}
            absenceCount={profile.absence_count || 0}
          />
        )}
        <AIProfileActions />
        <MembershipCard user={userData} />

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.danger_red} strokeWidth={2} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_primary,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 160,
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.danger_red + '40',
    backgroundColor: colors.danger_red + '10',
  },
  logoutText: {
    color: colors.danger_red,
    fontSize: 16,
    fontWeight: '600',
  },
});
