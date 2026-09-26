import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { EnrichedMeeting } from "@/lib/types/meetings";

export const dynamic = "force-dynamic";

function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default async function MeetingsListPage() {
  // 1. Fetch meetings from Supabase
  const { data: meetings, error: meetingsError } = await supabaseAdmin
    .from("meetings")
    .select("*")
    .order("date", { ascending: false });

  if (meetingsError) {
    console.error("Database error in /meetings:", meetingsError.message);
  }

  // 2. Fetch open action items
  const { data: openActions } = await supabaseAdmin
    .from("action_items")
    .select("id, meeting_id")
    .eq("completed", false);

  const countMap: Record<string, number> = {};
  openActions?.forEach(a => {
    countMap[a.meeting_id] = (countMap[a.meeting_id] || 0) + 1;
  });

  const enrichedMeetings: EnrichedMeeting[] = (meetings || []).map(m => ({
    ...m,
    openActionItemsCount: countMap[m.id] || 0,
  }));

  const upcomingMeetings = enrichedMeetings.filter(m => m.status === "upcoming");
  const pastMeetings = enrichedMeetings.filter(m => m.status === "past");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-serif md:font-sans">
            All Recorded & Scheduled Meetings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Access synced transcripts, Gemini executive summaries, decisions, and action items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-xs font-mono text-[var(--foreground)]">
            {enrichedMeetings.length} Total Sessions
          </span>
        </div>
      </div>

      {/* Upcoming Section */}
      {upcomingMeetings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Scheduled Upcoming
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {upcomingMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/10 p-5 transition shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400">
                      UPCOMING
                    </span>
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      {formatDisplayDate(meeting.date)}
                    </span>
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      • {meeting.duration}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {meeting.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Scheduled • AI Executive Summary, decisions, and synced transcripts will generate on call ingest.
                  </p>
                </div>

                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0">
                  Open details →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Past Meetings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Past Synthesized Meetings
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--muted-foreground)]">
            {pastMeetings.length} calls
          </span>
        </div>

        {pastMeetings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-2">
            <p className="text-sm font-medium text-[var(--foreground)]">No past meetings recorded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-indigo-500 hover:shadow-md space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      AI READY
                    </span>
                    <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">
                      ⏱ {meeting.duration}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[var(--foreground)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                    {meeting.title}
                  </h3>

                  {meeting.summary ? (
                    <p className="text-xs leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
                      {meeting.summary}
                    </p>
                  ) : (
                    <p className="text-xs italic text-[var(--muted-foreground)]">
                      No summary available.
                    </p>
                  )}

                  {/* Decisions preview */}
                  {meeting.decisions && meeting.decisions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {meeting.decisions.slice(0, 2).map((d, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-[10px] text-[var(--foreground)] truncate max-w-[200px]"
                        >
                          ✓ {d}
                        </span>
                      ))}
                      {meeting.decisions.length > 2 && (
                        <span className="text-[10px] text-[var(--muted-foreground)] self-center">
                          +{meeting.decisions.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>{formatDisplayDate(meeting.date)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {meeting.openActionItemsCount !== undefined && meeting.openActionItemsCount > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono font-medium text-amber-600 dark:text-amber-400">
                        {meeting.openActionItemsCount} tasks
                      </span>
                    )}
                    <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-medium">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
