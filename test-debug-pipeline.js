/**
 * Debug test - Check complete Voice OS pipeline
 */

require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function testPipeline() {
  console.log('🔍 Testing Voice OS Pipeline...\n');

  const testQuery = "What is WeVysya?";

  // Step 1: Test classify-intent function
  console.log('📡 Step 1: Testing classify-intent function...');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/classify-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query: testQuery,
        context: "WeVysya is a business network for Vysya community.",
      }),
    });

    console.log(`   Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ classify-intent working!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('   ❌ classify-intent error:', error);
    }
  } catch (error) {
    console.log('   ❌ classify-intent failed:', error.message);
  }

  // Step 2: Check knowledge base
  console.log('\n📚 Step 2: Checking knowledge base...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, metadata')
      .limit(5);

    if (error) {
      console.log('   ❌ Knowledge base error:', error.message);
    } else if (!data || data.length === 0) {
      console.log('   ⚠️ Knowledge base is EMPTY!');
      console.log('   👉 Run: node scripts/load-knowledge-base.js');
    } else {
      console.log(`   ✅ Knowledge base has ${data.length} documents:`);
      data.forEach(doc => {
        console.log(`      - ${doc.metadata.title}`);
      });
    }
  } catch (error) {
    console.log('   ❌ Knowledge base check failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
}

testPipeline();
