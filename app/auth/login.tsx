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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
              Sign in with your email and password
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
                  <Text style={styles.errorText}>{error}</Text>
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

                <View style={styles.signupPrompt}>
                  <Text style={styles.signupText}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/auth/signup')}
                    disabled={isLoading}>
                    <Text style={styles.signupLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>
            </>
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
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: colors.text_primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.text_muted,
    textAlign: 'center',
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
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: colors.bg_primary,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  signupText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.text_muted,
  },
  signupLink: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.accent_green_bright,
  },
});
