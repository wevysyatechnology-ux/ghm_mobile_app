import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEV_EMAIL = 'dev@wevysya.test';
const DEV_PASSWORD = 'DevTest123!@#';

async function createDevAccount() {
  console.log('Creating dev account for generic phone numbers...');
  console.log(`Email: ${DEV_EMAIL}`);

  // Check if user exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error checking existing users:', listError.message);
    process.exit(1);
  }

  const existingUser = existingUsers.users.find(u => u.email === DEV_EMAIL);

  if (existingUser) {
    console.log('✅ Dev account already exists!');
    console.log(`User ID: ${existingUser.id}`);

    // Confirm email if not confirmed
    if (!existingUser.email_confirmed_at) {
      console.log('📧 Confirming email address...');
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.error('❌ Error confirming email:', confirmError.message);
      } else {
        console.log('✅ Email confirmed!');
      }
    }

    return;
  }

  // Create the dev account using admin API
  console.log('Creating new dev account...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error('❌ Error creating dev account:', error.message);
    process.exit(1);
  }

  console.log('✅ Dev account created successfully!');
  console.log(`User ID: ${data.user.id}`);
  console.log('\nThis account will be used for all phone numbers in dev mode (except test number).');
}

createDevAccount();
