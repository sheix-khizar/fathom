import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { EnrichedMeeting } from "@/lib/types/meetings";
import AddMeetingButton from "@/components/meeting/AddMeetingButton";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-teal-800 uppercase tracking-wide">
              Archive & Roster
            </span>
            <span className="text-xs font-mono text-slate-500">
              • Supabase Live Store
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            All Recorded & Scheduled Meetings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Access synced dialogue transcripts, Gemini executive summaries, decisions, and action items.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 shadow-sm">
            {enrichedMeetings.length} Total Sessions
          </span>
          <AddMeetingButton />
        </div>
      </div>

      {/* Upcoming Section */}
      {upcomingMeetings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Scheduled Upcoming Calls
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {upcomingMeetings.length} session
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {upcomingMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/50 via-white to-white p-5 transition-all duration-200 hover:border-sky-300 hover:shadow-md"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-mono font-medium text-sky-800">
                      UPCOMING
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {formatDisplayDate(meeting.date)}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      • {meeting.duration}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-800 transition">
                    {meeting.title}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Scheduled • AI Executive Summary, decisions, and synced transcripts will generate on call ingest.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {meeting.participants && (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {meeting.participants.map((p, idx) => (
                        <span
                          key={idx}
                          title={p}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold border-2 border-white text-slate-700"
                        >
                          {p.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs font-medium text-sky-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono">
                    Open details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Past Meetings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Past Synthesized Meetings
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {pastMeetings.length} calls
          </span>
        </div>

        {pastMeetings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900">No past meetings recorded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5 space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-800">
                      AI READY
                    </span>
                    <span className="font-mono text-xs text-slate-500 shrink-0">
                      ⏱ {meeting.duration}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-800 transition line-clamp-1">
                    {meeting.title}
                  </h3>

                  {meeting.summary ? (
                    <div className="border-l-2 border-teal-600/40 pl-3 py-0.5">
                      <p className="text-xs leading-relaxed text-slate-600 line-clamp-2 italic">
                        "{meeting.summary}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">
                      No summary available.
                    </p>
                  )}

                  {/* Decisions preview */}
                  {meeting.decisions && meeting.decisions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {meeting.decisions.slice(0, 2).map((d, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] text-slate-800 truncate max-w-[220px]"
                        >
                          <span className="text-teal-700 font-bold mr-1">✓</span> {d}
                        </span>
                      ))}
                      {meeting.decisions.length > 2 && (
                        <span className="text-[10px] font-mono text-slate-500 self-center">
                          +{meeting.decisions.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span>📅 {formatDisplayDate(meeting.date)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {meeting.openActionItemsCount !== undefined && meeting.openActionItemsCount > 0 && (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-amber-800">
                        {meeting.openActionItemsCount} tasks open
                      </span>
                    )}
                    <span className="text-teal-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono font-medium">
                      Briefing →
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
