"use client";

import { useState, useEffect } from "react";

interface EditorialPlayerProps {
  durationSec: number;
  currentTime: number;
  onTimeChange: (time: number | ((prev: number) => number)) => void;
  isUpcoming?: boolean;
}

function formatPlayerTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function EditorialPlayer({
  durationSec,
  currentTime,
  onTimeChange,
  isUpcoming = false,
}: EditorialPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);

  // Playback timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isUpcoming) {
      timer = setInterval(() => {
        onTimeChange(prev => {
          if (prev >= durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(durationSec, prev + 1 * speed);
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isUpcoming, durationSec, speed, onTimeChange]);

  const progressPercent = durationSec > 0 ? (currentTime / durationSec) * 100 : 0;

  if (isUpcoming) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center space-y-2 card-elevation">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-slate-900">Meeting Scheduled</h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          The interactive timeline and transcript playback will become active once this call concludes and recording is ingested.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 card-elevation space-y-4">
      {/* Simulation Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Timeline Scrubber & Playback
          </span>
        </div>
        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-mono text-amber-800 font-medium">
          Capture: Manual upload (playback simulated)
        </span>
      </div>

      {/* Scrubber and Times */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={durationSec}
            step={1}
            value={currentTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="text-slate-900 font-bold">{formatPlayerTime(currentTime)}</span>
          <span className="text-[11px] text-slate-400">
            {progressPercent.toFixed(0)}% elapsed
          </span>
          <span>{formatPlayerTime(durationSec)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTimeChange(Math.max(0, currentTime - 15))}
            className="inline-flex h-9 px-2.5 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono text-xs transition cursor-pointer"
            title="Rewind 15 seconds"
          >
            -15s
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 transition shadow-sm cursor-pointer"
          >
            {isPlaying ? (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Simulation
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTimeChange(Math.min(durationSec, currentTime + 15))}
            className="inline-flex h-9 px-2.5 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono text-xs transition cursor-pointer"
            title="Fast-forward 15 seconds"
          >
            +15s
          </button>
        </div>

        {/* Speed toggle */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500 mr-1">Speed:</span>
          {[1, 1.5, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                speed === s
                  ? "bg-teal-700 text-white font-semibold shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
