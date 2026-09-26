try {
  process.loadEnvFile('.env.local');
} catch (e) {
  console.error('Failed to load .env.local', e);
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('Checking Supabase Storage buckets...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }

  console.log('Current buckets:', buckets.map(b => `${b.name} (public: ${b.public})`));
  const recordingsBucket = buckets.find(b => b.name === 'recordings');

  if (!recordingsBucket) {
    console.log('Creating private "recordings" bucket (max 25MB)...');
    const { data, error: createError } = await supabase.storage.createBucket('recordings', {
      public: false,
      fileSizeLimit: 26214400, // 25MB
    });
    if (createError) {
      console.error('Error creating bucket:', createError);
      process.exit(1);
    }
    console.log('Successfully created "recordings" bucket:', data);
  } else {
    console.log('"recordings" bucket already exists. Public:', recordingsBucket.public);
  }
}

main().catch(err => {
  console.error('Failed to ensure storage:', err);
  process.exit(1);
});
