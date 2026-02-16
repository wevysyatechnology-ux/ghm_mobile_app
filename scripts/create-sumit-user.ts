import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Creating user account for: sumitsingh180@gmail.com');
console.log('Supabase URL:', supabaseUrl);
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSumitUser() {
  const email = 'sumitsingh180@gmail.com';
  const password = 'SumitTest123!';

  // Check if user exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData?.user) {
    console.log('✅ User already exists and can login!');
    console.log('User ID:', signInData.user.id);
    console.log('Email:', signInData.user.email);
    console.log('');

    // Check profile
    const { data: profile } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', signInData.user.id)
      .maybeSingle();

    if (profile) {
      console.log('✅ Profile exists:');
      console.log('   Name:', profile.full_name || 'Not set');
      console.log('   Phone:', profile.phone_number || 'Not set');
    } else {
      console.log('ℹ️  Profile not found, creating...');
      const { error: profileError } = await supabase
        .from('users_profile')
        .insert({
          id: signInData.user.id,
          full_name: 'Sumit Singh',
          phone_number: '',
          vertical_type: 'open_circle',
        });

      if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
      } else {
        console.log('✅ Profile created successfully!');
      }
    }

    await supabase.auth.signOut();
    console.log('');
    console.log('Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    return;
  }

  if (signInError?.message.includes('Invalid login credentials')) {
    console.log('User does not exist. Creating new account...');
    console.log('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Sumit Singh',
        },
      },
    });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (data.user) {
      console.log('✅ User created successfully!');
      console.log('User ID:', data.user.id);
      console.log('');

      // Create profile
      const { error: profileError } = await supabase
        .from('users_profile')
        .insert({
          id: data.user.id,
          full_name: 'Sumit Singh',
          phone_number: '',
          vertical_type: 'open_circle',
        });

      if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
      } else {
        console.log('✅ Profile created successfully!');
      }

      console.log('');
      console.log('Login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', password);
    }
  } else {
    console.error('❌ Unexpected error:', signInError?.message);
  }
}

createSumitUser();
