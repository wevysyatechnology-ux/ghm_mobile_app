// Test script to verify Supabase transcribe function setup
const SUPABASE_URL = 'https://vlwppdpodavowfnyhtkh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd3BwZHBvZGF2b3dmbnlodGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4NTcsImV4cCI6MjA4NTY5Nzg1N30.OaEap83s2sxAbuTnyhNVKZnZJwvifLyy9kIBm7rikrA';

async function testTranscribeFunction() {
  console.log('🧪 Testing Supabase Transcribe Function...\n');
  
  const endpoint = `${SUPABASE_URL}/functions/v1/transcribe`;
  console.log('📡 Endpoint:', endpoint);
  
  try {
    // Test if the function exists (try a simple OPTIONS request)
    const response = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 204 || response.status === 200) {
      console.log('\n✅ SUCCESS! Transcribe function is deployed and responding.');
      console.log('\n📝 Next Steps:');
      console.log('1. Add OPENAI_API_KEY secret in Supabase Dashboard');
      console.log('   Go to: Settings → Edge Functions → Secrets');
      console.log('   Name: OPENAI_API_KEY');
      console.log('   Value: sk-proj-nTCZ... (your key from .env)');
      console.log('\n2. Test voice recording in your app');
      console.log('   Open app → Voice Assistant → Tap microphone → Speak');
      
    } else if (response.status === 404) {
      console.log('\n⚠️  Function not found. You need to deploy it.');
      console.log('\nTo deploy:');
      console.log('1. Get access token from Supabase Dashboard:');
      console.log('   Settings → API → Generate new token');
      console.log('2. Set environment variable:');
      console.log('   Windows: set SUPABASE_ACCESS_TOKEN=your-token');
      console.log('3. Deploy function:');
      console.log('   npx supabase functions deploy transcribe --project-ref vlwppdpodavowfnyhtkh');
      
    } else {
      console.log(`\n⚠️  Unexpected response: ${response.status}`);
      const text = await response.text();
      console.log('Response:', text);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n🔍 Possible issues:');
    console.log('- Network connection');
    console.log('- Supabase project not accessible');
    console.log('- Function not deployed yet');
  }
}

testTranscribeFunction();
