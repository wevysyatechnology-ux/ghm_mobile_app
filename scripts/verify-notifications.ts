/**
 * 🔔 Notification System Verification Script
 * Checks if push notifications are properly configured and working
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;

// Only create Supabase client if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

interface VerificationResult {
  category: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const results: VerificationResult[] = [];

function addResult(category: string, check: string, status: 'PASS' | 'FAIL' | 'WARN', message: string) {
  results.push({ category, check, status, message });
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('🔔 PUSH NOTIFICATION SYSTEM VERIFICATION');
  console.log('='.repeat(80) + '\n');

  const categories = [...new Set(results.map(r => r.category))];
  
  categories.forEach(category => {
    console.log(`\n📦 ${category}`);
    console.log('-'.repeat(80));
    
    const categoryResults = results.filter(r => r.category === category);
    categoryResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.check}`);
      console.log(`   ${result.message}`);
    });
  });

  console.log('\n' + '='.repeat(80));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings\n`);
  
  if (failed === 0 && warnings === 0) {
    console.log('✅ All checks passed! Push notifications are ready to use.\n');
  } else if (failed > 0) {
    console.log('❌ Some critical checks failed. Please fix the issues above.\n');
  } else {
    console.log('⚠️ Some warnings detected. Review the issues above.\n');
  }
}

async function checkDependencies() {
  console.log('Checking dependencies...');
  
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    const requiredDeps = {
      'expo-notifications': '~0.32.16',
      'expo-device': '~8.0.10',
      'date-fns': '^4.1.0'
    };
    
    Object.entries(requiredDeps).forEach(([dep, version]) => {
      if (packageJson.dependencies[dep]) {
        addResult('Dependencies', dep, 'PASS', `Installed: ${packageJson.dependencies[dep]}`);
      } else {
        addResult('Dependencies', dep, 'FAIL', `Not installed. Expected: ${version}`);
      }
    });
  } catch (error) {
    addResult('Dependencies', 'package.json', 'FAIL', `Error reading package.json: ${error}`);
  }
}

async function checkAppConfig() {
  console.log('Checking app.json configuration...');
  
  try {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
    
    // Check notification config
    if (appJson.expo?.notification) {
      addResult('Configuration', 'Notification config', 'PASS', 'notification section exists in app.json');
    } else {
      addResult('Configuration', 'Notification config', 'FAIL', 'notification section missing in app.json');
    }
    
    // Check Android permissions
    if (appJson.expo?.android?.permissions?.includes('NOTIFICATIONS')) {
      addResult('Configuration', 'Android permissions', 'PASS', 'NOTIFICATIONS permission configured');
    } else {
      addResult('Configuration', 'Android permissions', 'WARN', 'NOTIFICATIONS permission not explicitly set');
    }
    
    // Check iOS background modes
    if (appJson.expo?.ios?.infoPlist?.UIBackgroundModes?.includes('remote-notification')) {
      addResult('Configuration', 'iOS background modes', 'PASS', 'remote-notification configured');
    } else {
      addResult('Configuration', 'iOS background modes', 'WARN', 'remote-notification not configured');
    }
    
    // Check project ID
    if (appJson.expo?.extra?.eas?.projectId) {
      addResult('Configuration', 'Expo project ID', 'PASS', `Project ID: ${appJson.expo.extra.eas.projectId}`);
    } else {
      addResult('Configuration', 'Expo project ID', 'WARN', 'Project ID not set. Will use default.');
    }
  } catch (error) {
    addResult('Configuration', 'app.json', 'FAIL', `Error reading app.json: ${error}`);
  }
}

async function checkDatabaseTables() {
  console.log('Checking database tables...');
  
  if (!supabase) {
    addResult('Database', 'Connection', 'WARN', 'Supabase credentials not found. Skipping database checks.');
    return;
  }
  
  try {
    // Check notifications table
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
    
    if (notifError) {
      if (notifError.code === '42P01') {
        addResult('Database', 'notifications table', 'FAIL', 'Table does not exist. Run migration.');
      } else {
        addResult('Database', 'notifications table', 'FAIL', `Error: ${notifError.message}`);
      }
    } else {
      addResult('Database', 'notifications table', 'PASS', 'Table exists and accessible');
    }
    
    // Check push_tokens table
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('id')
      .limit(1);
    
    if (tokenError) {
      if (tokenError.code === '42P01') {
        addResult('Database', 'push_tokens table', 'FAIL', 'Table does not exist. Run migration.');
      } else {
        addResult('Database', 'push_tokens table', 'FAIL', `Error: ${tokenError.message}`);
      }
    } else {
      addResult('Database', 'push_tokens table', 'PASS', 'Table exists and accessible');
    }
    
    // Check notification_preferences table
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('id')
      .limit(1);
    
    if (prefsError) {
      if (prefsError.code === '42P01') {
        addResult('Database', 'notification_preferences table', 'FAIL', 'Table does not exist. Run migration.');
      } else {
        addResult('Database', 'notification_preferences table', 'FAIL', `Error: ${prefsError.message}`);
      }
    } else {
      addResult('Database', 'notification_preferences table', 'PASS', 'Table exists and accessible');
    }
    
    // Check helper function
    const { data: count, error: funcError } = await supabase
      .rpc('get_unread_notification_count', { p_user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (funcError) {
      if (funcError.code === '42883') {
        addResult('Database', 'Helper function', 'FAIL', 'get_unread_notification_count function does not exist');
      } else {
        addResult('Database', 'Helper function', 'FAIL', `Error: ${funcError.message}`);
      }
    } else {
      addResult('Database', 'Helper function', 'PASS', 'get_unread_notification_count function exists');
    }
  } catch (error) {
    addResult('Database', 'Connection', 'FAIL', `Database connection error: ${error}`);
  }
}

async function checkEdgeFunction() {
  console.log('Checking edge function...');
  
  try {
    const functionPath = path.join(process.cwd(), 'supabase', 'functions', 'send-notification', 'index.ts');
    
    if (fs.existsSync(functionPath)) {
      addResult('Edge Function', 'send-notification source', 'PASS', 'Edge function code exists');
      
      // Check if it's properly written
      const functionContent = fs.readFileSync(functionPath, 'utf-8');
      if (functionContent.includes('expo.host/--/api/v2/push/send')) {
        addResult('Edge Function', 'Expo Push API', 'PASS', 'Uses Expo Push API');
    if (!supabase) {
      addResult('Edge Function', 'Deployment', 'WARN', 'Cannot verify deployment (no Supabase credentials)');
      return;
    }
    
      }
    } else {
      addResult('Edge Function', 'send-notification source', 'FAIL', 'Edge function code not found');
    }
    
    // Try to call the function to see if it's deployed
    const testPayload = {
      userId: 'test-user-id',
      type: 'test',
      title: 'Test',
      body: 'Test notification'
    };
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: testPayload
    });
    
    if (error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        addResult('Edge Function', 'Deployment', 'WARN', 'Function not deployed. Run: supabase functions deploy send-notification');
      } else {
        addResult('Edge Function', 'Deployment', 'PASS', `Function is deployed (test result: ${error.message})`);
      }
    } else {
      addResult('Edge Function', 'Deployment', 'PASS', 'Function is deployed and responding');
    }
  } catch (error) {
    addResult('Edge Function', 'Check', 'WARN', `Could not verify edge function: ${error}`);
  }
}

async function checkServiceFiles() {
  console.log('Checking service files...');
  
  const files = [
    { path: 'services/notificationService.ts', name: 'Notification Service' },
    { path: 'hooks/useNotifications.ts', name: 'useNotifications Hook' },
    { path: 'components/shared/NotificationBell.tsx', name: 'NotificationBell Component' },
    { path: 'types/notifications.ts', name: 'Type Definitions' }
  ];
  
  files.forEach(file => {
    const fullPath = path.join(process.cwd(), file.path);
    if (fs.existsSync(fullPath)) {
      addResult('Code Files', file.name, 'PASS', `${file.path} exists`);
    } else {
      addResult('Code Files', file.name, 'FAIL', `${file.path} not found`);
    }
  });
}

async function checkMigration() {
  console.log('Checking migration file...');
  
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260216000000_create_notifications_system.sql');
  
  if (fs.existsSync(migrationPath)) {
    addResult('Migration', 'SQL file', 'PASS', 'Migration file exists');
    
    const migrationContent = fs.readFileSync(migrationPath, 'utf-8');
    
    if (migrationContent.includes('CREATE TABLE IF NOT EXISTS notifications')) {
      addResult('Migration', 'Notifications table', 'PASS', 'Creates notifications table');
    }
    
    if (migrationContent.includes('CREATE TABLE IF NOT EXISTS push_tokens')) {
      addResult('Migration', 'Push tokens table', 'PASS', 'Creates push_tokens table');
    }
    
    if (migrationContent.includes('CREATE TABLE IF NOT EXISTS notification_preferences')) {
      addResult('Migration', 'Preferences table', 'PASS', 'Creates notification_preferences table');
    }
    
    if (migrationContent.includes('ENABLE ROW LEVEL SECURITY')) {
      addResult('Migration', 'RLS', 'PASS', 'Enables Row Level Security');
    }
  } else {
    addResult('Migration', 'SQL file', 'FAIL', 'Migration file not found');
  }
}

async function main() {
  try {
    console.log('Starting notification system verification...\n');
    
    await checkDependencies();
    await checkAppConfig();
    await checkServiceFiles();
    await checkMigration();
    await checkDatabaseTables();
    await checkEdgeFunction();
    
    printResults();
    
    // Provide recommendations
    const failed = results.filter(r => r.status === 'FAIL');
    if (failed.length > 0) {
      console.log('🔧 Recommended Actions:\n');
      
      if (failed.some(r => r.category === 'Database')) {
        console.log('1. Apply the database migration:');
        console.log('   supabase db reset');
        console.log('');
      }
      
      if (failed.some(r => r.category === 'Configuration')) {
        console.log('2. Update app.json with notification configuration');
        console.log('   See PUSH_NOTIFICATIONS_SETUP.md for details');
        console.log('');
      }
      
      if (failed.some(r => r.check.includes('send-notification'))) {
        console.log('3. Deploy the edge function:');
        console.log('   supabase functions deploy send-notification');
        console.log('');
      }
      
      if (failed.some(r => r.category === 'Dependencies')) {
        console.log('4. Install missing dependencies:');
        console.log('   npx expo install expo-notifications expo-device date-fns');
        console.log('');
      }
    }
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

main();
