import { supabase } from '../lib/supabase';

async function debugHouseMembers() {
  console.log('Testing getting house members...');
  
  // Get users
  const { data: users, error: usersError } = await supabase.from('profiles').select('id, full_name, house_id, approval_status').limit(10);
  console.log('Sample profiles:', users);

  if (!users || users.length === 0) return;

  const sampleHouseId = users.find(u => u.house_id)?.house_id;
  console.log('\nTesting with house ID:', sampleHouseId);

  if (sampleHouseId) {
    const { data: houseMembers, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          zone,
          approval_status,
          house_id
        `)
        .eq('house_id', sampleHouseId);
    console.log('All members for house:', houseMembers);

    const approvedMembers = houseMembers?.filter(m => m.approval_status === 'approved');
    console.log('Approved members:', approvedMembers);
  }
}

debugHouseMembers().catch(console.error);
