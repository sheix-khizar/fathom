"use client";

import { useState } from "react";
import Link from "next/link";
import { Meeting, TranscriptLine, ActionItem } from "@/lib/supabase/types";
import EditorialPlayer from "./EditorialPlayer";
import EditorialOverview from "./EditorialOverview";
import EditorialTranscript from "./EditorialTranscript";
import EditorialActionItems from "./EditorialActionItems";
import EditorialShareModal from "./EditorialShareModal";

interface MeetingDetailV2Props {
  meeting: Meeting;
  transcript: TranscriptLine[];
  actionItems: ActionItem[];
  initialTime?: number;
}

type TabType = "overview" | "transcript" | "actions";

function parseDurationSeconds(durationStr: string, transcript: TranscriptLine[]): number {
  if (transcript.length > 0) {
    const lastOffset = transcript[transcript.length - 1].offset_seconds;
    if (lastOffset > 0) return lastOffset + 30;
  }
  const match = durationStr.match(/(\d+)\s*m/i);
  if (match) {
    return parseInt(match[1], 10) * 60;
  }
  return 1800; // default 30 min
}

function formatMeetingDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function MeetingDetailV2({
  meeting,
  transcript,
  actionItems,
  initialTime = 0,
}: MeetingDetailV2Props) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTime > 0 ? "transcript" : "overview");
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [preselectedShareLineId, setPreselectedShareLineId] = useState<string | null>(null);

  const durationSec = parseDurationSeconds(meeting.duration, transcript);
  const isUpcoming = meeting.status === "upcoming";

  const handleShareMoment = (line: TranscriptLine) => {
    setPreselectedShareLineId(line.id);
    setIsShareModalOpen(true);
  };

  const handleHeaderShareClick = () => {
    setPreselectedShareLineId(null);
    setIsShareModalOpen(true);
  };

  const openActionItemsCount = actionItems.filter(i => !i.completed).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 px-4 sm:px-6">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
        >
          ← All Meetings
        </Link>

        <div className="flex items-center gap-2">
          {!isUpcoming && (
            <button
              type="button"
              onClick={handleHeaderShareClick}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition shadow-sm cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Moment
            </button>
          )}

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium ${
              isUpcoming
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isUpcoming ? "bg-blue-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            {isUpcoming ? "UPCOMING" : "AI READY"}
          </span>
        </div>
      </div>

      {/* Meeting Header */}
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-serif md:font-sans">
            {meeting.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[var(--muted-foreground)]">
            <span>📅 {formatMeetingDate(meeting.date)}</span>
            <span>⏱ {meeting.duration}</span>
            <span>💬 {transcript.length} dialogue turns</span>
          </div>
        </div>

        {/* Participants Chips */}
        {meeting.participants && meeting.participants.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-[var(--muted-foreground)] mr-1">Attendees:</span>
            {meeting.participants.map((person, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 text-xs text-[var(--foreground)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {person}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Simulation / Timeline Scrubber */}
      <EditorialPlayer
        durationSec={durationSec}
        currentTime={currentTime}
        onTimeChange={setCurrentTime}
        isUpcoming={isUpcoming}
      />

      {/* Editorial Navigation Tabs */}
      <div className="flex border-b border-[var(--border)] text-sm font-medium gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-[var(--foreground)] text-[var(--foreground)] font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <span>Executive Overview</span>
          {meeting.decisions && meeting.decisions.length > 0 && (
            <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-mono text-[var(--muted-foreground)]">
              {meeting.decisions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transcript")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === "transcript"
              ? "border-[var(--foreground)] text-[var(--foreground)] font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <span>Synced Transcript</span>
          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-mono text-[var(--muted-foreground)]">
            {transcript.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("actions")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === "actions"
              ? "border-[var(--foreground)] text-[var(--foreground)] font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <span>Action Items</span>
          {actionItems.length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium ${
                openActionItemsCount > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {openActionItemsCount} open
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "overview" && <EditorialOverview meeting={meeting} />}
        {activeTab === "transcript" && (
          <EditorialTranscript
            transcript={transcript}
            currentTime={currentTime}
            onSeek={setCurrentTime}
            onShareMoment={handleShareMoment}
            isUpcoming={isUpcoming}
          />
        )}
        {activeTab === "actions" && (
          <EditorialActionItems
            meetingId={meeting.id}
            initialItems={actionItems}
            participants={meeting.participants || []}
          />
        )}
      </div>

      {/* Share Modal */}
      <EditorialShareModal
        meeting={meeting}
        transcript={transcript}
        preselectedLineId={preselectedShareLineId}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setPreselectedShareLineId(null);
        }}
      />
    </div>
  );
}
