import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck } from 'lucide-react-native';
import { authService } from '@/services/authService';
import { colors } from '@/constants/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await authService.verifyOtp(phoneNumber, otp);

    setIsLoading(false);

    if (result.success) {
      router.replace('/auth/profile-setup');
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  return (
    <LinearGradient colors={[colors.bg_primary, colors.bg_secondary]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={48} color={colors.accent_green_bright} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              We sent a code to {'\n'}
              {phoneNumber}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={colors.text_muted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
                autoFocus
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.bg_primary} />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backText}>Change phone number</Text>
            </TouchableOpacity>

            <View style={styles.devHint}>
              <Text style={styles.devHintText}>Development Mode: Use OTP 1234</Text>
              <Text style={[styles.devHintText, { fontSize: 12, marginTop: 8, opacity: 0.8 }]}>
                For best results, use: 9902093811
              </Text>
              {error.includes('wait') && (
                <Text style={[styles.devHintText, { fontSize: 11, marginTop: 8, opacity: 0.7 }]}>
                  Rate limit hit. Switch to test number above to continue immediately.
                </Text>
              )}
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 32,
    color: colors.text_primary,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.accent_green_bright,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
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
  backText: {
    fontSize: 16,
    color: colors.accent_green_bright,
    textAlign: 'center',
  },
  devHint: {
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  devHintText: {
    fontSize: 13,
    color: colors.accent_green_bright,
    textAlign: 'center',
    fontWeight: '600',
  },
});
