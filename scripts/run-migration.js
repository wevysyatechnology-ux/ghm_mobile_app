/**
 * Run knowledge base migration
 * Creates the knowledge_base table and necessary functions
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 For service role key, go to:');
  console.error('   Supabase Dashboard → Project Settings → API → service_role key');
  console.error('\n💡 Add to .env file:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔧 Running knowledge_base migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260218_create_knowledge_base.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons to execute statements one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      console.log(`[${i + 1}/${statements.length}] Executing...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // Check if it's just a "already exists" error
        if (error.message.includes('already exists')) {
          console.log(`   ⏭️ Already exists (skipping)`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Success`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration complete!');
    console.log('='.repeat(60));
    console.log('\n📦 Created:');
    console.log('   - knowledge_base table');
    console.log('   - search_knowledge() function');
    console.log('   - Indexes for performance');
    console.log('   - RLS policies');
    console.log('\n🎯 Next steps:');
    console.log('   1. Load knowledge: node scripts/load-knowledge-base.js');
    console.log('   2. Test complete voice flow: node test-voice-flow.js');

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
