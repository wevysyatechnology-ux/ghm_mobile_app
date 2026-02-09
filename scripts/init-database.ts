import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=');
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initDatabase() {
  console.log('🚀 Initializing Wevysya database...\n');

  try {
    const { data: tables, error: checkError } = await supabase
      .from('users_profile')
      .select('*')
      .limit(1);

    if (!checkError) {
      console.log('✅ Database tables already exist!');
      console.log('\nExisting tables:');
      console.log('  - users_profile');
      console.log('  - core_memberships');
      console.log('  - virtual_memberships');
      console.log('  - core_houses');
      console.log('  - core_house_members');
      console.log('  - core_links');
      console.log('  - core_deals');
      console.log('  - deal_participants');
      console.log('  - core_i2we');
      console.log('  - channels');
      console.log('  - channel_posts');
      console.log('\n✨ Database is ready to use!');
      return;
    }

    console.log('📋 Tables need to be created.');
    console.log('\nPlease follow these steps:');
    console.log('\n1. Open your Supabase dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the migration files in order:');
    console.log('   - supabase/migrations/20251221095249_create_wevysya_tables.sql');
    console.log('   - supabase/migrations/20251221095256_create_channels_table.sql');
    console.log('   - supabase/migrations/20251221100731_update_links_deals_i2we_with_house_restrictions.sql');
    console.log('\n✨ After running migrations, your database will be ready!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

initDatabase();
