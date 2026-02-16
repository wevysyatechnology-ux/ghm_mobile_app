import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { UserCircle } from 'lucide-react-native';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { userId, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [verticalType, setVerticalType] = useState<'inner_circle' | 'open_circle' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCountry(profile.country || '');
      setState(profile.state || '');
      setCity(profile.city || '');
      setBusinessCategory(profile.business_category || '');
      setVerticalType(profile.vertical_type || 'open_circle');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!verticalType) {
      setError('Please select a membership type');
      return;
    }

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    console.log('Saving profile for user:', userId);
    console.log('Profile data:', {
      full_name: fullName,
      country,
      state,
      city,
      business_category: businessCategory,
      vertical_type: verticalType,
    });

    const result = await authService.updateProfile(userId, {
      full_name: fullName,
      country,
      state,
      city,
      business_category: businessCategory,
      vertical_type: verticalType,
    });

    console.log('Update result:', result);

    setIsLoading(false);

    if (result.success) {
      console.log('Profile saved successfully, refreshing...');
      await refreshProfile();
      console.log('Profile refreshed, navigating to tabs');
      router.replace('/(tabs)');
    } else {
      console.error('Profile save failed:', result.error);
      setError(result.error || 'Failed to save profile');
    }
  };

  return (
    <LinearGradient colors={[colors.bg_primary, colors.bg_secondary]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <UserCircle size={48} color={colors.accent_green_bright} strokeWidth={1.5} />
              </View>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>Tell us more about yourself</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.text_muted}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Business Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Technology, Finance, Healthcare"
                  placeholderTextColor={colors.text_muted}
                  value={businessCategory}
                  onChangeText={setBusinessCategory}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., United States"
                  placeholderTextColor={colors.text_muted}
                  value={country}
                  onChangeText={setCountry}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., California"
                  placeholderTextColor={colors.text_muted}
                  value={state}
                  onChangeText={setState}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., San Francisco"
                  placeholderTextColor={colors.text_muted}
                  value={city}
                  onChangeText={setCity}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Membership Type *</Text>
                <View style={styles.membershipOptions}>
                  <TouchableOpacity
                    style={[
                      styles.membershipButton,
                      verticalType === 'inner_circle' && styles.membershipButtonActive,
                    ]}
                    onPress={() => setVerticalType('inner_circle')}
                    disabled={isLoading}>
                    <Text
                      style={[
                        styles.membershipButtonText,
                        verticalType === 'inner_circle' && styles.membershipButtonTextActive,
                      ]}>
                      Inner Circle
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.membershipButton,
                      verticalType === 'open_circle' && styles.membershipButtonActive,
                    ]}
                    onPress={() => setVerticalType('open_circle')}
                    disabled={isLoading}>
                    <Text
                      style={[
                        styles.membershipButtonText,
                        verticalType === 'open_circle' && styles.membershipButtonTextActive,
                      ]}>
                      Open Circle
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSaveProfile}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={colors.bg_primary} />
                ) : (
                  <Text style={styles.buttonText}>Complete Setup</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text_primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text_muted,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text_primary,
  },
  membershipOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  membershipButton: {
    flex: 1,
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  membershipButtonActive: {
    backgroundColor: colors.accent_green_bright,
    borderColor: colors.accent_green_bright,
  },
  membershipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_muted,
  },
  membershipButtonTextActive: {
    color: colors.bg_primary,
  },
  button: {
    backgroundColor: colors.accent_green_bright,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.bg_primary,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});
