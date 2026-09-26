import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { meetingId, startLineId, endLineId, startTime, endTime, title } = body;

    if (!meetingId || typeof meetingId !== 'string') {
      return NextResponse.json({ error: '"meetingId" is required' }, { status: 400 });
    }

    // 1. Confirm the meeting exists
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('meetings')
      .select('id, title')
      .eq('id', meetingId)
      .maybeSingle();

    if (meetingError) {
      console.error('Error finding meeting:', meetingError.message);
      return NextResponse.json({ error: meetingError.message }, { status: 500 });
    }

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // 2. Generate a secure, unique URL-safe token
    const token = crypto.randomBytes(8).toString('base64url');

    // 3. Resolve start/end times if startLineId or endLineId provided but times omitted
    let resolvedStartTime = startTime || null;
    let resolvedEndTime = endTime || null;

    if (startLineId && !resolvedStartTime) {
      const { data: startLine } = await supabaseAdmin
        .from('transcript_lines')
        .select('timestamp')
        .eq('id', startLineId)
        .maybeSingle();
      if (startLine) {
        resolvedStartTime = startLine.timestamp;
      }
    }

    if (endLineId && !resolvedEndTime) {
      const { data: endLine } = await supabaseAdmin
        .from('transcript_lines')
        .select('timestamp')
        .eq('id', endLineId)
        .maybeSingle();
      if (endLine) {
        resolvedEndTime = endLine.timestamp;
      }
    }

    // 4. Insert into share_clips table
    const clipTitle = title && typeof title === 'string' ? title.trim() : `${meeting.title} (Clip)`;

    const { data: newClip, error: clipError } = await supabaseAdmin
      .from('share_clips')
      .insert({
        token,
        meeting_id: meetingId,
        start_line_id: startLineId || null,
        end_line_id: endLineId || null,
        start_time: resolvedStartTime,
        end_time: resolvedEndTime,
        title: clipTitle
      })
      .select()
      .single();

    if (clipError || !newClip) {
      console.error('Error creating share clip:', clipError?.message);
      return NextResponse.json({ error: clipError?.message || 'Failed to create share clip' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        token: newClip.token,
        shareUrl: `/share/${newClip.token}`,
        clip: newClip
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Unexpected error in POST /api/share:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
