import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // 1. Fetch meeting
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('meetings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (meetingError) {
      console.error('Error fetching meeting:', meetingError.message);
      return NextResponse.json({ error: meetingError.message }, { status: 500 });
    }

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // 2. Fetch transcript lines ordered by line_order
    const { data: transcript, error: transcriptError } = await supabaseAdmin
      .from('transcript_lines')
      .select('*')
      .eq('meeting_id', id)
      .order('line_order', { ascending: true });

    if (transcriptError) {
      console.error('Error fetching transcript:', transcriptError.message);
      return NextResponse.json({ error: transcriptError.message }, { status: 500 });
    }

    // 3. Fetch action items
    const { data: actionItems, error: actionItemsError } = await supabaseAdmin
      .from('action_items')
      .select('*')
      .eq('meeting_id', id)
      .order('created_at', { ascending: true });

    if (actionItemsError) {
      console.error('Error fetching action items:', actionItemsError.message);
      return NextResponse.json({ error: actionItemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      meeting,
      transcript: transcript || [],
      actionItems: actionItems || []
    });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/meetings/[id]:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
