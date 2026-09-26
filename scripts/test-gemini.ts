try {
  process.loadEnvFile('.env.local');
} catch (e) {
  console.error('Failed to load .env.local', e);
}

import { generateMeetingIntelligence } from '../lib/ai/summarize';

async function run() {
  console.log('1. Testing empty transcript handling...');
  const emptyRes = await generateMeetingIntelligence([], 'Upcoming Sync');
  console.log('Empty result:', emptyRes);

  console.log('\n2. Testing realistic transcript with Gemini...');
  const sample = [
    { speaker: 'Sarah Chen', text: 'Good morning everyone. We need to decide whether to launch v2 on Monday or Wednesday.', timestamp: '00:05' },
    { speaker: 'Marcus Brody', text: 'Wednesday gives the infrastructure team 48 more hours for load testing on Supabase connection pooling.', timestamp: '00:22' },
    { speaker: 'Elena Rostova', text: 'I agree with Wednesday. I will run the final end-to-end regression tests on Tuesday afternoon.', timestamp: '00:45' },
    { speaker: 'Sarah Chen', text: 'Agreed. Let us lock in Wednesday at 9 AM PST as the launch window. Marcus, please send the updated checklist to the executive team by tomorrow.', timestamp: '01:05' },
    { speaker: 'Marcus Brody', text: 'Will do. I will send the launch checklist by 5 PM tomorrow.', timestamp: '01:15' }
  ];

  const result = await generateMeetingIntelligence(sample, 'Launch Planning');
  console.log('\n=== GEMINI INTELLIGENCE RESULT ===');
  console.log('Summary:', result.summary);
  console.log('Key Points:', result.keyPoints);
  console.log('Decisions:', result.decisions);
  console.log('Action Items:', result.actionItems);
}

run().catch(console.error);
