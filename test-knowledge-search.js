/**
 * Test knowledge search function
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testKeywordSearch(query) {
  console.log(`\n🔎 Testing keyword search for: "${query}"`);
  
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('content, metadata')
    .or(`content.ilike.${searchTerm},metadata->>title.ilike.${searchTerm}`)
    .limit(3);

  if (error) {
    console.log('   ❌ Error:', error.message);
    
    // Try getting all docs as fallback
    console.log('   📚 Getting all documents as fallback...');
    const { data: allDocs, error: allError } = await supabase
      .from('knowledge_base')
      .select('content, metadata')
      .limit(3);
    
    if (allError) {
      console.log('   ❌ Fallback failed:', allError.message);
    } else {
      console.log(`   ✅ Retrieved ${allDocs.length} documents`);
      allDocs.forEach(doc => {
        console.log(`      - ${doc.metadata.title}`);
      });
    }
  } else {
    console.log(`   ✅ Found ${data.length} matches`);
    data.forEach(doc => {
      console.log(`      - ${doc.metadata.title}`);
    });
  }
}

async function runTests() {
  console.log('🧪 Testing Knowledge Search...\n');
  
  await testKeywordSearch('WeVysya');
  await testKeywordSearch('deals');
  await testKeywordSearch('membership');
  await testKeywordSearch('random query that wont match');
  
  console.log('\n✅ Tests complete!');
}

runTests();
