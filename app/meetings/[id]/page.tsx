import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import MeetingDetailV2 from "@/components/meeting/MeetingDetailV2";
import type { Meeting, TranscriptLine, ActionItem } from "@/lib/supabase/types";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function MeetingDetailPage({
  params,
  searchParams,
}: MeetingPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const initialTime = resolvedSearchParams?.t ? parseInt(resolvedSearchParams.t, 10) : 0;

  if (!id) {
    notFound();
  }

  // 1. Fetch meeting row from live Supabase database
  const { data: meeting, error: meetingError } = await supabaseAdmin
    .from("meetings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (meetingError) {
    console.error("Database error fetching meeting:", meetingError.message);
  }

  if (!meeting) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Meeting Not Found
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            No meeting exists with identifier <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--muted)]">{id}</code>.
          </p>
        </div>
        <div>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-xs font-medium text-[var(--background)] hover:opacity-90 transition shadow-sm"
          >
            ← Return to All Meetings
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch transcript lines ordered by line_order
  const { data: transcriptData } = await supabaseAdmin
    .from("transcript_lines")
    .select("*")
    .eq("meeting_id", id)
    .order("line_order", { ascending: true });

  // 3. Fetch action items ordered by created_at
  const { data: actionItemsData } = await supabaseAdmin
    .from("action_items")
    .select("*")
    .eq("meeting_id", id)
    .order("created_at", { ascending: true });

  const transcript: TranscriptLine[] = transcriptData || [];
  const actionItems: ActionItem[] = actionItemsData || [];

  return (
    <MeetingDetailV2
      meeting={meeting as Meeting}
      transcript={transcript}
      actionItems={actionItems}
      initialTime={isNaN(initialTime) ? 0 : initialTime}
    />
  );
}
