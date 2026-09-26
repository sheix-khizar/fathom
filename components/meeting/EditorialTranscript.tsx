"use client";

import { useState, useMemo } from "react";
import { TranscriptLine } from "@/lib/supabase/types";

interface EditorialTranscriptProps {
  transcript: TranscriptLine[];
  currentTime: number;
  onSeek: (offsetSec: number) => void;
  onShareMoment: (line: TranscriptLine) => void;
  isUpcoming?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function EditorialTranscript({
  transcript,
  currentTime,
  onSeek,
  onShareMoment,
  isUpcoming = false,
}: EditorialTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return transcript;
    const q = searchQuery.toLowerCase();
    return transcript.filter(
      l => l.speaker.toLowerCase().includes(q) || l.text.toLowerCase().includes(q)
    );
  }, [transcript, searchQuery]);

  if (isUpcoming || transcript.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-[var(--foreground)]">No Transcript Recorded</h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
          {isUpcoming
            ? 'This meeting has not occurred yet. Transcript lines with synchronized timestamps will populate automatically upon recording ingest.'
            : 'No transcript lines are recorded for this session.'}
        </p>
      </div>
    );
  }

  // Find the active line based on currentTime
  let activeIndex = -1;
  for (let i = 0; i < transcript.length; i++) {
    if (transcript[i].offset_seconds <= currentTime) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-4">
      {/* Transcript Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search dialogue or speaker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          )}
        </div>
        <div className="text-xs font-mono text-[var(--muted-foreground)]">
          {filteredLines.length} of {transcript.length} lines
        </div>
      </div>

      {/* Transcript Dialogue List */}
      <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
        {filteredLines.map((line) => {
          const isActive = activeIndex >= 0 && transcript[activeIndex]?.id === line.id;
          return (
            <div
              key={line.id}
              className={`group flex items-start gap-4 p-4 transition ${
                isActive
                  ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-l-4 border-l-indigo-600"
                  : "hover:bg-[var(--muted)]/40"
              }`}
            >
              {/* Speaker Avatar & Timestamp */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs font-semibold">
                  {getInitials(line.speaker)}
                </span>
                <button
                  type="button"
                  onClick={() => onSeek(line.offset_seconds)}
                  className="rounded px-1.5 py-0.5 font-mono text-[11px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition cursor-pointer"
                  title="Click to seek scrubber to this moment"
                >
                  {line.timestamp}
                </button>
              </div>

              {/* Speaker Dialogue */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {line.speaker}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onShareMoment(line)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Moment
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--foreground)] select-text">
                  {line.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
