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
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-mono font-medium text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Supabase Backend
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-mono font-medium text-teal-800 border border-teal-200">
                ✨ Gemini 3.8 Ingest
              </span>
              <span className="rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-amber-800">
                v2 · beta
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Meeting Intelligence Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Synchronized dialogue diarization, Gemini executive summaries, decision tracking, and zero-leak public moment sharing.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Transcripts
            </Link>
            <AddMeetingButton />
          </div>
        </div>

        {/* Workspace Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-teal-300 hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Total Sessions</span>
              <span className="h-2 w-2 rounded-full bg-teal-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{initialMeetings.length}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Stored in Supabase</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-emerald-300 hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">AI Syntheses</span>
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">{pastMeetings.length}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Transcripts processed</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-sky-300 hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Scheduled</span>
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-sky-700 font-mono">{upcomingMeetings.length}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Pending call ingest</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-amber-300 hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Open Deliverables</span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700 font-mono">{totalOpenActionItems}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{totalDecisionsCount} decisions agreed</span>
          </div>
        </div>
      </section>

      {/* Quick Search Entry Point */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center shadow-sm rounded-2xl">
          <span className="absolute left-4 text-slate-400 pointer-events-none">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search across meeting titles, AI summaries, or press Enter for full dialogue search..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-28 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition shadow-sm"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <button
              type="submit"
              className="h-8 px-4 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition shadow-sm cursor-pointer"
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
                    <span className="text-xs font-mono text-slate-500">
                      {formatDisplayDate(meeting.date)}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
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

      {/* Section 2: Recent / Past Synthesized Meetings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Synthesized Meetings & Intelligence
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredPastMeetings.length} of {pastMeetings.length} calls
          </span>
        </div>

        {filteredPastMeetings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900">No matching meetings found</p>
            <p className="text-xs text-slate-500">
              {searchQuery ? `No recorded meetings match "${searchQuery}".` : 'No past meetings recorded.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPastMeetings.map((meeting) => (
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

                  {/* Decisions badges preview */}
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
