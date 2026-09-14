"use client";

import { useState } from "react";
import Link from "next/link";
import { Meeting, ShareClip } from "@/lib/types";
import { formatDate, formatDuration, formatTime } from "@/lib/utils/formatTime";

interface PublicClipClientProps {
  clip: ShareClip;
  meeting: Meeting;
}

export default function PublicClipClient({ clip, meeting }: PublicClipClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter transcript lines that fall within or overlap the clip window
  const clipLines = meeting.transcript.filter(
    (line) => line.timestampSec >= clip.startSec - 10 && line.timestampSec <= clip.endSec + 10
  );

  const clipDuration = Math.max(1, clip.endSec - clip.startSec);

  const handleCopy = async () => {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Public Share Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-900/40 bg-indigo-950/20 px-4 py-3 text-xs text-indigo-300">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Public Meeting Excerpt</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300">Shared via Fathom (No Login Required)</span>
        </div>

        <button
          onClick={handleCopy}
          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 transition shadow"
        >
          {copied ? "Link Copied! ✓" : "Copy Link"}
        </button>
      </div>

      {/* Meeting Header */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Meeting Clip
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mt-0.5">
              {meeting.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/meetings/${meeting.id}`}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-700 hover:text-white transition"
            >
              View Full Recording →
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
          <span>{formatDate(meeting.date)}</span>
          <span>•</span>
          <span>Clip duration: {formatDuration(clipDuration)}</span>
          <span>•</span>
          <span>
            Window: {formatTime(clip.startSec)} &ndash; {formatTime(clip.endSec)}
          </span>
          <span>•</span>
          <span>Participants: {meeting.participants.join(", ")}</span>
        </div>
      </div>

      {/* Simulated Video Player for Clip */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 space-y-4 shadow-xl">
        <div className="relative flex h-64 w-full items-center justify-center rounded-lg bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950/50 border border-gray-800 overflow-hidden">
          <div className="text-center px-4 space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-200">
              Playing Verified Clip: &ldquo;{clip.token}&rdquo;
            </p>
            <p className="text-xs text-gray-400 font-mono">
              {formatTime(clip.startSec)} / {formatTime(clip.endSec)}
            </p>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label="Toggle clip playback"
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:scale-105 transition">
              {isPlaying ? (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-mono text-indigo-300">Clip Start: {formatTime(clip.startSec)}</span>
          <span className="font-mono text-indigo-300">Clip End: {formatTime(clip.endSec)}</span>
        </div>
      </div>

      {/* Shared Transcript Excerpt */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
            Transcript for this Clip
          </h2>
          <span className="text-xs text-gray-500">
            {clipLines.length} spoken dialogue lines
          </span>
        </div>

        <div className="space-y-3">
          {clipLines.map((line) => (
            <div
              key={line.id}
              className="flex items-start gap-3 rounded-lg bg-gray-950/50 border border-gray-800/80 p-3.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950/60 text-indigo-300 ring-1 ring-indigo-500/30 text-xs font-semibold">
                {line.speaker.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-200">{line.speaker}</span>
                  <span className="font-mono text-[11px] text-gray-500">{formatTime(line.timestampSec)}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{line.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting Context Card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Meeting Context & Overview
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          {meeting.summary.overview}
        </p>

        <div className="pt-2">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            Decisions Finalized
          </span>
          <ul className="space-y-1">
            {meeting.summary.decisions.map((dec, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{dec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
