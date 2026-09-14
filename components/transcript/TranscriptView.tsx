"use client";

import { useState, useMemo } from "react";
import { TranscriptLine } from "@/lib/types";
import { formatTime } from "@/lib/utils/formatTime";

interface TranscriptViewProps {
  transcript: TranscriptLine[];
  currentTime?: number;
  onSeek?: (timestampSec: number) => void;
}

// Generate consistent speaker color based on name
const SPEAKER_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  "Sarah Chen": { bg: "bg-purple-950/40", text: "text-purple-300", ring: "ring-purple-500/30" },
  "Alex Rivera": { bg: "bg-blue-950/40", text: "text-blue-300", ring: "ring-blue-500/30" },
  "David Kim": { bg: "bg-emerald-950/40", text: "text-emerald-300", ring: "ring-emerald-500/30" },
  "Elena Rostova": { bg: "bg-amber-950/40", text: "text-amber-300", ring: "ring-amber-500/30" },
  "Marcus Vance": { bg: "bg-cyan-950/40", text: "text-cyan-300", ring: "ring-cyan-500/30" },
  "Priya Patel": { bg: "bg-rose-950/40", text: "text-rose-300", ring: "ring-rose-500/30" },
  "Rachel Zhao": { bg: "bg-teal-950/40", text: "text-teal-300", ring: "ring-teal-500/30" },
  "Jordan Taylor": { bg: "bg-orange-950/40", text: "text-orange-300", ring: "ring-orange-500/30" },
  "Liam Walker": { bg: "bg-indigo-950/40", text: "text-indigo-300", ring: "ring-indigo-500/30" },
  "Chloe Martin": { bg: "bg-fuchsia-950/40", text: "text-fuchsia-300", ring: "ring-fuchsia-500/30" },
  "Samir Mehta": { bg: "bg-lime-950/40", text: "text-lime-300", ring: "ring-lime-500/30" },
};

function getSpeakerColor(speaker: string) {
  if (SPEAKER_COLORS[speaker]) {
    return SPEAKER_COLORS[speaker];
  }
  // Fallback hashing
  return { bg: "bg-gray-800", text: "text-gray-300", ring: "ring-gray-600/30" };
}

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function TranscriptView({
  transcript,
  currentTime = 0,
  onSeek,
}: TranscriptViewProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const filteredLines = useMemo(() => {
    if (!filterQuery.trim()) return transcript;
    const lower = filterQuery.toLowerCase();
    return transcript.filter(
      (line) =>
        line.speaker.toLowerCase().includes(lower) ||
        line.text.toLowerCase().includes(lower)
    );
  }, [transcript, filterQuery]);

  // Find currently active line index based on currentTime
  const activeLineIndex = useMemo(() => {
    for (let i = transcript.length - 1; i >= 0; i--) {
      if (currentTime >= transcript[i].timestampSec) {
        return i;
      }
    }
    return -1;
  }, [transcript, currentTime]);

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-800 bg-gray-900/60 shadow-sm overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/80 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search transcript..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-700/80 bg-gray-950/70 pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {filterQuery && (
          <button
            onClick={() => setFilterQuery("")}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        )}
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {filteredLines.length} of {transcript.length} lines
        </span>
      </div>

      {/* Transcript Scroll Container */}
      <div className="flex-1 divide-y divide-gray-800/40 overflow-y-auto p-2 space-y-1">
        {filteredLines.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No transcript lines match &ldquo;{filterQuery}&rdquo;
          </div>
        ) : (
          filteredLines.map((line) => {
            const isCurrentActive =
              activeLineIndex >= 0 &&
              transcript[activeLineIndex]?.id === line.id;
            const speakerColor = getSpeakerColor(line.speaker);

            return (
              <div
                key={line.id}
                onClick={() => onSeek?.(line.timestampSec)}
                className={`group flex items-start gap-3 rounded-lg p-3 transition cursor-pointer ${
                  isCurrentActive
                    ? "bg-indigo-950/40 ring-1 ring-indigo-500/40"
                    : "hover:bg-gray-800/40"
                }`}
              >
                {/* Speaker Avatar & Initials */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 ${speakerColor.bg} ${speakerColor.text} ${speakerColor.ring}`}
                  title={line.speaker}
                >
                  {getInitials(line.speaker)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Speaker name + Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-300 group-hover:text-white">
                      {line.speaker}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek?.(line.timestampSec);
                      }}
                      className="font-mono text-[11px] font-medium text-gray-500 hover:text-indigo-400 group-hover:text-gray-400 px-1.5 py-0.5 rounded hover:bg-gray-800 transition"
                      title="Click to seek recording"
                    >
                      {formatTime(line.timestampSec)}
                    </button>
                  </div>

                  {/* Transcript line text */}
                  <p className="text-sm leading-relaxed text-gray-300 group-hover:text-gray-100">
                    {line.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
