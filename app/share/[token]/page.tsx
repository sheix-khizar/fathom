import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Meeting, ShareClip, TranscriptLine } from "@/lib/supabase/types";
import EditorialPublicClip from "@/components/share/EditorialPublicClip";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function ShareClipPage({ params }: SharePageProps) {
  const { token } = await params;
  const cleanToken = token?.trim();

  if (!cleanToken) {
    return <NotFoundState token={token} />;
  }

  // 1. Fetch clip using the public anon client (governed by Supabase RLS)
  const { data: clip, error: clipError } = await supabase
    .from("share_clips")
    .select("*")
    .eq("token", cleanToken)
    .maybeSingle();

  if (clipError || !clip) {
    console.error("Error fetching share clip:", clipError?.message);
    return <NotFoundState token={token} />;
  }

  // 2. Fetch linked meeting using public anon client
  // RLS policy ensures this only succeeds because a share_clip exists for this meeting
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id, title, date, duration, participants, status, summary, decisions, created_at")
    .eq("id", clip.meeting_id)
    .maybeSingle();

  if (meetingError || !meeting) {
    console.error("Error fetching meeting under RLS:", meetingError?.message);
    return <NotFoundState token={token} />;
  }

  // 3. Fetch transcript lines using public anon client
  const { data: allLines, error: linesError } = await supabase
    .from("transcript_lines")
    .select("id, meeting_id, speaker, text, timestamp, offset_seconds, line_order, created_at")
    .eq("meeting_id", clip.meeting_id)
    .order("line_order", { ascending: true });

  if (linesError) {
    console.error("Error fetching transcript lines under RLS:", linesError?.message);
  }

  // 4. Bound the transcript window strictly between start_line_id and end_line_id
  let boundedTranscript: TranscriptLine[] = allLines || [];

  if (clip.start_line_id || clip.end_line_id) {
    const startIdx = clip.start_line_id
      ? boundedTranscript.findIndex((l) => l.id === clip.start_line_id)
      : 0;
    const endIdx = clip.end_line_id
      ? boundedTranscript.findIndex((l) => l.id === clip.end_line_id)
      : boundedTranscript.length - 1;

    if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
      boundedTranscript = boundedTranscript.slice(startIdx, endIdx + 1);
    } else if (startIdx !== -1) {
      boundedTranscript = boundedTranscript.slice(startIdx);
    }
  }

  // Action items are intentionally NEVER queried or returned on public share pages (zero leak RLS)

  return (
    <EditorialPublicClip
      clip={clip as ShareClip}
      meeting={meeting as Meeting}
      transcript={boundedTranscript}
    />
  );
}

function NotFoundState({ token }: { token: string }) {
  return (
    <div className="mx-auto max-w-lg py-20 px-4 text-center space-y-6">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Shared Clip Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
          The shared meeting link with token &ldquo;
          <span className="font-mono text-[var(--foreground)] font-semibold">{token}</span>
          &rdquo; could not be found or may have expired.
        </p>
      </div>

      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
        >
          ← Return to Fathom Workspace
        </Link>
      </div>
    </div>
  );
}
