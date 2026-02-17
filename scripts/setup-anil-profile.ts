import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAnilProfile() {
  try {
    console.log('\n🔍 Checking/Setting up Anil Guptha profile...\n');

    // Get the user ID for anil@srivasavigroup.in
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    const anilUser = users?.users?.find(u => 
      u.email === 'anil@srivasavigroup.in' || 
      u.user_metadata?.phone === '9902093811'
    );

    if (!anilUser) {
      console.log('❌ No user found for Anil. Checking all users:');
      console.log('Users:', users.users.map(u => ({ id: u.id, email: u.email, phone: u.user_metadata?.phone })));
      return;
    }

    console.log('✅ Found Anil user:', { id: anilUser.id, email: anilUser.email });

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', anilUser.id)
      .maybeSingle();

    if (existingProfile) {
      console.log('\n✅ Profile already exists:', existingProfile);
      return;
    }

    // Create the profile
    console.log('\n📝 Creating profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('users_profile')
      .insert({
        id: anilUser.id,
        full_name: 'Anil Guptha',
        phone_number: '9902093811',
        business_category: 'Business Owner',
        city: 'Your City',
        state: 'Your State',
        country: 'India',
        vertical_type: 'open_circle',
      })
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Error creating profile:', createError);
    } else {
      console.log('✅ Profile created successfully:', newProfile);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupAnilProfile();
