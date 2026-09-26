import { SupabaseClient } from '@supabase/supabase-js';

export interface InsertTranscriptLineInput {
  speaker: string;
  text: string;
  timestamp?: string;
  offset_seconds?: number;
}

export interface InsertActionItemInput {
  text: string;
  owner?: string | null;
}

export interface InsertFullMeetingInput {
  title: string;
  date?: string;
  duration?: string;
  status?: 'past' | 'upcoming';
  participants?: string[];
  summary?: string | null;
  decisions?: string[];
  recording_url?: string | null;
  transcript?: InsertTranscriptLineInput[];
  actionItems?: InsertActionItemInput[];
}

export function formatSecondsToTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Shared meeting creation function used by both seed script and recording upload route.
 * Inserts meeting row, bulk-inserts transcript_lines, and bulk-inserts action_items.
 */
export async function insertFullMeeting(
  client: SupabaseClient,
  data: InsertFullMeetingInput
) {
  // 1. Insert meeting row
  const meetingPayload: any = {
    title: data.title,
    date: data.date || new Date().toISOString(),
    duration: data.duration || '30m',
    status: data.status || 'past',
    participants: data.participants || [],
    summary: data.summary || null,
    decisions: data.decisions || [],
  };

  if (data.recording_url) {
    meetingPayload.recording_url = data.recording_url;
  }

  let { data: meetingRow, error: meetingError } = await client
    .from('meetings')
    .insert(meetingPayload)
    .select()
    .single();

  // If recording_url column is not yet present in DB schema, retry without it
  if (meetingError && meetingError.message?.includes('recording_url')) {
    delete meetingPayload.recording_url;
    const retry = await client
      .from('meetings')
      .insert(meetingPayload)
      .select()
      .single();
    meetingRow = retry.data;
    meetingError = retry.error;
  }

  if (meetingError || !meetingRow) {
    throw new Error(`Failed to insert meeting: ${meetingError?.message || 'Unknown error'}`);
  }

  // 2. Insert transcript lines if any
  let insertedLinesCount = 0;
  let firstLineId: string | null = null;
  let midLineId: string | null = null;

  if (data.transcript && data.transcript.length > 0) {
    const linesToInsert = data.transcript.map((line, idx) => ({
      meeting_id: meetingRow.id,
      speaker: line.speaker || 'Speaker',
      text: line.text,
      timestamp: line.timestamp || formatSecondsToTimestamp(line.offset_seconds || 0),
      offset_seconds: line.offset_seconds ?? idx * 5,
      line_order: idx + 1,
    }));

    const { error: linesError, data: linesData } = await client
      .from('transcript_lines')
      .insert(linesToInsert)
      .select();

    if (linesError) {
      console.error('Error inserting transcript lines:', linesError.message);
    } else if (linesData && linesData.length > 0) {
      insertedLinesCount = linesData.length;
      firstLineId = linesData[0].id;
      midLineId = linesData[Math.min(3, linesData.length - 1)].id;
    }
  }

  // 3. Insert action items if any
  let insertedActionsCount = 0;
  if (data.actionItems && data.actionItems.length > 0) {
    const actionsToInsert = data.actionItems.map((item) => ({
      meeting_id: meetingRow.id,
      text: item.text,
      owner: item.owner || null,
      completed: false,
    }));

    const { error: actionsError, data: actionsData } = await client
      .from('action_items')
      .insert(actionsToInsert)
      .select();

    if (actionsError) {
      console.error('Error inserting action items:', actionsError.message);
    } else {
      insertedActionsCount = actionsData?.length || 0;
    }
  }

  return {
    meeting: meetingRow,
    linesCount: insertedLinesCount,
    actionsCount: insertedActionsCount,
    firstLineId,
    midLineId,
  };
}
