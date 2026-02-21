import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

const SessionStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage.getItem(key);
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('⚠️ SecureStore getItem failed:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('⚠️ SecureStore setItem failed:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('⚠️ SecureStore removeItem failed:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SessionStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
