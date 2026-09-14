"use client";

import { useState } from "react";
import Link from "next/link";
import { Meeting } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/utils/formatTime";
import Player from "@/components/meeting/Player";
import SummaryPanel from "@/components/meeting/SummaryPanel";
import ActionItemList from "@/components/meeting/ActionItemList";
import TranscriptView from "@/components/transcript/TranscriptView";
import ShareModal from "@/components/share/ShareModal";
import { getClipsForMeeting } from "@/lib/data/meetings";

interface MeetingDetailClientProps {
  meeting: Meeting;
  initialTime?: number;
}

type TabType = "split" | "overview" | "transcript" | "actions";

export default function MeetingDetailClient({
  meeting,
  initialTime = 0,
}: MeetingDetailClientProps) {
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [activeTab, setActiveTab] = useState<TabType>(initialTime > 0 ? "transcript" : "split");
  const [isShareOpen, setIsShareOpen] = useState(false);

  const existingClips = getClipsForMeeting(meeting.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Meetings
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Clip
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI Ready
          </span>
        </div>
      </div>

      {/* Share Clip Modal */}
      <ShareModal
        meeting={meeting}
        existingClips={existingClips}
        currentTime={currentTime}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Meeting Header */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {meeting.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(meeting.date)}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(meeting.durationSec)}
              </span>
              <span>•</span>
              <span>{meeting.transcript.length} transcript lines</span>
              <span>•</span>
              <span>{meeting.actionItems.length} action items</span>
            </div>
          </div>

          {/* Participants Badges */}
          <div className="flex flex-col md:items-end gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Participants ({meeting.participants.length})
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {meeting.participants.map((person) => (
                <span
                  key={person}
                  className="inline-flex items-center rounded-md bg-gray-800/80 px-2 py-1 text-xs text-gray-300 ring-1 ring-gray-700/50"
                >
                  {person}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Video/Player + Tab Controls */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Top Column: Player */}
        <div className="lg:col-span-5 space-y-6">
          <Player
            durationSec={meeting.durationSec}
            currentTime={currentTime}
            onTimeChange={(val) => {
              if (typeof val === "function") {
                setCurrentTime(val);
              } else {
                setCurrentTime(val);
              }
            }}
            title={meeting.title}
          />

          {/* Action Items Mini Widget in Left Column on Split View */}
          {activeTab === "split" && (
            <ActionItemList initialItems={meeting.actionItems} />
          )}
        </div>

        {/* Right / Main Column: Tabs and Panes */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("split")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "split"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setActiveTab("overview")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                AI Summary
              </button>
              <button
                onClick={() => setActiveTab("transcript")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "transcript"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                Transcript
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "actions"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                Action Items ({meeting.actionItems.length})
              </button>
            </div>

            <span className="text-[11px] text-gray-500 hidden sm:inline">
              Click any transcript timestamp to seek
            </span>
          </div>

          {/* Tab Views */}
          {activeTab === "split" && (
            <div className="space-y-6">
              <SummaryPanel summary={meeting.summary} />
              <div className="h-[460px]">
                <TranscriptView
                  transcript={meeting.transcript}
                  currentTime={currentTime}
                  onSeek={(t) => setCurrentTime(t)}
                />
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              <SummaryPanel summary={meeting.summary} />
            </div>
          )}

          {activeTab === "transcript" && (
            <div className="h-[650px]">
              <TranscriptView
                transcript={meeting.transcript}
                currentTime={currentTime}
                onSeek={(t) => setCurrentTime(t)}
              />
            </div>
          )}

          {activeTab === "actions" && (
            <div className="space-y-6">
              <ActionItemList initialItems={meeting.actionItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
