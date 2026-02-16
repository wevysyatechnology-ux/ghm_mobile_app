import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyLogin() {
  console.log('Testing login with existing credentials...');
  console.log('Supabase URL:', supabaseUrl);
  console.log('');

  const email = 'sumitsingh180@gmail.com';
  const password = 'SumitTest123!';

  console.log('Attempting login with:', email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log('❌ Login failed:', error.message);
    console.log('');
    console.log('The user exists in the database but the password might be different.');
    console.log('Please check the password or reset it in Supabase Dashboard.');
    return;
  }

  if (data?.user) {
    console.log('✅ Login successful!');
    console.log('');
    console.log('User Details:');
    console.log('  ID:', data.user.id);
    console.log('  Email:', data.user.email);
    console.log('  Email Confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('');

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.log('⚠️  Error fetching profile:', profileError.message);
    } else if (profile) {
      console.log('✅ Profile found:');
      console.log('  Name:', profile.full_name || 'Not set');
      console.log('  Phone:', profile.phone_number || 'Not set');
      console.log('  Type:', profile.vertical_type || 'Not set');
      console.log('  Status:', profile.attendance_status || 'Not set');
    } else {
      console.log('⚠️  No profile found in users_profile table');
    }

    await supabase.auth.signOut();
    console.log('');
    console.log('🎉 Everything works! You can login to the app now.');
  }
}

verifyLogin().catch(console.error);
