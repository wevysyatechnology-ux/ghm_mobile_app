const https = require('https');

const serviceKey = process.env.SERVICE_KEY;
const supabaseUrl = 'vlwppdpodavowfnyhtkh.supabase.co';

const policies = [
  {
    name: 'Users can upload their own profile photo',
    sql: `CREATE POLICY "Users can upload their own profile photo" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);`,
  },
  {
    name: 'Users can update their own profile photo',
    sql: `CREATE POLICY "Users can update their own profile photo" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);`,
  },
  {
    name: 'Users can delete their own profile photo',
    sql: `CREATE POLICY "Users can delete their own profile photo" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);`,
  },
  {
    name: 'Profile photos are publicly viewable',
    sql: `CREATE POLICY "Profile photos are publicly viewable" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile-photos');`,
  },
];

function rpcExecSql(sql) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ sql });
    const opts = {
      hostname: supabaseUrl,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

async function main() {
  for (const policy of policies) {
    process.stdout.write(`Creating policy: "${policy.name}"... `);
    const result = await rpcExecSql(policy.sql);
    if (result.status === 200 || result.status === 204) {
      console.log('✅ Created');
    } else if (result.body.includes('already exists')) {
      console.log('⏭️  Already exists');
    } else {
      console.log(`❌ Status ${result.status}: ${result.body}`);
    }
  }
  console.log('\nDone!');
}

main();

