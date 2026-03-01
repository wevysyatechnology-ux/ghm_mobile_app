import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

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

const LocalStorageAdapter = {
  getItem: (key: string) => {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: LocalStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
