"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EnrichedMeeting } from "@/lib/types/meetings";
import AddMeetingButton from "@/components/meeting/AddMeetingButton";

interface EditorialDashboardProps {
  initialMeetings: EnrichedMeeting[];
}

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

export default function EditorialDashboard({ initialMeetings }: EditorialDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "past" | "upcoming">("all");

  const upcomingMeetings = useMemo(
    () => initialMeetings.filter(m => m.status === "upcoming"),
    [initialMeetings]
  );

  const pastMeetings = useMemo(
    () => initialMeetings.filter(m => m.status === "past"),
    [initialMeetings]
  );

  const totalOpenActionItems = useMemo(
    () => initialMeetings.reduce((sum, m) => sum + (m.openActionItemsCount || 0), 0),
    [initialMeetings]
  );

  const filteredPastMeetings = useMemo(() => {
    if (!searchQuery.trim()) return pastMeetings;
    const q = searchQuery.toLowerCase();
    return pastMeetings.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        (m.summary && m.summary.toLowerCase().includes(q)) ||
        m.participants.some(p => p.toLowerCase().includes(q))
    );
  }, [pastMeetings, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 px-4 sm:px-6">
      {/* Editorial Welcome Header */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Supabase Backend • Gemini 3.8
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-serif md:font-sans">
              Meeting Intelligence Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
              Synchronized dialogue diarization, Gemini executive summaries, decision tracking, and zero-leak public moment sharing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition shadow-sm"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Transcripts
            </Link>
            <AddMeetingButton />
          </div>
        </div>

        {/* Workspace Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--border)] text-xs">
          <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-3">
            <span className="text-[11px] font-mono text-[var(--muted-foreground)] block">Total Sessions</span>
            <span className="text-lg font-bold text-[var(--foreground)]">{initialMeetings.length}</span>
          </div>
          <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-3">
            <span className="text-[11px] font-mono text-[var(--muted-foreground)] block">Past Syntheses</span>
            <span className="text-lg font-bold text-[var(--foreground)]">{pastMeetings.length}</span>
          </div>
          <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-3">
            <span className="text-[11px] font-mono text-[var(--muted-foreground)] block">Scheduled Upcoming</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{upcomingMeetings.length}</span>
          </div>
          <div className="rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-3">
            <span className="text-[11px] font-mono text-[var(--muted-foreground)] block">Open Action Items</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalOpenActionItems}</span>
          </div>
        </div>
      </section>

      {/* Quick Search Entry Point */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[var(--muted-foreground)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search across meeting titles, AI summaries, or press Enter for full dialogue search..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-24 py-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 h-8 px-3.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium hover:opacity-90 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Section 1: Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Scheduled Upcoming Meetings
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {upcomingMeetings.length} session
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {upcomingMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 p-5 transition shadow-sm"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400">
                      UPCOMING
                    </span>
                    <span className="text-xs font-mono text-[var(--muted-foreground)]">
                      {formatDisplayDate(meeting.date)}
                    </span>
                    <span className="text-xs font-mono text-[var(--muted-foreground)]">
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

                <div className="flex items-center gap-3 shrink-0">
                  {meeting.participants && (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {meeting.participants.map((p, idx) => (
                        <span
                          key={idx}
                          title={p}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--muted)] text-[10px] font-bold border border-[var(--border)] text-[var(--foreground)]"
                        >
                          {p.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Open details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Recent / Past Synthesized Meetings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Synthesized Meetings & Intelligence
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--muted-foreground)]">
            {filteredPastMeetings.length} of {pastMeetings.length} calls
          </span>
        </div>

        {filteredPastMeetings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-2">
            <p className="text-sm font-medium text-[var(--foreground)]">No matching meetings found</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {searchQuery ? `No recorded meetings match "${searchQuery}".` : 'No past meetings recorded.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPastMeetings.map((meeting) => (
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

                  {/* Decisions badges preview */}
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
