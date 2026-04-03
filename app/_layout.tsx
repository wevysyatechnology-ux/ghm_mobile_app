import { useEffect } from 'react';
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
  useFrameworkReady();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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
          <Stack.Screen name="event-meetings" options={{ headerShown: false }} />
          <Stack.Screen name="event-detail" options={{ headerShown: false }} />
          <Stack.Screen name="attendance-scan" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <GlobalVoiceControl />
        <StatusBar style="light" />
      </AIProvider>
    </AuthProvider>
  );
}
