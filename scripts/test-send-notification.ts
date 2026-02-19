/**
 * 🔔 Test Push Notification Sender
 * Tests the notification system by sending a test notification
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotification() {
  console.log('🔔 Testing Push Notification System\n');
  console.log('='.repeat(80));

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ Not authenticated. Please login first.');
    console.log('\nTo test notifications, you need to:');
    console.log('1. Have a logged-in user session');
    console.log('2. That user should have a push token registered');
    console.log('3. Run this on a physical device (not simulator)\n');
    process.exit(1);
  }

  console.log(`✅ Authenticated as: ${user.email || user.id}`);

  // Check if user has a push token
  const { data: tokens, error: tokenError } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', user.id);

  if (tokenError) {
    console.error('❌ Error checking push tokens:', tokenError.message);
    console.log('\n💡 Make sure the database migration has been applied.');
    process.exit(1);
  }

  if (!tokens || tokens.length === 0) {
    console.log('\n⚠️ No push tokens found for this user.');
    console.log('\nTo register a push token:');
    console.log('1. Open the app on a physical device');
    console.log('2. Grant notification permissions when prompted');
    console.log('3. The app will automatically register your device token\n');
    process.exit(1);
  }

  console.log(`✅ Found ${tokens.length} push token(s) registered`);
  tokens.forEach((token, i) => {
    console.log(`   ${i + 1}. ${token.device_type} - ${token.device_name || 'Unknown device'}`);
  });

  // Send test notification
  console.log('\n📤 Sending test notification...');

  const testPayload = {
    userId: user.id,
    type: 'test',
    title: '🎉 Test Notification',
    body: 'This is a test notification from WeVysya!',
    data: {
      screen: 'notifications',
      timestamp: new Date().toISOString()
    }
  };

  const { data, error } = await supabase.functions.invoke('send-notification', {
    body: testPayload
  });

  if (error) {
    console.error('\n❌ Error sending notification:', error.message);
    
    if (error.message.includes('not found') || error.message.includes('404')) {
      console.log('\n💡 The edge function is not deployed.');
      console.log('\nDeploy it with:');
      console.log('   npx supabase functions deploy send-notification');
      console.log('\nOr deploy via Supabase Dashboard:');
      console.log('   1. Go to your Supabase project');
      console.log('   2. Navigate to Edge Functions');
      console.log('   3. Deploy send-notification function');
    }
    
    process.exit(1);
  }

  console.log('\n✅ Notification sent successfully!');
  console.log('\n📱 Check your device for the notification.');
  
  if (data) {
    console.log('\n📊 Response:', JSON.stringify(data, null, 2));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test completed!\n');
}

// Run test
testNotification().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
