"use client";

import { useState } from "react";
import Link from "next/link";
import { Meeting, ShareClip } from "@/lib/types";
import { formatTime } from "@/lib/utils/formatTime";

interface ShareModalProps {
  meeting: Meeting;
  existingClips: ShareClip[];
  currentTime: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({
  meeting,
  existingClips,
  currentTime,
  isOpen,
  onClose,
}: ShareModalProps) {
  const [selectedClipToken, setSelectedClipToken] = useState<string>(
    existingClips[0]?.token || `${meeting.id}-highlight`
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${currentOrigin}/share/${selectedClipToken}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Share Meeting Clip
              </h3>
              <p className="text-xs text-gray-400">
                Public link • No login or sign-in required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Clip Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
            Select Clip or Highlight
          </label>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {existingClips.map((clip) => (
              <div
                key={clip.id}
                onClick={() => setSelectedClipToken(clip.token)}
                className={`flex items-center justify-between rounded-lg border p-3 transition cursor-pointer ${
                  selectedClipToken === clip.token
                    ? "border-indigo-500 bg-indigo-950/20 text-white ring-1 ring-indigo-500/30"
                    : "border-gray-800 bg-gray-950/50 text-gray-300 hover:border-gray-700"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold font-mono text-indigo-300">
                    {clip.token}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Timestamp window: {formatTime(clip.startSec)} &ndash; {formatTime(clip.endSec)}
                  </p>
                </div>

                <span className="text-xs font-medium text-gray-400">
                  {Math.round(clip.endSec - clip.startSec)}s duration
                </span>
              </div>
            ))}

            {/* Current Position Quick Clip Option */}
            <div
              onClick={() => setSelectedClipToken(existingClips[0]?.token || `${meeting.id}-highlight`)}
              className={`flex items-center justify-between rounded-lg border p-3 transition cursor-pointer ${
                !existingClips.some((c) => c.token === selectedClipToken)
                  ? "border-indigo-500 bg-indigo-950/20 text-white ring-1 ring-indigo-500/30"
                  : "border-gray-800 bg-gray-950/50 text-gray-300 hover:border-gray-700"
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-gray-200">
                  Current Player Moment
                </p>
                <p className="text-[11px] text-gray-500">
                  Around {formatTime(currentTime)} ({formatTime(Math.max(0, currentTime - 15))} &ndash; {formatTime(currentTime + 45)})
                </p>
              </div>

              <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400 font-mono">
                ~60s clip
              </span>
            </div>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
            Public Share URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
            >
              {copied ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            Anyone with this link can watch this excerpt and read the transcript snippet without an account.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <Link
            href={`/share/${selectedClipToken}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            Open public page in new tab ↗
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-800 bg-gray-800/80 px-4 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
