"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface UploadMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadState = "idle" | "uploading" | "processing" | "done" | "error";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export default function UploadMeetingModal({
  isOpen,
  onClose,
}: UploadMeetingModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(
          1
        )}MB) exceeds the 25MB maximum limit. Please select a smaller recording.`
      );
      setSelectedFile(null);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    if (!title.trim()) {
      // Suggest title from filename
      const nameWithoutExt = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setTitle(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File size exceeds 25MB limit. Please upload a recording smaller than 25MB.`
      );
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    if (!title.trim()) {
      const nameWithoutExt = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select an audio or video file to upload.");
      return;
    }

    setErrorMessage(null);
    setState("uploading");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (title.trim()) {
        formData.append("title", title.trim());
      }

      // Simulate step transition from uploading to processing
      // In fetch, the request stream uploads first then waits on response (Gemini call)
      const uploadTimeout = setTimeout(() => {
        setState("processing");
      }, 1200);

      const res = await fetch("/api/meetings/upload", {
        method: "POST",
        body: formData,
      });

      clearTimeout(uploadTimeout);

      if (!res.ok) {
        if (res.status === 504) {
          throw new Error(
            "The upload gateway timed out while processing audio. Please try with a shorter recording clip (under 2 minutes) or try again."
          );
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Upload failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      setState("done");

      // Short delay so the user sees the confirmation copy before redirect
      setTimeout(() => {
        router.push(`/meetings/${data.id}`);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred while processing the recording."
      );
      setState("error");
    }
  };

  const resetForm = () => {
    setState("idle");
    setSelectedFile(null);
    setTitle("");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (state === "uploading" || state === "processing") {
      // Disallow accidental closing during critical API ingestion
      return;
    }
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                Ingest Recording
              </span>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">
                • Max 25MB
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Add Meeting Recording
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Upload an audio or video file. Gemini will transcribe speech, extract key decisions, and synthesize action items.
            </p>
          </div>

          {state !== "uploading" && state !== "processing" && (
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition"
              title="Close modal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* State 1: IDLE */}
        {state === "idle" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
                selectedFile
                  ? "border-indigo-500 bg-indigo-500/5"
                  : "border-[var(--border)] hover:border-indigo-400 bg-[var(--background)]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.mp4,.mov"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 mb-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingest
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--foreground)]">
                    Click to browse or drag recording here
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    MP3, M4A, WAV, MP4, WebM (up to 25MB)
                  </p>
                </div>
              )}
            </div>

            {/* Optional Title input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--foreground)]">
                Meeting Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Architecture Review & Sprint Planning"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-600/20"
              >
                Transcribe & Process Recording →
              </button>
            </div>
          </form>
        )}

        {/* State 2: UPLOADING */}
        {state === "uploading" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <span className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Uploading recording to secure storage...
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Transferring {selectedFile?.name} to private Supabase Storage bucket.
              </p>
            </div>
          </div>
        )}

        {/* State 3: PROCESSING */}
        {state === "processing" && (
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500 animate-pulse">
              <svg className="h-6 w-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Transcribing your recording and extracting intelligence with Gemini...
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
                Analyzing audio tracks, labeling speakers, and distilling executive summary, decisions, and action items. This typically takes 10–30 seconds.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-[11px] font-mono text-[var(--muted-foreground)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini pipeline active
            </div>
          </div>
        )}

        {/* State 4: DONE */}
        {state === "done" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Meeting Transcribed & Synthesized Successfully!
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Redirecting you to the meeting detail view...
              </p>
            </div>
          </div>
        )}

        {/* State 5: ERROR */}
        {state === "error" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="text-xs font-semibold">Processing Failed</h4>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {errorMessage || "Failed to process the recording."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-[var(--muted)] px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition"
              >
                Choose Another File
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
