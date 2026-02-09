import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlwppdpodavowfnyhtkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_76ruTNgQBo-ZhH6gyc9eAQ_E1g0aeUA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTestUser() {
  const email = 'test9902093811@wevysya.com';
  const password = 'TestUser123!';
  const phoneNumber = '+919902093811';

  console.log('Checking test user status...');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Phone:', phoneNumber);
  console.log('');

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData?.user) {
    console.log('✅ Test user exists and credentials work!');
    console.log('User ID:', signInData.user.id);
    console.log('');

    const { data: profile } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', signInData.user.id)
      .maybeSingle();

    if (profile) {
      console.log('✅ Profile exists:');
      console.log('   Name:', profile.full_name || 'Not set');
      console.log('   Phone:', profile.phone_number || 'Not set');
      console.log('   Vertical:', profile.vertical_type || 'Not set');
    } else {
      console.log('ℹ️  Profile does not exist yet (will be created on first login)');
    }

    await supabase.auth.signOut();
    console.log('');
    console.log('You can sign in using:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Phone (OTP with 1234):', phoneNumber.replace('+91', ''));
    return;
  }

  if (signInError?.message.includes('Invalid login credentials')) {
    console.log('⚠️  User does not exist. Attempting to create...');
    console.log('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phoneNumber,
        },
      },
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        console.log('⏳ Rate limit hit. Try again in a few minutes.');
        console.log('   The user may already exist. Try signing in with:');
        console.log('   Email:', email);
        console.log('   Password:', password);
      } else {
        console.error('❌ Error:', error.message);
      }
      return;
    }

    if (data.user) {
      console.log('✅ User created successfully!');
      console.log('User ID:', data.user.id);
      console.log('');
      console.log('Sign in using:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('   Phone (OTP with 1234):', phoneNumber.replace('+91', ''));
    }
  } else {
    console.error('❌ Unexpected error:', signInError?.message);
  }
}

checkTestUser();
