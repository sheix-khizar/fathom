"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils/formatTime";

interface PlayerProps {
  durationSec: number;
  currentTime: number;
  onTimeChange: (time: number | ((prevTime: number) => number)) => void;
  title: string;
}

export default function Player({
  durationSec,
  currentTime,
  onTimeChange,
  title,
}: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onTimeChange((prevTime: number) => {
          if (prevTime >= durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(durationSec, prevTime + 1 * playbackRate);
        });
      }, 1000 / playbackRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackRate, durationSec, onTimeChange]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onTimeChange(newTime);
  };

  const skipSeconds = (seconds: number) => {
    onTimeChange(Math.max(0, Math.min(durationSec, currentTime + seconds)));
  };

  const progressPercent = durationSec > 0 ? (currentTime / durationSec) * 100 : 0;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-4 shadow-xl backdrop-blur">
      {/* Video / Visualizer Preview Screen */}
      <div className="relative mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950/40 border border-gray-800">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
              Fathom Meeting Recording
            </p>
            <p className="text-sm font-semibold text-gray-200 line-clamp-1 mt-0.5">
              {title}
            </p>
          </div>
          {isPlaying && (
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-medium text-emerald-400">Playing synced audio/video</span>
            </div>
          )}
        </div>

        {/* Big play overlay button if paused */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            aria-label="Play recording"
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/20"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:scale-105 hover:bg-indigo-500">
              <svg className="h-6 w-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="group relative flex items-center mb-3">
        <input
          type="range"
          min={0}
          max={durationSec}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Seek time slider"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-indigo-500 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #6366f1 ${progressPercent}%, #374151 ${progressPercent}%)`,
          }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Play / Skip Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-200 transition hover:bg-gray-700 hover:text-white"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => skipSeconds(-15)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
            title="Rewind 15s"
          >
            <span className="text-[10px] font-bold">-15s</span>
          </button>

          <button
            onClick={() => skipSeconds(15)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
            title="Forward 15s"
          >
            <span className="text-[10px] font-bold">+15s</span>
          </button>

          {/* Time Counter */}
          <div className="ml-2 font-mono text-xs text-gray-400">
            <span className="font-semibold text-gray-200">{formatTime(currentTime)}</span>
            <span className="mx-1 text-gray-600">/</span>
            <span>{formatTime(durationSec)}</span>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500 mr-1 text-[11px]">Speed:</span>
          {[1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition ${
                playbackRate === rate
                  ? "bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/40"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
