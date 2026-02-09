import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/services/authService';
import { colors } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('email');
  const [phoneNumber, setPhoneNumber] = useState('9902093811');
  const [email, setEmail] = useState('test9902093811@wevysya.com');
  const [password, setPassword] = useState('TestUser123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const titleSlide = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  const subtitleSlide = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const formSlide = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(subtitleSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await authService.signInWithEmail(email.trim(), password);

    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      let errorMsg = result.error || 'Failed to sign in';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Account does not exist. Please contact admin to create your account.';
      }
      setError(errorMsg);
    }
  };

  const handleSendOTP = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again`);
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    setIsLoading(true);
    setError('');

    const result = await authService.signInWithPhone(formattedPhone);

    setIsLoading(false);

    if (result.success) {
      setCooldown(60);
      router.push({
        pathname: '/auth/verify',
        params: { phoneNumber: formattedPhone },
      });
    } else {
      const errorMessage = result.error || 'Failed to send OTP';
      if (errorMessage.includes('rate limit') || errorMessage.includes('Email rate limit exceeded')) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
        setCooldown(120);
      } else {
        setError(errorMessage);
      }
    }
  };

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <LinearGradient colors={[colors.bg_primary, colors.bg_secondary]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: logoOpacity,
                  transform: [
                    { scale: logoScale },
                    { rotate: logoRotateInterpolate },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: glowScale }],
                  },
                ]}
              />
              <LinearGradient
                colors={['rgba(15, 50, 35, 0.8)', 'rgba(10, 35, 25, 0.6)']}
                style={styles.logoBackground}
              >
                <Image
                  source={require('@/assets/images/wevysya_logo_r.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </LinearGradient>
            </Animated.View>

            <Animated.Text
              style={[
                styles.title,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: titleSlide }],
                },
              ]}
            >
              Welcome to WeVysya
            </Animated.Text>

            <Animated.Text
              style={[
                styles.subtitle,
                {
                  opacity: subtitleOpacity,
                  transform: [{ translateY: subtitleSlide }],
                },
              ]}
            >
              {loginMode === 'phone'
                ? 'Enter your phone number to continue'
                : 'Sign in with your email and password'}
            </Animated.Text>
          </View>

          <Animated.View
            style={[
              styles.form,
              {
                opacity: formOpacity,
                transform: [{ translateY: formSlide }],
              },
            ]}
          >
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, loginMode === 'phone' && styles.toggleButtonActive]}
                onPress={() => setLoginMode('phone')}
                disabled={isLoading}>
                <Text
                  style={[styles.toggleText, loginMode === 'phone' && styles.toggleTextActive]}>
                  Phone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, loginMode === 'email' && styles.toggleButtonActive]}
                onPress={() => setLoginMode('email')}
                disabled={isLoading}>
                <Text
                  style={[styles.toggleText, loginMode === 'email' && styles.toggleTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
            </View>

            {loginMode === 'phone' ? (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="+1234567890"
                    placeholderTextColor={colors.text_muted}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    editable={!isLoading}
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, (isLoading || cooldown > 0) && styles.buttonDisabled]}
                  onPress={handleSendOTP}
                  disabled={isLoading || cooldown > 0}>
                  {isLoading ? (
                    <ActivityIndicator color={colors.bg_primary} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {cooldown > 0 ? `Wait ${cooldown}s` : 'Send OTP'}
                    </Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.infoText}>
                  We'll send you a one-time password to verify your phone number
                </Text>

                <View style={styles.devHint}>
                  <Text style={styles.devHintText}>Development Mode: Use OTP 1234</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.text_muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.text_muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    editable={!isLoading}
                  />
                </View>

                {error ? (
                  <View>
                    <Text style={styles.errorText}>{error}</Text>
                    {error.includes('does not exist') && (
                      <TouchableOpacity
                        onPress={() => {
                          setLoginMode('phone');
                          setError('');
                        }}
                        style={styles.switchButton}>
                        <Text style={styles.switchButtonText}>
                          Try Phone Login Instead
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleEmailLogin}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color={colors.bg_primary} />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.devHint}>
                  <Text style={styles.devHintText}>Test User Credentials</Text>
                  <Text style={[styles.devHintText, { fontSize: 12, marginTop: 4, opacity: 0.8 }]}>
                    Pre-filled above
                  </Text>
                </View>
              </>
            )}
          </Animated.View>
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
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: colors.accent_green_bright,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: 75,
    height: 75,
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.accent_green_bright,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_muted,
  },
  toggleTextActive: {
    color: colors.bg_primary,
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
    fontSize: 18,
    color: colors.text_primary,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  switchButton: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  switchButtonText: {
    color: colors.accent_green_bright,
    fontSize: 13,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: colors.text_muted,
    textAlign: 'center',
    lineHeight: 20,
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
