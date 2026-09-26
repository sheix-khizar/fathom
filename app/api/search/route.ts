import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json({
        query: '',
        meetings: [],
        transcriptMatches: []
      });
    }

    // Escape any special characters for SQL ILIKE pattern safely
    const sanitized = query.replace(/[%_]/g, '\\$&');

    // 1. Search in meetings (title or summary)
    const { data: matchedMeetings, error: meetingsError } = await supabaseAdmin
      .from('meetings')
      .select('id, title, date, duration, status, summary')
      .or(`title.ilike.%${sanitized}%,summary.ilike.%${sanitized}%`)
      .order('date', { ascending: false })
      .limit(20);

    if (meetingsError) {
      console.error('Error searching meetings:', meetingsError.message);
      return NextResponse.json({ error: meetingsError.message }, { status: 500 });
    }

    // 2. Search in transcript lines
    const { data: matchedLines, error: linesError } = await supabaseAdmin
      .from('transcript_lines')
      .select('id, meeting_id, speaker, text, timestamp, offset_seconds, line_order')
      .ilike('text', `%${sanitized}%`)
      .order('line_order', { ascending: true })
      .limit(50);

    if (linesError) {
      console.error('Error searching transcript lines:', linesError.message);
      return NextResponse.json({ error: linesError.message }, { status: 500 });
    }

    // 3. Attach meeting title to each transcript line match
    let enrichedLines: any[] = [];
    if (matchedLines && matchedLines.length > 0) {
      const meetingIds = Array.from(new Set(matchedLines.map(l => l.meeting_id)));
      const { data: relatedMeetings } = await supabaseAdmin
        .from('meetings')
        .select('id, title')
        .in('id', meetingIds);

      const titleMap: Record<string, string> = {};
      relatedMeetings?.forEach(m => {
        titleMap[m.id] = m.title;
      });

      enrichedLines = matchedLines.map(line => ({
        ...line,
        meetingTitle: titleMap[line.meeting_id] || 'Meeting'
      }));
    }

    return NextResponse.json({
      query,
      meetings: matchedMeetings || [],
      transcriptMatches: enrichedLines
    });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/search:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
