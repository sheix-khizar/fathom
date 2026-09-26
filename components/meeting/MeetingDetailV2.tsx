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

function parseDurationSeconds(durationStr: string): number {
  if (!durationStr) return 0;
  const match = durationStr.match(/(\d+)\s*(?:m|min)/i);
  if (match) {
    return parseInt(match[1], 10) * 60;
  }
  const parts = durationStr.split(":").map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 1800; // 30 mins fallback
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
  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "actions">(
    initialTime > 0 ? "transcript" : "overview"
  );
  const [currentTime, setCurrentTime] = useState(initialTime);

  // Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLineId, setShareLineId] = useState<string | null>(null);

  const durationSec = parseDurationSeconds(meeting.duration);
  const isUpcoming = meeting.status === "upcoming";
  const openActionItemsCount = actionItems.filter(i => !i.completed).length;

  const handleOpenShare = (line?: TranscriptLine) => {
    setShareLineId(line ? line.id : null);
    setIsShareModalOpen(true);
  };

  const handleHeaderShareClick = () => {
    setShareLineId(transcript[0]?.id || null);
    setIsShareModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 px-4 sm:px-6">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 transition"
        >
          ← All Meetings
        </Link>

        <div className="flex items-center gap-2">
          {!isUpcoming && (
            <button
              type="button"
              onClick={handleHeaderShareClick}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Moment
            </button>
          )}

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium ${
              isUpcoming
                ? "bg-sky-50 text-sky-800 border border-sky-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isUpcoming ? "bg-sky-500 animate-pulse" : "bg-emerald-600"
              }`}
            />
            {isUpcoming ? "UPCOMING" : "AI READY"}
          </span>
        </div>
      </div>

      {/* Meeting Header */}
      <header className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-teal-800 uppercase tracking-wide">
              Meeting Intelligence Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {meeting.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-slate-500 pt-1">
            <span className="inline-flex items-center gap-1.5">📅 {formatMeetingDate(meeting.date)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">⏱ {meeting.duration}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-teal-800 font-medium">💬 {transcript.length} dialogue turns</span>
          </div>
        </div>

        {/* Participants Chips */}
        {meeting.participants && meeting.participants.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-mono text-slate-500 mr-1">Attendees:</span>
            {meeting.participants.map((person, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-800 font-medium shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
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
      <div className="flex overflow-x-auto scrollbar-none border-b border-slate-200 text-xs sm:text-sm font-medium gap-2 sm:gap-4 whitespace-nowrap pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3.5 px-3 border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer font-medium ${
            activeTab === "overview"
              ? "border-teal-700 text-teal-900 font-bold text-sm"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <span>Executive Overview</span>
          {meeting.decisions && meeting.decisions.length > 0 && (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-800">
              {meeting.decisions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transcript")}
          className={`pb-3.5 px-3 border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer font-medium ${
            activeTab === "transcript"
              ? "border-teal-700 text-teal-900 font-bold text-sm"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <span>Synced Transcript</span>
          <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-mono font-semibold text-teal-800">
            {transcript.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("actions")}
          className={`pb-3.5 px-3 border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer font-medium ${
            activeTab === "actions"
              ? "border-teal-700 text-teal-900 font-bold text-sm"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <span>Action Items</span>
          {actionItems.length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-semibold ${
                openActionItemsCount > 0
                  ? "bg-amber-50 border border-amber-200 text-amber-800"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-800"
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
            onShareMoment={handleOpenShare}
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

      {/* Share Modal Dialog */}
      <EditorialShareModal
        meeting={meeting}
        transcript={transcript}
        preselectedLineId={shareLineId}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
