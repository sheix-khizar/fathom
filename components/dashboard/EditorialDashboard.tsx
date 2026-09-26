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

  const totalDecisionsCount = useMemo(
    () => initialMeetings.reduce((sum, m) => sum + (m.decisions?.length || 0), 0),
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
      {/* Editorial Welcome Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--background)] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Supabase Backend
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-mono font-medium text-indigo-400 border border-indigo-500/25">
                ✨ Gemini 3.8 Ingest
              </span>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-amber-400">
                v2 · beta
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              Meeting Intelligence Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
              Synchronized dialogue diarization, Gemini executive summaries, decision tracking, and zero-leak public moment sharing.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-slate-600 transition shadow-sm"
            >
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Transcripts
            </Link>
            <AddMeetingButton />
          </div>
        </div>

        {/* Workspace Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-[var(--border)] text-xs">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 transition hover:border-indigo-500/30 hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Total Sessions</span>
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-[var(--foreground)] font-mono">{initialMeetings.length}</div>
            <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 block">Stored in Supabase</span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 transition hover:border-emerald-500/30 hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">AI Syntheses</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{pastMeetings.length}</div>
            <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 block">Transcripts processed</span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 transition hover:border-sky-500/30 hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Scheduled</span>
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-sky-400 font-mono">{upcomingMeetings.length}</div>
            <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 block">Pending call ingest</span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 transition hover:border-amber-500/30 hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Open Deliverables</span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{totalOpenActionItems}</div>
            <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 block">{totalDecisionsCount} decisions agreed</span>
          </div>
        </div>
      </section>

      {/* Quick Search Entry Point */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center shadow-lg rounded-2xl">
          <span className="absolute left-4 text-[var(--muted-foreground)] pointer-events-none">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search across meeting titles, AI summaries, or press Enter for full dialogue search..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-28 py-3.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <button
              type="submit"
              className="h-8 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Section 1: Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] font-mono">
                Scheduled Upcoming Calls
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
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-500/25 bg-gradient-to-r from-sky-950/20 via-[var(--card)] to-[var(--card)] p-5 transition-all duration-200 hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-950/20"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[10px] font-mono font-medium text-sky-400">
                      UPCOMING
                    </span>
                    <span className="text-xs font-mono text-[var(--muted-foreground)]">
                      {formatDisplayDate(meeting.date)}
                    </span>
                    <span className="text-xs font-mono text-[var(--muted-foreground)]">
                      • {meeting.duration}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] group-hover:text-sky-300 transition">
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
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--muted)] text-[10px] font-bold border-2 border-[var(--card)] text-[var(--foreground)]"
                        >
                          {p.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs font-medium text-sky-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono">
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] font-mono">
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
                className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                      AI READY
                    </span>
                    <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">
                      ⏱ {meeting.duration}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition line-clamp-1">
                    {meeting.title}
                  </h3>

                  {meeting.summary ? (
                    <div className="border-l-2 border-indigo-500/40 pl-3 py-0.5">
                      <p className="text-xs leading-relaxed text-[var(--muted-foreground)] line-clamp-2 italic">
                        "{meeting.summary}"
                      </p>
                    </div>
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
                          className="rounded-lg bg-[var(--muted)] border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--foreground)] truncate max-w-[220px]"
                        >
                          <span className="text-emerald-400 font-bold mr-1">✓</span> {d}
                        </span>
                      ))}
                      {meeting.decisions.length > 2 && (
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)] self-center">
                          +{meeting.decisions.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span>📅 {formatDisplayDate(meeting.date)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {meeting.openActionItemsCount !== undefined && meeting.openActionItemsCount > 0 && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-amber-400">
                        {meeting.openActionItemsCount} tasks open
                      </span>
                    )}
                    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono font-medium">
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
