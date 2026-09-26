import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;

    if (!token || token.trim() === '') {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
    }

    // 1. Fetch the share clip using the public anon client (governed by RLS)
    const { data: clip, error: clipError } = await supabase
      .from('share_clips')
      .select('*')
      .eq('token', token.trim())
      .maybeSingle();

    if (clipError) {
      console.error('Error fetching share clip:', clipError.message);
      return NextResponse.json({ error: clipError.message }, { status: 500 });
    }

    if (!clip) {
      return NextResponse.json({ error: 'Share clip not found' }, { status: 404 });
    }

    // 2. Fetch the linked meeting using public anon client
    // RLS policy "Allow public read on shared meetings" ensures this only succeeds
    // because a valid share_clip exists for this meeting_id.
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, date, duration, summary, decisions')
      .eq('id', clip.meeting_id)
      .maybeSingle();

    if (meetingError) {
      console.error('Error fetching shared meeting:', meetingError.message);
      return NextResponse.json({ error: meetingError.message }, { status: 500 });
    }

    if (!meeting) {
      return NextResponse.json({ error: 'Associated meeting not found or unavailable' }, { status: 404 });
    }

    // 3. Fetch transcript lines using public anon client
    const { data: allLines, error: linesError } = await supabase
      .from('transcript_lines')
      .select('id, meeting_id, speaker, text, timestamp, offset_seconds, line_order')
      .eq('meeting_id', clip.meeting_id)
      .order('line_order', { ascending: true });

    if (linesError) {
      console.error('Error fetching shared transcript lines:', linesError.message);
      return NextResponse.json({ error: linesError.message }, { status: 500 });
    }

    // 4. If clip specifies a bounded window (start_line_id / end_line_id), filter to that window
    let boundedTranscript = allLines || [];
    if (clip.start_line_id || clip.end_line_id) {
      const startIndex = clip.start_line_id
        ? boundedTranscript.findIndex(l => l.id === clip.start_line_id)
        : 0;
      const endIndex = clip.end_line_id
        ? boundedTranscript.findIndex(l => l.id === clip.end_line_id)
        : boundedTranscript.length - 1;

      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        boundedTranscript = boundedTranscript.slice(startIndex, endIndex + 1);
      }
    }

    // STRICT PRIVACY CHECK:
    // Action items are intentionally NOT queried or returned.
    // Public share route provides only the shared clip, meeting overview, and bounded transcript moment.

    return NextResponse.json({
      clip,
      meeting,
      transcript: boundedTranscript
    });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/share/[token]:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
