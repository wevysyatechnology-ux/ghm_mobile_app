import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AIProfileActions from '@/components/profile/AIProfileActions';
import MembershipCard from '@/components/profile/MembershipCard';
import AttendanceStatusBanner from '@/components/profile/AttendanceStatusBanner';
import FloatingLogo from '@/components/shared/FloatingLogo';

export default function Profile() {
  const { profile, user, coreMembership, virtualMembership } = useAuth();

  const circleType: 'inner' | 'open' = profile?.vertical_type === 'inner_circle' ? 'inner' : 'open';
  const tierType: 'privileged' | 'virtual' | 'regular' = coreMembership ? 'privileged' : virtualMembership ? 'virtual' : 'regular';

  const userData = {
    id: profile?.id || '',
    name: profile?.full_name || 'User',
    email: user?.email || '',
    category: profile?.business_category || 'Not set',
    location: [profile?.city, profile?.state, profile?.country]
      .filter(Boolean)
      .join(', ') || 'Not set',
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
});
