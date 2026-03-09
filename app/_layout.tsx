import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AIProvider } from '@/contexts/AIContext';
import { AuthProvider } from '@/contexts/AuthContext';
import GlobalVoiceControl from '@/components/ai/GlobalVoiceControl';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });
  const [showStartupLoader, setShowStartupLoader] = useState(true);
  const logoPulse = useRef(new Animated.Value(1)).current;

  useFrameworkReady();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned)
      SplashScreen.hideAsync();

      // Keep a short branded loading state after splash for smoother app startup.
      const timer = setTimeout(() => {
        setShowStartupLoader(false);
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!showStartupLoader) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.06,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [logoPulse, showStartupLoader]);

  useEffect(() => {
    console.log('📱 App _layout.tsx mounted');
    return () => {
      console.log('📱 App _layout.tsx unmounting');
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      console.log('✅ App initialized and ready with fonts');
    }
  }, [fontsLoaded]);

  // Prevent rendering until the font has loaded or an error was returned
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (showStartupLoader) {
    return (
      <View style={styles.loaderContainer}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoPulse }] }]}> 
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.loaderTitle}>WeVysya</Text>
        <ActivityIndicator size="small" color="#34D399" style={styles.loaderSpinner} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AIProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/verify" options={{ headerShown: false }} />
          <Stack.Screen name="auth/profile-setup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="call" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <GlobalVoiceControl />
        <StatusBar style="light" />
      </AIProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 138,
    height: 138,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 102,
    height: 102,
  },
  loaderTitle: {
    marginTop: 20,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loaderSpinner: {
    marginTop: 12,
  },
});
