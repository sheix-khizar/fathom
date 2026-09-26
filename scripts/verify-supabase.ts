import { createClient } from '@supabase/supabase-js';

// Load .env.local natively in Node 22
try {
  process.loadEnvFile('.env.local');
} catch (e) {
  console.error('Could not load .env.local:', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Supabase Phase 1 Verification ===');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'MISSING');
console.log('ANON_KEY:', anonKey ? 'Set' : 'MISSING');
console.log('SERVICE_ROLE_KEY:', serviceRoleKey ? 'Set' : 'MISSING');

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('Missing required environment variables in .env.local');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey);
const anonClient = createClient(supabaseUrl, anonKey);

async function verify() {
  console.log('\n[1/5] Checking Tables & Service-Role Permissions...');

  // Check meetings
  const { data: meetings, error: mError } = await adminClient.from('meetings').select('id').limit(1);
  if (mError) {
    console.error('FAILED on meetings table:', mError.message);
    console.error('Detail:', mError);
    process.exit(1);
  }
  console.log('  -> "meetings" table accessible.');

  // Check transcript_lines
  const { error: tError } = await adminClient.from('transcript_lines').select('id').limit(1);
  if (tError) {
    console.error('FAILED on transcript_lines table:', tError.message);
    process.exit(1);
  }
  console.log('  -> "transcript_lines" table accessible.');

  // Check action_items
  const { error: aError } = await adminClient.from('action_items').select('id').limit(1);
  if (aError) {
    console.error('FAILED on action_items table:', aError.message);
    process.exit(1);
  }
  console.log('  -> "action_items" table accessible.');

  // Check share_clips
  const { error: sError } = await adminClient.from('share_clips').select('id').limit(1);
  if (sError) {
    console.error('FAILED on share_clips table:', sError.message);
    process.exit(1);
  }
  console.log('  -> "share_clips" table accessible.');

  console.log('\n[2/5] Testing Service-Role Write & Privacy (Unshared State)...');
  const testMeeting = {
    title: '__RLS_VERIFICATION_TEST__',
    duration: '20m',
    status: 'past' as const,
    participants: ['Alice', 'Bob'],
    summary: 'Testing RLS isolation',
    decisions: ['Keep data private until shared']
  };

  const { data: inserted, error: insertError } = await adminClient
    .from('meetings')
    .insert(testMeeting)
    .select()
    .single();

  if (insertError) {
    console.error('Failed to insert test meeting:', insertError.message);
    process.exit(1);
  }
  console.log('  -> Inserted private test meeting ID:', inserted.id);

  // Also insert a private action item
  const { data: insertedAction, error: actionInsertError } = await adminClient
    .from('action_items')
    .insert({
      meeting_id: inserted.id,
      text: 'Internal confidential task',
      owner: 'Alice',
      completed: false
    })
    .select()
    .single();

  if (actionInsertError) {
    console.error('Failed to insert action item:', actionInsertError.message);
    process.exit(1);
  }
  console.log('  -> Inserted private action item ID:', insertedAction.id);

  // Verify that Anon Client CANNOT read this meeting yet (since no share_clip exists)
  console.log('\n[3/5] Verifying RLS Privacy Enforcement on Anon Client...');
  const { data: anonUnsharedRead } = await anonClient
    .from('meetings')
    .select('id, title')
    .eq('id', inserted.id)
    .maybeSingle();

  if (anonUnsharedRead) {
    console.error('SECURITY FAILURE: Anon client was able to read unshared meeting!', anonUnsharedRead);
    process.exit(1);
  }
  console.log('  -> Verified: Unshared meeting is completely HIDDEN from public anon client.');

  // Verify that Anon Client CANNOT read action items
  const { data: anonActionRead } = await anonClient
    .from('action_items')
    .select('id, text')
    .eq('id', insertedAction.id)
    .maybeSingle();

  if (anonActionRead) {
    console.error('SECURITY FAILURE: Anon client was able to read action item!', anonActionRead);
    process.exit(1);
  }
  console.log('  -> Verified: Action items are completely HIDDEN from public anon client.');

  console.log('\n[4/5] Testing Shared Content Access (Intentionally Shared State)...');
  // Create a share clip for this meeting
  const testToken = 'verify-token-' + Date.now();
  const { data: shareClip, error: shareError } = await adminClient
    .from('share_clips')
    .insert({
      meeting_id: inserted.id,
      token: testToken,
      title: 'Shared Discussion Window'
    })
    .select()
    .single();

  if (shareError) {
    console.error('Failed to create share clip:', shareError.message);
    process.exit(1);
  }
  console.log('  -> Created share clip with token:', testToken);

  // Now verify that Anon Client CAN read the shared meeting
  const { data: anonSharedMeeting, error: sharedMeetingError } = await anonClient
    .from('meetings')
    .select('id, title')
    .eq('id', inserted.id)
    .single();

  if (sharedMeetingError || !anonSharedMeeting) {
    console.error('Failed to read shared meeting via anon client:', sharedMeetingError?.message);
    process.exit(1);
  }
  console.log('  -> Verified: Shared meeting is now READABLE by public anon client:', anonSharedMeeting.title);

  // Verify action items still remain hidden even when meeting is shared
  const { data: anonActionStillHidden } = await anonClient
    .from('action_items')
    .select('id')
    .eq('id', insertedAction.id)
    .maybeSingle();

  if (anonActionStillHidden) {
    console.error('SECURITY FAILURE: Action items leaked to public anon client after sharing!');
    process.exit(1);
  }
  console.log('  -> Verified: Action items remain strictly PRIVATE even for shared meetings.');

  console.log('\n[5/5] Cleaning Up Test Records...');
  const { error: deleteError } = await adminClient
    .from('meetings')
    .delete()
    .eq('id', inserted.id);

  if (deleteError) {
    console.error('Cleanup failed:', deleteError.message);
  } else {
    console.log('  -> Cleaned up test meeting (and cascaded share clips/action items).');
  }

  console.log('\n=== ALL PHASE 1 REQUIREMENTS & RLS POLICIES FULLY VERIFIED ===');
}

verify().catch(err => {
  console.error('Unexpected error during verification:', err);
  process.exit(1);
});
