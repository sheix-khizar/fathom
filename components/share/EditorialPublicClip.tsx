"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Meeting, ShareClip, TranscriptLine } from "@/lib/supabase/types";

interface EditorialPublicClipProps {
  clip: ShareClip;
  meeting: Meeting;
  transcript: TranscriptLine[];
}

function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDurationSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function EditorialPublicClip({
  clip,
  meeting,
  transcript,
}: EditorialPublicClipProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine duration of bounded transcript window
  const startOffset = transcript[0]?.offset_seconds ?? 0;
  const endOffset = transcript[transcript.length - 1]?.offset_seconds ?? (startOffset + 60);
  const clipDurationSec = Math.max(10, endOffset - startOffset + 5);

  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  // Playback timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= clipDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, clipDurationSec]);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const progressPercent =
    clipDurationSec > 0 ? (currentTimeSec / clipDurationSec) * 100 : 0;

  // Active line calculation
  const currentAbsoluteOffset = startOffset + currentTimeSec;
  const activeLineIndex = transcript.findIndex(
    (line, idx) =>
      currentAbsoluteOffset >= line.offset_seconds &&
      (idx === transcript.length - 1 ||
        currentAbsoluteOffset < transcript[idx + 1].offset_seconds)
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 px-4 sm:px-6 animate-fadeIn">
      {/* Top Banner: Public Share & Zero Login */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-50 via-white to-white p-4 sm:p-5 card-elevation">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          <span className="rounded-full bg-teal-100 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-teal-800 uppercase tracking-wide">
            Public Excerpt
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs text-slate-700 font-medium hidden sm:inline">
            Zero-Leak Moment • No Sign-In Required
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 hover:bg-slate-100 transition cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link Copied!
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 h-8 px-3.5 rounded-xl bg-teal-700 text-xs font-semibold text-white hover:bg-teal-800 transition shadow-sm"
          >
            Launch Fathom →
          </Link>
        </div>
      </div>

      {/* Meeting & Clip Title Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 card-elevation">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-teal-800 uppercase tracking-wide">
              Shared Dialogue Window
            </span>
            <span className="text-xs font-mono text-slate-500">
              Token: {clip.token}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {clip.title || `${meeting.title} (Key Moment)`}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600">
            Excerpt from session: <strong className="text-slate-900">{meeting.title}</strong>
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-mono">{formatDisplayDate(meeting.date)}</span>
          <span>•</span>
          <span className="font-mono text-teal-800 font-semibold">
            Window: {clip.start_time || transcript[0]?.timestamp || "00:00"} &ndash;{" "}
            {clip.end_time || transcript[transcript.length - 1]?.timestamp || "End"}
          </span>
          <span>•</span>
          <span className="font-mono">{transcript.length} dialogue turns</span>
          {meeting.participants && meeting.participants.length > 0 && (
            <>
              <span>•</span>
              <span>{meeting.participants.join(", ")}</span>
            </>
          )}
        </div>
      </div>

      {/* Bounded Clip Player (Simulated Scrubber) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 card-elevation">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-900">
              Synchronized Clip Scrubber
            </span>
          </div>
          <span className="font-mono text-xs text-slate-500">
            {formatDurationSeconds(currentTimeSec)} / {formatDurationSeconds(clipDurationSec)}
          </span>
        </div>

        {/* Interactive Scrub Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            setCurrentTimeSec(Math.min(clipDurationSec, Math.max(0, Math.floor(pos * clipDurationSec))));
          }}
          className="relative h-2 w-full cursor-pointer rounded-full bg-slate-200 overflow-hidden"
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-teal-700 transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-teal-700 text-xs font-semibold text-white hover:bg-teal-800 transition shadow-sm cursor-pointer"
          >
            {isPlaying ? (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause Moment
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Moment
              </>
            )}
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Synchronized to transcript slice
          </span>
        </div>
      </div>

      {/* Bounded Transcript Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 card-elevation">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bounded Dialogue Window
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Only dialogue turns within this bounded moment are revealed to external visitors.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-mono text-slate-600">
            {transcript.length} turns in window
          </span>
        </div>

        {transcript.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No dialogue lines captured in this clip range.
          </div>
        ) : (
          <div className="space-y-3">
            {transcript.map((line, idx) => {
              const isActive = idx === activeLineIndex;

              return (
                <div
                  key={line.id}
                  className={`flex items-start gap-4 rounded-2xl p-4 sm:p-5 transition-all duration-150 border ${
                    isActive
                      ? "border-teal-500 bg-teal-50/70 shadow-sm"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isActive
                        ? "bg-teal-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {line.speaker.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {line.speaker}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {line.timestamp}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-800">
                      {line.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Boundary Notice */}
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 text-xs space-y-1 text-center">
          <p className="text-[11px] text-teal-800 font-mono">
            🔒 <strong>Boundary Notice:</strong> Dialogue outside this window and confidential internal action items are withheld under Supabase Row Level Security.
          </p>
        </div>
      </div>

      {/* Meeting Context & Overview Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 card-elevation">
        <div className="space-y-1 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-teal-800 uppercase tracking-wide">
              AI SYNTHESIS
            </span>
            <span className="text-xs font-mono text-slate-500">Gemini Executive Intelligence</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Meeting Context & Executive Summary
          </h3>
        </div>

        {meeting.summary ? (
          <div className="border-l-2 border-teal-600 pl-4 py-1">
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed italic">
              &ldquo;{meeting.summary}&rdquo;
            </p>
          </div>
        ) : (
          <p className="text-xs italic text-slate-500">
            No summary generated for this meeting.
          </p>
        )}

        {/* Decisions finalized */}
        {meeting.decisions && meeting.decisions.length > 0 && (
          <div className="pt-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block">
              Agreed Decisions & Commitments
            </span>
            <ul className="space-y-2.5">
              {meeting.decisions.map((dec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs sm:text-sm text-slate-800"
                >
                  <span className="text-teal-700 font-bold shrink-0">✓</span>
                  <span>{dec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
