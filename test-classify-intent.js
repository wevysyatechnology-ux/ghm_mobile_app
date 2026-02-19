// Test if classify-intent function is deployed
const SUPABASE_URL = 'https://vlwppdpodavowfnyhtkh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd3BwZHBvZGF2b3dmbnlodGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4NTcsImV4cCI6MjA4NTY5Nzg1N30.OaEap83s2sxAbuTnyhNVKZnZJwvifLyy9kIBm7rikrA';

async function testClassifyIntent() {
  console.log('🧪 Testing classify-intent Function...\n');
  
  const endpoint = `${SUPABASE_URL}/functions/v1/classify-intent`;
  console.log('📡 Endpoint:', endpoint);
  
  try {
    // Test with a sample query
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Find a CA in Bangalore',
        context: ''
      })
    });
    
    console.log('📊 Response Status:', response.status);
    
    if (response.status === 404) {
      console.log('\n⚠️  classify-intent function NOT deployed');
      console.log('\n📋 To deploy:');
      console.log('1. Go to Supabase Dashboard → Edge Functions');
      console.log('2. Click "Deploy a new function" → "Via Editor"');
      console.log('3. Name: classify-intent');
      console.log('4. Copy code from: supabase/functions/classify-intent/index.ts');
      console.log('5. Deploy');
      return;
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ classify-intent function is WORKING!');
      console.log('\n📊 Sample Response:', JSON.stringify(data, null, 2));
      console.log('\n🎉 Your Voice OS is COMPLETE and READY!');
      console.log('\n📝 Next steps:');
      console.log('1. Load knowledge base (see VOICE_OS_COMPLETE_GUIDE.md)');
      console.log('2. Test in your app');
      console.log('3. Say: "Find a CA in Bangalore"');
    } else {
      const text = await response.text();
      console.log('\n⚠️  Function exists but returned error:', response.status);
      console.log('Response:', text);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testClassifyIntent();
