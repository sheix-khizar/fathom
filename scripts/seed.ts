try {
  process.loadEnvFile('.env.local');
} catch (e) {
  console.error('Failed to load .env.local', e);
}

import { createClient } from '@supabase/supabase-js';
import { generateMeetingIntelligence } from '../lib/ai/summarize';
import type { Database } from '../lib/supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

interface SeedMeetingDef {
  title: string;
  date: string;
  duration: string;
  status: 'past' | 'upcoming';
  participants: string[];
  transcript: Array<{
    speaker: string;
    text: string;
    timestamp: string;
    offset_seconds: number;
  }>;
}

const SEED_MEETINGS: SeedMeetingDef[] = [
  // 1. Product Strategy
  {
    title: 'Product Strategy: Q4 Roadmap & AI Workflows',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    duration: '42m',
    status: 'past',
    participants: ['Sarah Chen', 'Alex Rivera', 'Elena Rostova', 'Marcus Brody'],
    transcript: [
      { speaker: 'Sarah Chen', text: 'Welcome everyone. Today we are setting the product direction for Q4, specifically around our meeting intelligence experience.', timestamp: '00:04', offset_seconds: 4 },
      { speaker: 'Alex Rivera', text: 'We reviewed feedback from 40 pilot teams. The number one request is not another video scrubber, but an editorial transcript where AI summaries feel like actionable documents.', timestamp: '00:28', offset_seconds: 28 },
      { speaker: 'Elena Rostova', text: 'Current tools give you a rigid template that users copy-paste out of. If our action items and decisions live directly in the workspace, teams can track ownership immediately.', timestamp: '01:05', offset_seconds: 65 },
      { speaker: 'Marcus Brody', text: 'From an engineering perspective, that means Gemini should extract the candidate owner, but the UI must let the user edit that owner with one click rather than treating AI guesses as immutable facts.', timestamp: '01:42', offset_seconds: 102 },
      { speaker: 'Sarah Chen', text: 'I agree completely. Let us drop the full calendar grid from the MVP and double down on an outstanding dashboard and meeting detail page.', timestamp: '02:15', offset_seconds: 135 },
      { speaker: 'Alex Rivera', text: 'I will finalize the PRD for editable action items and the editorial layout by Thursday at 2 PM.', timestamp: '02:45', offset_seconds: 165 },
      { speaker: 'Elena Rostova', text: 'I will benchmark transcript search performance across 20,000 lines in Supabase to make sure full-text search stays sub-50ms.', timestamp: '03:10', offset_seconds: 190 },
      { speaker: 'Sarah Chen', text: 'Excellent. So our decision is locked: prioritize editorial reading surface, editable owners, and drop the calendar grid.', timestamp: '03:35', offset_seconds: 215 }
    ]
  },

  // 2. Engineering Sync
  {
    title: 'Engineering Sync: Supabase Architecture & RLS',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: '31m',
    status: 'past',
    participants: ['Marcus Brody', 'Elena Rostova', 'David Kim'],
    transcript: [
      { speaker: 'Marcus Brody', text: 'Let us review the Supabase data architecture and security policies before we deploy the production build.', timestamp: '00:06', offset_seconds: 6 },
      { speaker: 'David Kim', text: 'I have set up the tables for meetings, transcript_lines, action_items, and share_clips. All foreign keys have cascading deletes on meeting deletion.', timestamp: '00:30', offset_seconds: 30 },
      { speaker: 'Elena Rostova', text: 'What about Row Level Security? We cannot allow anonymous users to scrape private meetings or confidential action items.', timestamp: '00:58', offset_seconds: 58 },
      { speaker: 'Marcus Brody', text: 'Right. The public anon key will only be permitted to read meetings and transcript lines that have an active share clip token. Action items must remain strictly private to backend service routes.', timestamp: '01:34', offset_seconds: 94 },
      { speaker: 'David Kim', text: 'Understood. I will verify that composite indexes exist on meeting_id and line_order for the transcript table to keep timeline scrubbing snappy.', timestamp: '02:08', offset_seconds: 128 },
      { speaker: 'Marcus Brody', text: 'Decided: strict zero-leak RLS is mandatory, and all internal mutations go through the server admin client.', timestamp: '02:40', offset_seconds: 160 },
      { speaker: 'David Kim', text: 'I will finish testing the RLS policies in our staging environment by 4 PM today.', timestamp: '03:02', offset_seconds: 182 }
    ]
  },

  // 3. Customer Discovery
  {
    title: 'Customer Discovery: Acme Corp Feedback on Call Notes',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    duration: '36m',
    status: 'past',
    participants: ['Sarah Chen', 'Rachel Green (Acme Corp)', 'Liam Vance'],
    transcript: [
      { speaker: 'Sarah Chen', text: 'Rachel, thank you for joining us today. We would love to hear how your 60-person revenue team is finding the automated call summaries.', timestamp: '00:08', offset_seconds: 8 },
      { speaker: 'Rachel Green (Acme Corp)', text: 'Overall, the transcript accuracy is great. But our biggest friction point is task attribution. When two sales reps discuss a deal, the AI sometimes assigns the follow-up to the wrong person.', timestamp: '00:38', offset_seconds: 38 },
      { speaker: 'Liam Vance', text: 'That makes total sense. If the AI provides an initial owner guess that any rep can immediately reassign with a clean dropdown, would that solve it?', timestamp: '01:14', offset_seconds: 74 },
      { speaker: 'Rachel Green (Acme Corp)', text: 'Yes, that would save us at least 15 minutes of manual cleanup per call. Also, being able to share just a 2-minute snippet of a prospect objection with product managers is huge.', timestamp: '01:52', offset_seconds: 112 },
      { speaker: 'Sarah Chen', text: 'We decided today to make snippet sharing standard with honest transcript windows, so you share the exact conversation slice without rendering video files.', timestamp: '02:26', offset_seconds: 146 },
      { speaker: 'Sarah Chen', text: 'I will email you the updated demo link tomorrow morning so your team can test the new owner reassignments.', timestamp: '02:55', offset_seconds: 175 },
      { speaker: 'Liam Vance', text: 'And I will integrate the feedback into our share modal designs by Friday morning.', timestamp: '03:15', offset_seconds: 195 }
    ]
  },

  // 4. Launch Planning
  {
    title: 'Launch Planning: Fathom Rebuild v2 Go-Live',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    duration: '26m',
    status: 'past',
    participants: ['Sarah Chen', 'Marcus Brody', 'Elena Rostova'],
    transcript: [
      { speaker: 'Sarah Chen', text: 'Alright team, final check for the Fathom Rebuild v2 submission.', timestamp: '00:05', offset_seconds: 5 },
      { speaker: 'Marcus Brody', text: 'Supabase schema is live, RLS verified, and our server-side Gemini pipeline extracts real executive summaries, key decisions, and action items with guessed owners.', timestamp: '00:32', offset_seconds: 32 },
      { speaker: 'Elena Rostova', text: 'I completed end-to-end testing of the public share page. Opening a shared link in an incognito window displays the bounded transcript cleanly without requiring sign-in.', timestamp: '01:05', offset_seconds: 65 },
      { speaker: 'Sarah Chen', text: 'We decided on our submission assets: a 5-minute product walkthrough with camera on covering what we kept and what we cut, plus the separate 1-minute intro video.', timestamp: '01:40', offset_seconds: 100 },
      { speaker: 'Marcus Brody', text: 'I will push the final production deployment to Vercel and verify the live domain by 6 PM.', timestamp: '02:12', offset_seconds: 132 },
      { speaker: 'Elena Rostova', text: 'I will verify the final agent logs are committed and up to date in the GitHub repo.', timestamp: '02:35', offset_seconds: 155 },
      { speaker: 'Sarah Chen', text: 'And I will record the walkthrough and intro videos tonight. Let us ship it!', timestamp: '02:58', offset_seconds: 178 }
    ]
  },

  // 5. Upcoming Meeting (No transcript, upcoming state)
  {
    title: 'Upcoming Sprint Planning & Retrospective',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration: '45m',
    status: 'upcoming',
    participants: ['Sarah Chen', 'Marcus Brody', 'Elena Rostova', 'Alex Rivera'],
    transcript: [] // Completely empty transcript!
  }
];

async function seedDatabase() {
  console.log('=== STARTING SUPABASE DATABASE SEED (PHASE 2) ===');
  console.log('Connecting to:', supabaseUrl);

  // 1. Clean existing records (cascades to transcripts, action items, clips)
  console.log('\n[1/4] Clearing existing meeting records...');
  const { error: deleteError } = await adminClient
    .from('meetings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Failed to clear old meetings:', deleteError.message);
    process.exit(1);
  }
  console.log('  -> Existing records cleared.');

  // 2. Iterate through each meeting
  console.log('\n[2/4] Processing meetings and running Gemini pipeline...');

  for (let i = 0; i < SEED_MEETINGS.length; i++) {
    const meetingDef = SEED_MEETINGS[i];
    console.log(`\n--- Meeting ${i + 1}/${SEED_MEETINGS.length}: "${meetingDef.title}" (${meetingDef.status}) ---`);

    // Pause briefly to respect API rate limits
    if (i > 0) {
      await new Promise(r => setTimeout(r, 1500));
    }

    // Run real Gemini pipeline on transcript
    console.log(`  -> Running Gemini pipeline (Transcript lines: ${meetingDef.transcript.length})...`);
    const intelligence = await generateMeetingIntelligence(meetingDef.transcript, meetingDef.title);

    console.log(`  -> Gemini result received:`);
    console.log(`     Summary: ${intelligence.summary ? intelligence.summary.substring(0, 90) + '...' : '(none - empty state)'}`);
    console.log(`     Key Points count: ${intelligence.keyPoints.length}`);
    console.log(`     Decisions count: ${intelligence.decisions.length}`);
    console.log(`     Action Items count: ${intelligence.actionItems.length}`);

    // Insert meeting row into Supabase
    const { data: meetingRow, error: meetingError } = await adminClient
      .from('meetings')
      .insert({
        title: meetingDef.title,
        date: meetingDef.date,
        duration: meetingDef.duration,
        status: meetingDef.status,
        participants: meetingDef.participants,
        summary: intelligence.summary,
        decisions: intelligence.decisions
      })
      .select()
      .single();

    if (meetingError || !meetingRow) {
      console.error(`Failed to insert meeting "${meetingDef.title}":`, meetingError?.message);
      process.exit(1);
    }
    console.log(`  -> Meeting row created with ID: ${meetingRow.id}`);

    // Insert transcript lines if any
    let firstLineId: string | null = null;
    let midLineId: string | null = null;

    if (meetingDef.transcript.length > 0) {
      const lineInserts = meetingDef.transcript.map((line, idx) => ({
        meeting_id: meetingRow.id,
        speaker: line.speaker,
        text: line.text,
        timestamp: line.timestamp,
        offset_seconds: line.offset_seconds,
        line_order: idx + 1
      }));

      const { data: insertedLines, error: linesError } = await adminClient
        .from('transcript_lines')
        .insert(lineInserts)
        .select();

      if (linesError || !insertedLines) {
        console.error(`Failed to insert transcript lines:`, linesError?.message);
        process.exit(1);
      }
      console.log(`  -> Inserted ${insertedLines.length} transcript lines.`);
      if (insertedLines.length > 0) {
        firstLineId = insertedLines[0].id;
        midLineId = insertedLines[Math.min(3, insertedLines.length - 1)].id;
      }
    } else {
      console.log(`  -> No transcript lines (honest empty state for upcoming meeting).`);
    }

    // Insert Gemini-extracted action items
    if (intelligence.actionItems.length > 0) {
      const actionInserts = intelligence.actionItems.map(item => ({
        meeting_id: meetingRow.id,
        text: item.text,
        owner: item.owner,
        completed: false
      }));

      const { data: insertedActions, error: actionError } = await adminClient
        .from('action_items')
        .insert(actionInserts)
        .select();

      if (actionError || !insertedActions) {
        console.error(`Failed to insert action items:`, actionError?.message);
        process.exit(1);
      }
      console.log(`  -> Inserted ${insertedActions.length} Gemini-generated action items.`);
    }

    // Create a sample share clip for the Launch Planning meeting (meeting #4)
    if (meetingDef.title.includes('Launch Planning') && firstLineId && midLineId) {
      const shareToken = 'launch-v2-demo';
      const { error: clipError } = await adminClient
        .from('share_clips')
        .insert({
          meeting_id: meetingRow.id,
          token: shareToken,
          title: 'Launch Decision & Walkthrough Clip',
          start_line_id: firstLineId,
          end_line_id: midLineId,
          start_time: '00:05',
          end_time: '01:40'
        });

      if (clipError) {
        console.warn('Could not create seed share clip:', clipError.message);
      } else {
        console.log(`  -> Created demo share clip with token: "${shareToken}"`);
      }
    }
  }

  // 3. Verification of seeded database
  console.log('\n[3/4] Verifying seeded data in Supabase...');

  const { data: meetingsCount } = await adminClient.from('meetings').select('id, title, status, summary, decisions');
  const { data: linesCount } = await adminClient.from('transcript_lines').select('id');
  const { data: actionsCount } = await adminClient.from('action_items').select('id, text, owner');
  const { data: clipsCount } = await adminClient.from('share_clips').select('id, token');

  console.log(`\n=== SEED RESULTS IN SUPABASE ===`);
  console.log(`Total Meetings:        ${meetingsCount?.length || 0}`);
  console.log(`Total Transcript Lines:${linesCount?.length || 0}`);
  console.log(`Total Action Items:    ${actionsCount?.length || 0}`);
  console.log(`Total Share Clips:     ${clipsCount?.length || 0}`);

  console.log('\nMeeting Summaries Overview:');
  meetingsCount?.forEach(m => {
    console.log(`- [${m.status.toUpperCase()}] "${m.title}"`);
    console.log(`  Summary: ${m.summary ? m.summary.substring(0, 100) + '...' : '(honest empty state)'}`);
    console.log(`  Decisions: ${JSON.stringify(m.decisions)}`);
  });

  console.log('\nSample Gemini Action Items with Guessed Owners:');
  actionsCount?.slice(0, 5).forEach(a => {
    console.log(`- Task: "${a.text}" | Owner Guess: [${a.owner || 'Unassigned'}]`);
  });

  console.log('\n=== PHASE 2 SEED COMPLETED SUCCESSFULLY ===');
}

seedDatabase().catch(err => {
  console.error('Seed script encountered a critical error:', err);
  process.exit(1);
});
