import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlwppdpodavowfnyhtkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_76ruTNgQBo-ZhH6gyc9eAQ_E1g0aeUA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseSchema() {
    console.log('Testing schema...');

    // Test profiles table
    const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) console.log('Error profiles:', pError.message);
    else console.log('Profiles columns:', pData?.length ? Object.keys(pData[0]) : 'Empty table');

    // Test users_profile table
    const { data: uData, error: uError } = await supabase.from('users_profile').select('*').limit(1);
    if (uError) console.log('Error users_profile:', uError.message);
    else console.log('Users_profile columns:', uData?.length ? Object.keys(uData[0]) : 'Empty table');

    // Test houses table
    const { data: hData, error: hError } = await supabase.from('houses').select('*').limit(1);
    if (hError) console.log('Error houses:', hError.message);
    else console.log('Houses columns:', hData?.length ? Object.keys(hData[0]) : 'Empty table');
}

testDatabaseSchema();
