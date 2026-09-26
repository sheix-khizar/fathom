try {
  process.loadEnvFile('.env.local');
} catch (e) {
  console.error('Failed to load .env.local', e);
}

async function runTests() {
  const { GET: getMeetings } = await import('../app/api/meetings/route');
  const { GET: getMeetingById } = await import('../app/api/meetings/[id]/route');
  const { PATCH: patchActionItem } = await import('../app/api/meetings/[id]/action-items/[itemId]/route');
  const { GET: searchRoute } = await import('../app/api/search/route');
  const { POST: createShareClip } = await import('../app/api/share/route');
  const { GET: getSharedClip } = await import('../app/api/share/[token]/route');
  console.log('=== PHASE 3: LIVE API ROUTES VERIFICATION ===\n');

  // --------------------------------------------------------------------------
  // 1. Test GET /api/meetings
  // --------------------------------------------------------------------------
  console.log('[Test 1/6] Testing GET /api/meetings...');
  const res1 = await getMeetings();
  const data1 = await res1.json();

  if (res1.status !== 200 || !Array.isArray(data1.meetings)) {
    throw new Error(`GET /api/meetings failed (status ${res1.status}): ${JSON.stringify(data1)}`);
  }
  console.log(`  -> SUCCESS: Retrieved ${data1.meetings.length} meetings from Supabase.`);
  data1.meetings.forEach((m: any) => {
    console.log(`     - [${m.status.toUpperCase()}] "${m.title}" (Open Action Items: ${m.openActionItemsCount})`);
  });

  const testMeeting = data1.meetings.find((m: any) => m.status === 'past');
  if (!testMeeting) {
    throw new Error('No past meeting found for subsequent tests');
  }

  // --------------------------------------------------------------------------
  // 2. Test GET /api/meetings/[id]
  // --------------------------------------------------------------------------
  console.log(`\n[Test 2/6] Testing GET /api/meetings/[id] for "${testMeeting.title}"...`);
  const res2 = await getMeetingById(
    new Request(`http://localhost:3000/api/meetings/${testMeeting.id}`),
    { params: Promise.resolve({ id: testMeeting.id }) }
  );
  const data2 = await res2.json();

  if (res2.status !== 200 || !data2.meeting || !Array.isArray(data2.transcript) || !Array.isArray(data2.actionItems)) {
    throw new Error(`GET /api/meetings/[id] failed (status ${res2.status}): ${JSON.stringify(data2)}`);
  }
  console.log(`  -> SUCCESS: Found meeting "${data2.meeting.title}"`);
  console.log(`     - Transcript lines: ${data2.transcript.length}`);
  console.log(`     - Action items:     ${data2.actionItems.length}`);
  console.log(`     - AI Decisions:     ${data2.meeting.decisions?.length || 0}`);

  // Test 404 on invalid meeting ID
  const res2NotFound = await getMeetingById(
    new Request('http://localhost:3000/api/meetings/00000000-0000-0000-0000-000000000000'),
    { params: Promise.resolve({ id: '00000000-0000-0000-0000-000000000000' }) }
  );
  if (res2NotFound.status !== 404) {
    throw new Error(`Expected 404 for invalid meeting ID, got ${res2NotFound.status}`);
  }
  console.log('  -> Verified: 404 returned for non-existent meeting ID.');

  // --------------------------------------------------------------------------
  // 3. Test PATCH /api/meetings/[id]/action-items/[itemId]
  // --------------------------------------------------------------------------
  const targetActionItem = data2.actionItems[0];
  if (!targetActionItem) {
    throw new Error('No action items available to test PATCH');
  }
  console.log(`\n[Test 3/6] Testing PATCH /api/meetings/[id]/action-items/[itemId]...`);
  console.log(`  -> Original: "${targetActionItem.text}" | Owner: "${targetActionItem.owner}" | Completed: ${targetActionItem.completed}`);

  // Update completion & owner
  const patchReq1 = new Request(`http://localhost:3000/api/meetings/${testMeeting.id}/action-items/${targetActionItem.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      completed: true,
      owner: 'Elena Rostova (Reassigned)'
    })
  });

  const patchRes1 = await patchActionItem(patchReq1, {
    params: Promise.resolve({ id: testMeeting.id, itemId: targetActionItem.id })
  });
  const patchData1 = await patchRes1.json();

  if (patchRes1.status !== 200 || !patchData1.actionItem) {
    throw new Error(`PATCH failed: ${JSON.stringify(patchData1)}`);
  }
  console.log(`  -> SUCCESS: Updated item -> Completed: ${patchData1.actionItem.completed}, Owner: "${patchData1.actionItem.owner}"`);

  // Verify persistence by querying the meeting again
  const verifyRes = await getMeetingById(
    new Request(`http://localhost:3000/api/meetings/${testMeeting.id}`),
    { params: Promise.resolve({ id: testMeeting.id }) }
  );
  const verifyData = await verifyRes.json();
  const persistedItem = verifyData.actionItems.find((i: any) => i.id === targetActionItem.id);
  if (!persistedItem || !persistedItem.completed || persistedItem.owner !== 'Elena Rostova (Reassigned)') {
    throw new Error('Action item update did not persist to Supabase!');
  }
  console.log('  -> Verified: Changes confirmed persisted in Supabase database.');

  // Revert back so seed data remains in pristine state
  const revertReq = new Request(`http://localhost:3000/api/meetings/${testMeeting.id}/action-items/${targetActionItem.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      completed: false,
      owner: targetActionItem.owner
    })
  });
  await patchActionItem(revertReq, {
    params: Promise.resolve({ id: testMeeting.id, itemId: targetActionItem.id })
  });
  console.log('  -> Cleanly reverted test item to original state.');

  // --------------------------------------------------------------------------
  // 4. Test GET /api/search?q=
  // --------------------------------------------------------------------------
  console.log('\n[Test 4/6] Testing GET /api/search...');
  
  // Search 1: Query for "Supabase"
  const searchReq1 = new Request('http://localhost:3000/api/search?q=Supabase');
  const searchRes1 = await searchRoute(searchReq1);
  const searchData1 = await searchRes1.json();

  if (searchRes1.status !== 200) {
    throw new Error(`Search failed: ${JSON.stringify(searchData1)}`);
  }
  console.log(`  -> Search query "Supabase":`);
  console.log(`     - Meeting matches:    ${searchData1.meetings.length}`);
  console.log(`     - Transcript matches: ${searchData1.transcriptMatches.length}`);
  if (searchData1.transcriptMatches.length > 0) {
    const firstMatch = searchData1.transcriptMatches[0];
    console.log(`     - Sample snippet: [${firstMatch.timestamp}] ${firstMatch.speaker} ("${firstMatch.meetingTitle}"): "${firstMatch.text}"`);
  }

  // Search 2: Query for "PRD"
  const searchReq2 = new Request('http://localhost:3000/api/search?q=PRD');
  const searchRes2 = await searchRoute(searchReq2);
  const searchData2 = await searchRes2.json();
  console.log(`  -> Search query "PRD":`);
  console.log(`     - Transcript matches: ${searchData2.transcriptMatches.length}`);

  // --------------------------------------------------------------------------
  // 5. Test POST /api/share
  // --------------------------------------------------------------------------
  console.log('\n[Test 5/6] Testing POST /api/share (Creating dynamic clip)...');
  const startLine = data2.transcript[0];
  const endLine = data2.transcript[Math.min(2, data2.transcript.length - 1)];

  const postShareReq = new Request('http://localhost:3000/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      meetingId: testMeeting.id,
      startLineId: startLine?.id,
      endLineId: endLine?.id,
      title: 'Automated Test Clip Window'
    })
  });

  const postShareRes = await createShareClip(postShareReq);
  const postShareData = await postShareRes.json();

  if (postShareRes.status !== 201 || !postShareData.token) {
    throw new Error(`POST /api/share failed: ${JSON.stringify(postShareData)}`);
  }
  console.log(`  -> SUCCESS: Created share clip with token: "${postShareData.token}"`);
  console.log(`     - Share URL: ${postShareData.shareUrl}`);
  console.log(`     - Bounded window: line ${startLine?.timestamp} to ${endLine?.timestamp}`);

  // --------------------------------------------------------------------------
  // 6. Test GET /api/share/[token] (Public Share & Privacy Verification)
  // --------------------------------------------------------------------------
  console.log('\n[Test 6/6] Testing GET /api/share/[token] (Anon Public Read & Privacy)...');
  
  // Test seeded clip "launch-v2-demo"
  const getShareRes = await getSharedClip(
    new Request('http://localhost:3000/api/share/launch-v2-demo'),
    { params: Promise.resolve({ token: 'launch-v2-demo' }) }
  );
  const getShareData = await getShareRes.json();

  if (getShareRes.status !== 200 || !getShareData.clip || !getShareData.meeting) {
    throw new Error(`GET /api/share/launch-v2-demo failed (status ${getShareRes.status}): ${JSON.stringify(getShareData)}`);
  }
  console.log(`  -> SUCCESS: Retrieved shared clip "${getShareData.clip.title}"`);
  console.log(`     - Meeting Title:    "${getShareData.meeting.title}"`);
  console.log(`     - Bounded Moments:  ${getShareData.transcript.length} transcript lines`);

  // STRICT SECURITY CHECK: Ensure action_items are NOT exposed
  if ('actionItems' in getShareData || 'action_items' in getShareData || getShareData.meeting.actionItems) {
    throw new Error('SECURITY VIOLATION: Action items leaked in public share response!');
  }
  console.log('  -> Verified: Action items are STRICTLY EXCLUDED from public share payload.');

  // Test newly created token
  const getNewShareRes = await getSharedClip(
    new Request(`http://localhost:3000/api/share/${postShareData.token}`),
    { params: Promise.resolve({ token: postShareData.token }) }
  );
  const getNewShareData = await getNewShareRes.json();
  if (getNewShareRes.status !== 200) {
    throw new Error(`Newly created token lookup failed: ${JSON.stringify(getNewShareData)}`);
  }
  console.log(`  -> Verified: Newly created token "${postShareData.token}" resolves correctly.`);

  // Test 404 on invalid token
  const invalidShareRes = await getSharedClip(
    new Request('http://localhost:3000/api/share/invalid-nonexistent-token'),
    { params: Promise.resolve({ token: 'invalid-nonexistent-token' }) }
  );
  if (invalidShareRes.status !== 404) {
    throw new Error(`Expected 404 for invalid share token, got ${invalidShareRes.status}`);
  }
  console.log('  -> Verified: 404 returned for non-existent token.');

  console.log('\n=== ALL PHASE 3 API ROUTES VERIFIED SUCCESSFULLY WITH LIVE SUPABASE ===');
}

runTests().catch(err => {
  console.error('\nAPI Route Test Failed:', err);
  process.exit(1);
});
