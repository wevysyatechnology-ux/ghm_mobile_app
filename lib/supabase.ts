import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🔴 Supabase Configuration Error:');
  console.error(`📍 URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
  console.error(`🔑 Key: ${supabaseAnonKey ? '✅ Found' : '❌ Missing'}`);
  console.error('💡 Check EAS build configuration or .env file');

  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    `URL: ${supabaseUrl ? 'Found' : 'Missing'}\n` +
    `Key: ${supabaseAnonKey ? 'Found' : 'Missing'}`
  );
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? localStorage : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
