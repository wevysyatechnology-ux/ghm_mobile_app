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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up WeVysya database...\n');

  const migrations = [
    {
      name: 'create_wevysya_tables',
      file: 'supabase/migrations/20251221095249_create_wevysya_tables.sql'
    },
    {
      name: 'create_channels_table',
      file: 'supabase/migrations/20251221095256_create_channels_table.sql'
    },
    {
      name: 'update_links_deals_i2we',
      file: 'supabase/migrations/20251221100731_update_links_deals_i2we_with_house_restrictions.sql'
    }
  ];

  for (const migration of migrations) {
    try {
      console.log(`📝 Running migration: ${migration.name}...`);
      const migrationPath = path.join(process.cwd(), migration.file);

      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file not found: ${migration.file}`);
        continue;
      }

      const sql = fs.readFileSync(migrationPath, 'utf-8');

      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        console.log(`   ℹ️  Note: Some statements may have already been applied`);
      } else {
        console.log(`   ✅ Completed`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${error instanceof Error ? error.message : 'Error occurred'}`);
    }
  }

  console.log('\n✨ Database setup process completed!\n');
  console.log('Verifying tables...\n');

  const tables = [
    'users_profile',
    'core_memberships',
    'virtual_memberships',
    'core_houses',
    'core_house_members',
    'core_links',
    'core_deals',
    'deal_participants',
    'core_i2we',
    'channels',
    'channel_posts'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - ${error.message}`);
      }
    } catch (error) {
      console.log(`❌ ${table} - Error checking`);
    }
  }

  console.log('\n🎉 Setup complete!');
}

setupDatabase().catch(console.error);
