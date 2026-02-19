/**
 * Test Whisper transcribe endpoint with proper authorization
 */

require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function testAuth() {
  console.log('🔐 Testing Authorization Headers...\n');

  // Test 1: Without auth header
  console.log('Test 1: Calling transcribe WITHOUT auth header...');
  try {
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });
    
    console.log(`   Status: ${response1.status}`);
    if (!response1.ok) {
      const error = await response1.text();
      console.log(`   ❌ Error: ${error}`);
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  // Test 2: With auth header
  console.log('\nTest 2: Calling transcribe WITH auth header...');
  try {
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });
    
    console.log(`   Status: ${response2.status}`);
    if (!response2.ok) {
      const error = await response2.text();
      console.log(`   Response: ${error}`);
    } else {
      console.log('   ✅ Authorization accepted!');
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  // Test 3: Check classify-intent
  console.log('\nTest 3: Calling classify-intent WITH auth header...');
  try {
    const response3 = await fetch(`${SUPABASE_URL}/functions/v1/classify-intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'What is WeVysya?',
        context: 'WeVysya is a business network.',
      }),
    });
    
    console.log(`   Status: ${response3.status}`);
    if (response3.ok) {
      const data = await response3.json();
      console.log(`   ✅ Working! Response type: ${data.type}`);
    } else {
      const error = await response3.text();
      console.log(`   ❌ Error: ${error}`);
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Authorization tests complete!');
  console.log('\n💡 Note: The actual transcribe call needs FormData with audio file,');
  console.log('   but these tests verify the authorization header is working.');
}

testAuth();
