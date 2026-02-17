import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAnilProfile() {
  console.log('\n🔍 Checking Anil Guptha\'s profile...\n');

  // Check profile by email
  const { data: profileByEmail, error: emailError } = await supabase
    .from('users_profile')
    .select('*')
    .eq('phone_number', '9902093811')
    .maybeSingle();

  console.log('Profile by phone (9902093811):', profileByEmail);
  console.log('Error:', emailError);

  // Check all profiles to see what's available
  const { data: allProfiles, error: allError } = await supabase
    .from('users_profile')
    .select('id, full_name, phone_number, business_category, city, email')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n📋 All recent profiles:');
  console.table(allProfiles);

  // Check house memberships for Athreya
  const { data: athreya } = await supabase
    .from('core_houses')
    .select('id, house_name')
    .eq('house_name', 'Athreya')
    .maybeSingle();

  if (athreya) {
    console.log('\n🏠 Athreya House:', athreya);

    const { data: members } = await supabase
      .from('core_house_members')
      .select(`
        user_id,
        role,
        users_profile (
          full_name,
          phone_number,
          business_category
        )
      `)
      .eq('house_id', athreya.id);

    console.log('\n👥 Athreya House Members:');
    console.table(members);
  }

  // Check auth users
  if (profileByEmail) {
    console.log('\n🔐 Checking auth user with ID:', profileByEmail.id);
    // Get auth user details would require admin access
  }
}

checkAnilProfile().catch(console.error);
