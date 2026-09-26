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

function getSpeakerColor(speaker: string): { bg: string; text: string; ring: string } {
  const s = speaker.toLowerCase();
  if (s.includes("alex") || s.includes("sarah") || s.includes("lead")) {
    return { bg: "bg-teal-100", text: "text-teal-800", ring: "ring-teal-200" };
  }
  if (s.includes("elena") || s.includes("maria") || s.includes("design")) {
    return { bg: "bg-purple-100", text: "text-purple-800", ring: "ring-purple-200" };
  }
  if (s.includes("david") || s.includes("marcus") || s.includes("eng")) {
    return { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200" };
  }
  return { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200" };
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
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3 card-elevation">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Transcript Recorded</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
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
    <div className="space-y-4 animate-fadeIn">
      {/* Transcript Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 card-elevation">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search dialogue text or speaker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
        <div className="text-xs font-mono text-slate-500 px-2">
          {filteredLines.length} of {transcript.length} lines
        </div>
      </div>

      {/* Transcript Dialogue List */}
      <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white overflow-hidden card-elevation">
        {filteredLines.map((line) => {
          const isActive = activeIndex >= 0 && transcript[activeIndex]?.id === line.id;
          const speakerColor = getSpeakerColor(line.speaker);

          return (
            <div
              key={line.id}
              className={`group flex items-start gap-4 p-4 sm:p-5 transition-all duration-150 ${
                isActive
                  ? "bg-teal-50/70 border-l-4 border-l-teal-700 shadow-sm"
                  : "hover:bg-slate-50/70 border-l-4 border-l-transparent"
              }`}
            >
              {/* Speaker Avatar & Timestamp */}
              <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ring-1 ${speakerColor.bg} ${speakerColor.text} ${speakerColor.ring}`}>
                  {getInitials(line.speaker)}
                </span>
                <button
                  type="button"
                  onClick={() => onSeek(line.offset_seconds)}
                  className="rounded-lg px-2 py-0.5 font-mono text-[11px] text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition cursor-pointer border border-transparent hover:border-teal-200"
                  title="Click to seek scrubber to this timestamp"
                >
                  {line.timestamp}
                </button>
              </div>

              {/* Speaker Dialogue */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {line.speaker}
                    </span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                    )}
                  </div>

                  <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onShareMoment(line)}
                      className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition cursor-pointer"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Moment
                    </button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-800 select-text">
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
