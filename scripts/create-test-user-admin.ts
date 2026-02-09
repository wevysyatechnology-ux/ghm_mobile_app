import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlwppdpodavowfnyhtkh.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('\nPlease run:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key npx tsx scripts/create-test-user-admin.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  const email = 'test9902093811@wevysya.com';
  const password = 'TestUser123!';
  const phoneNumber = '+919902093811';

  console.log('Creating test user with admin privileges...');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Phone:', phoneNumber);
  console.log('');

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    phone: phoneNumber,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: {
      phone: phoneNumber,
    },
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      console.log('✅ User already exists!');
      console.log('');
      console.log('You can sign in using:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('   Phone (OTP with 1234):', phoneNumber);
    } else {
      console.error('❌ Error:', error.message);
    }
    return;
  }

  if (data?.user) {
    console.log('✅ User created successfully!');
    console.log('User ID:', data.user.id);
    console.log('');

    const { error: profileError } = await supabase
      .from('users_profile')
      .upsert({
        id: data.user.id,
        full_name: 'Test User',
        phone_number: phoneNumber,
        vertical_type: 'open_circle',
      });

    if (profileError) {
      console.log('Profile creation note:', profileError.message);
    } else {
      console.log('✅ Profile created successfully!');
    }

    console.log('');
    console.log('Sign in using:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Phone (OTP with 1234):', phoneNumber);
  }
}

createTestUser();
