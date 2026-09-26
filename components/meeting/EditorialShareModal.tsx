"use client";

import { useState } from "react";
import Link from "next/link";
import { Meeting, TranscriptLine } from "@/lib/supabase/types";

interface EditorialShareModalProps {
  meeting: Meeting;
  transcript: TranscriptLine[];
  preselectedLineId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditorialShareModal({
  meeting,
  transcript,
  preselectedLineId,
  isOpen,
  onClose,
}: EditorialShareModalProps) {
  const [startLineId, setStartLineId] = useState<string>(
    preselectedLineId || transcript[0]?.id || ""
  );
  const [endLineId, setEndLineId] = useState<string>(
    preselectedLineId || transcript[Math.min(3, transcript.length - 1)]?.id || ""
  );
  const [clipTitle, setClipTitle] = useState<string>(
    `${meeting.title} — Key Moment`
  );
  const [createdShareUrl, setCreatedShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateShare = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meeting.id,
          startLineId: startLineId || undefined,
          endLineId: endLineId || undefined,
          title: clipTitle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create share clip");
      }

      const data = await res.json();
      if (data.shareUrl) {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        setCreatedShareUrl(fullUrl);
      }
    } catch (err: any) {
      console.error("Share error:", err);
      setErrorMsg(err.message || "Failed to generate share clip.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdShareUrl) return;
    try {
      await navigator.clipboard.writeText(createdShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Share Bounded Transcript Window
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Honest sharing of dialogue slices without video rendering
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {!createdShareUrl ? (
          <div className="space-y-4">
            {/* Clip Title */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Clip Title / Topic
              </label>
              <input
                type="text"
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Start Line and End Line Selectors */}
            {transcript.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    Start Line
                  </label>
                  <select
                    value={startLineId}
                    onChange={(e) => setStartLineId(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs text-[var(--foreground)] focus:outline-none cursor-pointer"
                  >
                    {transcript.map((l) => (
                      <option key={l.id} value={l.id}>
                        [{l.timestamp}] {l.speaker}: {l.text.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    End Line
                  </label>
                  <select
                    value={endLineId}
                    onChange={(e) => setEndLineId(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs text-[var(--foreground)] focus:outline-none cursor-pointer"
                  >
                    {transcript.map((l) => (
                      <option key={l.id} value={l.id}>
                        [{l.timestamp}] {l.speaker}: {l.text.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] italic">
                No transcript lines available to bound.
              </p>
            )}

            {/* Privacy Assurance Banner */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Zero-Leak Privacy Enforced
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Only the selected transcript moment and high-level meeting overview are readable by signed-out visitors. Internal action items are strictly withheld.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl border border-[var(--border)] text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating || transcript.length === 0}
                onClick={handleCreateShare}
                className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 disabled:opacity-50 transition shadow-sm"
              >
                {isGenerating ? "Generating..." : "Generate Public Link"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ Public Share Link Ready
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdShareUrl}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-mono text-[var(--foreground)] select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="h-8 px-3 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 transition shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedShareUrl(null);
                }}
                className="text-xs text-[var(--muted-foreground)] hover:underline"
              >
                ← Create another clip
              </button>
              <div className="flex items-center gap-2">
                <Link
                  href={createdShareUrl.replace(window.location.origin, "")}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition"
                >
                  Open Public View ↗
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium hover:opacity-90 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
