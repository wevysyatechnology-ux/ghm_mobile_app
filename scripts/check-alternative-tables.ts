import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlwppdpodavowfnyhtkh.supabase.co';
const supabaseAnonKey = 'sb_publishable_76ruTNgQBo-ZhH6gyc9eAQ_E1g0aeUA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAlternativeTables() {
    const email = 'test9902093811@wevysya.com';
    const password = 'TestUser123!';

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (!signInData?.user) {
        console.log('Login failed', signInError?.message);
        return;
    }

    // Find their house_id first
    const { data: profile } = await supabase
        .from('profiles')
        .select('house_id')
        .eq('id', signInData.user.id)
        .single();

    const houseId = profile?.house_id;
    console.log('User house ID:', houseId);

    if (!houseId) {
        console.log('User has no house_id');
        return;
    }

    // Check core_house_members
    const { data: chm, error: chmErr } = await supabase
        .from('core_house_members')
        .select('*')
        .eq('house_id', houseId);
    console.log('core_house_members count:', chm?.length, 'error:', chmErr?.message);

    // Check members
    const { data: mem, error: memErr } = await supabase
        .from('members')
        .select('*')
        .eq('house_id', houseId);
    console.log('members count:', mem?.length, 'error:', memErr?.message);

    // Check users_profile
    const { data: up, error: upErr } = await supabase
        .from('users_profile')
        .select('*');
    console.log('users_profile access (without id filter):', up?.length, 'error:', upErr?.message);
}

checkAlternativeTables();
