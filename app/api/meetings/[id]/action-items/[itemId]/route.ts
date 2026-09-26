import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: meetingId, itemId } = await context.params;

    if (!meetingId || !itemId) {
      return NextResponse.json({ error: 'meetingId and itemId are required' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { completed, owner, text } = body;

    // Build update object only with provided valid fields
    const updates: Record<string, any> = {};

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return NextResponse.json({ error: '"completed" must be a boolean' }, { status: 400 });
      }
      updates.completed = completed;
    }

    if (owner !== undefined) {
      if (owner !== null && typeof owner !== 'string') {
        return NextResponse.json({ error: '"owner" must be a string or null' }, { status: 400 });
      }
      updates.owner = owner === null ? null : owner.trim();
    }

    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return NextResponse.json({ error: '"text" must be a non-empty string' }, { status: 400 });
      }
      updates.text = text.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided (allowed: completed, owner, text)' }, { status: 400 });
    }

    // 1. Verify item exists and belongs to this meeting
    const { data: existing, error: findError } = await supabaseAdmin
      .from('action_items')
      .select('id, meeting_id')
      .eq('id', itemId)
      .eq('meeting_id', meetingId)
      .maybeSingle();

    if (findError) {
      console.error('Error finding action item:', findError.message);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: 'Action item not found for this meeting' }, { status: 404 });
    }

    // 2. Perform the update
    const { data: updatedItem, error: updateError } = await supabaseAdmin
      .from('action_items')
      .update(updates)
      .eq('id', itemId)
      .eq('meeting_id', meetingId)
      .select()
      .single();

    if (updateError || !updatedItem) {
      console.error('Error updating action item:', updateError?.message);
      return NextResponse.json({ error: updateError?.message || 'Failed to update action item' }, { status: 500 });
    }

    return NextResponse.json({ actionItem: updatedItem });
  } catch (err: any) {
    console.error('Unexpected error in PATCH action-item:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
