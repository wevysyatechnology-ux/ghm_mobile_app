/**
 * Quick check for notification system database tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking notification system tables...\n');

  const tables = ['notifications', 'push_tokens', 'notification_preferences'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table}: Table does not exist`);
        } else if (error.code === 'PGRST301') {
          console.log(`⚠️  ${table}: No access (check RLS policies)`);
        } else {
          console.log(`❌ ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err}`);
    }
  }
  
  console.log('\n✅ Check complete!');
}

checkTables();
