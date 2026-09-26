import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    // 1. Fetch meetings ordered by date desc
    const { data: meetings, error: meetingsError } = await supabaseAdmin
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });

    if (meetingsError) {
      console.error('Failed to fetch meetings:', meetingsError.message);
      return NextResponse.json({ error: meetingsError.message }, { status: 500 });
    }

    // 2. Fetch open action items count for each meeting
    const { data: openActionItems, error: actionsError } = await supabaseAdmin
      .from('action_items')
      .select('id, meeting_id')
      .eq('completed', false);

    if (actionsError) {
      console.warn('Could not fetch action items count:', actionsError.message);
    }

    // Compute open action items count per meeting
    const countMap: Record<string, number> = {};
    openActionItems?.forEach(item => {
      countMap[item.meeting_id] = (countMap[item.meeting_id] || 0) + 1;
    });

    const enrichedMeetings = (meetings || []).map(m => ({
      ...m,
      openActionItemsCount: countMap[m.id] || 0
    }));

    return NextResponse.json({ meetings: enrichedMeetings });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/meetings:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
