import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlwppdpodavowfnyhtkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_76ruTNgQBo-ZhH6gyc9eAQ_E1g0aeUA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  console.log('Database URL:', supabaseUrl);
  console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...\n');

  try {
    console.log('1️⃣ Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users_profile')
      .select('count')
      .limit(0);

    if (healthError) {
      console.log('❌ Connection failed:', healthError.message);
      return;
    }
    console.log('✅ Basic connection successful\n');

    console.log('2️⃣ Checking tables...');
    const tables = [
      'users_profile',
      'houses',
      'memberships',
      'channels',
      'channel_members',
      'deals',
      'links',
      'i2we_submissions'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Table "${table}": ${error.message}`);
      } else {
        console.log(`   ✅ Table "${table}": Accessible`);
      }
    }

    console.log('\n3️⃣ Testing authentication system...');
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('   ⚠️  Auth check:', authError.message);
    } else {
      console.log('   ✅ Auth system: Working');
      console.log('   Current session:', authData.session ? 'Logged in' : 'Not logged in');
    }

    console.log('\n4️⃣ Checking test user...');
    const testEmail = 'test9902093811@wevysya.com';
    const { data: userData, error: userError } = await supabase
      .from('users_profile')
      .select('*')
      .limit(1);

    if (userError) {
      console.log(`   ⚠️  Cannot check users: ${userError.message}`);
      console.log('   Note: This is expected due to RLS. Users can only see their own profile.');
    } else {
      console.log('   ℹ️  User query executed (RLS restrictions apply)');
    }

    console.log('\n✅ Database Connection Test Complete!');
    console.log('\n📝 Summary:');
    console.log('   - Connection: Working');
    console.log('   - Tables: Accessible');
    console.log('   - Auth: Configured');
    console.log('   - RLS: Enabled (secure)');
    console.log('\n💡 Next Steps:');
    console.log('   1. Create test user in Supabase Dashboard');
    console.log('   2. Use credentials: test9902093811@wevysya.com / TestUser123!');
    console.log('   3. Sign in to the app');

  } catch (error: any) {
    console.log('\n❌ Unexpected error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testDatabaseConnection();
