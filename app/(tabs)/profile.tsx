import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AIProfileActions from '@/components/profile/AIProfileActions';
import MembershipCard from '@/components/profile/MembershipCard';
import AttendanceStatusBanner from '@/components/profile/AttendanceStatusBanner';
import FloatingLogo from '@/components/shared/FloatingLogo';
import { LogOut, Trash2, Lock, Settings } from 'lucide-react-native';

export default function Profile() {
  const { profile, user, coreMembership, virtualMembership, signOut, deleteAccount, changePassword } = useAuth();
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | undefined>(undefined);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      const msg = 'Please fill in all fields.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      return;
    }
    if (newPassword.length < 8) {
      const msg = 'New password must be at least 8 characters.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        const msg = 'Password changed successfully!';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
      } else {
        const msg = result.error || 'Failed to change password.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure, your account will be deleted permanently.')) {
        try {
          await deleteAccount();
        } catch (error) {
          console.error('Delete error:', error);
          alert('Failed to delete account. Please try again.');
        }
      }
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure, your account will be deleted permanently.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAccount();
              } catch (error) {
                console.error('Delete error:', error);
                Alert.alert('Error', 'Failed to delete account. Please try again.');
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
    profile_photo: localPhotoUrl ?? profile?.profile_photo ?? undefined,
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
        <ProfileHeader user={userData} onPhotoUpdated={(url) => setLocalPhotoUrl(url)} />
        {profile?.vertical_type === 'inner_circle' && profile.attendance_status && (
          <AttendanceStatusBanner
            attendanceStatus={profile.attendance_status}
            absenceCount={profile.absence_count || 0}
          />
        )}
        <AIProfileActions />
        <MembershipCard user={userData} />

        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={() => setShowPasswordModal(true)}
          activeOpacity={0.7}
        >
          <Lock size={20} color={colors.accent_green_bright} strokeWidth={2} />
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Settings size={20} color={colors.accent_green_bright} strokeWidth={2} />
          <Text style={styles.settingsButtonText}>Privacy & AI Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.danger_red} strokeWidth={2} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Change Password</Text>

              <TextInput
                style={styles.input}
                placeholder="Current password"
                placeholderTextColor={colors.text_muted}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="New password (min. 8 characters)"
                placeholderTextColor={colors.text_muted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={colors.text_muted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={passwordLoading}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirm}
                  onPress={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? <ActivityIndicator size="small" color={colors.bg_primary} />
                    : <Text style={styles.modalConfirmText}>Update</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color={colors.danger_red} strokeWidth={2} />
          <Text style={styles.deleteText}>Delete my account</Text>
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
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.danger_red + '40',
    backgroundColor: colors.danger_red + '10',
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    color: colors.danger_red,
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.danger_red + '40',
    backgroundColor: 'transparent',
  },
  deleteText: {
    fontFamily: 'Poppins-Medium',
    color: colors.danger_red,
    fontSize: 16,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.accent_green_bright + '40',
    backgroundColor: colors.accent_green_bright + '10',
  },
  changePasswordText: {
    fontFamily: 'Poppins-Medium',
    color: colors.accent_green_bright,
    fontSize: 16,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.accent_green_bright + '40',
    backgroundColor: colors.accent_green_bright + '10',
  },
  settingsButtonText: {
    fontFamily: 'Poppins-Medium',
    color: colors.accent_green_bright,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.bg_secondary,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border_secondary,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.text_primary,
    fontSize: 18,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.bg_card,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.text_primary,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border_secondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border_secondary,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'Poppins-Medium',
    color: colors.text_muted,
    fontSize: 15,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.accent_green_bright,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.bg_primary,
    fontSize: 15,
  },
});
