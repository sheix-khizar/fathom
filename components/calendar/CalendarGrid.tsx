"use client";

import { useState } from "react";
import Link from "next/link";
import { Meeting } from "@/lib/types";
import { formatDuration } from "@/lib/utils/formatTime";

interface CalendarGridProps {
  meetings: Meeting[];
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  day: string; // "Mon", "Tue", "Wed", "Thu", "Fri"
  dateFormatted: string;
  type: "recorded" | "upcoming";
  meetingId?: string;
  attendees: string[];
  platform: "Zoom" | "Google Meet" | "Microsoft Teams";
}

export default function CalendarGrid({ meetings }: CalendarGridProps) {
  const [filter, setFilter] = useState<"all" | "recorded" | "upcoming">("all");

  const events: CalendarEvent[] = [
    {
      id: "ev-1",
      title: meetings[0]?.title || "Product Strategy — Q4 Roadmap",
      time: "10:00 AM",
      duration: formatDuration(meetings[0]?.durationSec || 1845),
      day: "Thu",
      dateFormatted: "Sep 10, 2026",
      type: "recorded",
      meetingId: meetings[0]?.id,
      attendees: meetings[0]?.participants || ["Sarah Chen", "Alex Rivera"],
      platform: "Google Meet",
    },
    {
      id: "ev-2",
      title: meetings[1]?.title || "Weekly Engineering Sync",
      time: "02:00 PM",
      duration: formatDuration(meetings[1]?.durationSec || 1420),
      day: "Fri",
      dateFormatted: "Sep 11, 2026",
      type: "recorded",
      meetingId: meetings[1]?.id,
      attendees: meetings[1]?.participants || ["David Kim", "Marcus Vance"],
      platform: "Zoom",
    },
    {
      id: "ev-3",
      title: meetings[2]?.title || "Customer Discovery Call — Acme Corp",
      time: "11:30 AM",
      duration: formatDuration(meetings[2]?.durationSec || 2100),
      day: "Sat",
      dateFormatted: "Sep 12, 2026",
      type: "recorded",
      meetingId: meetings[2]?.id,
      attendees: meetings[2]?.participants || ["Sarah Chen", "Jordan Taylor"],
      platform: "Zoom",
    },
    {
      id: "ev-4",
      title: meetings[3]?.title || "Marketing Launch Planning — V2 Public Release",
      time: "03:00 PM",
      duration: formatDuration(meetings[3]?.durationSec || 1680),
      day: "Sun",
      dateFormatted: "Sep 13, 2026",
      type: "recorded",
      meetingId: meetings[3]?.id,
      attendees: meetings[3]?.participants || ["Elena Rostova", "Alex Rivera"],
      platform: "Google Meet",
    },
    {
      id: "ev-5",
      title: "Acme Corp — InfoSec & Security Architecture Review",
      time: "11:00 AM",
      duration: "45m",
      day: "Wed",
      dateFormatted: "Sep 16, 2026",
      type: "upcoming",
      attendees: ["Sarah Chen", "Liam Walker (Acme)"],
      platform: "Zoom",
    },
    {
      id: "ev-6",
      title: "Executive Board Q4 Budget Allocation Sync",
      time: "02:30 PM",
      duration: "30m",
      day: "Thu",
      dateFormatted: "Sep 17, 2026",
      type: "upcoming",
      attendees: ["Executive Team", "Finance"],
      platform: "Microsoft Teams",
    },
  ];

  const filteredEvents = events.filter((e) => {
    if (filter === "recorded") return e.type === "recorded";
    if (filter === "upcoming") return e.type === "upcoming";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Calendar & Recording Schedule
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Fathom automatically joins your calendar events to record, transcribe, and summarize calls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Google Calendar Sync: Connected
          </span>
        </div>
      </div>

      {/* Filter Tabs & Quick Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800"
            }`}
          >
            All Calls ({events.length})
          </button>
          <button
            onClick={() => setFilter("recorded")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "recorded"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800"
            }`}
          >
            Recorded & Synced (4)
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === "upcoming"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800"
            }`}
          >
            Upcoming (2)
          </button>
        </div>

        <span className="text-xs text-gray-500">
          Viewing schedule for <strong className="text-gray-300">September 2026</strong>
        </span>
      </div>

      {/* Events List / Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((event) => {
          const isRecorded = event.type === "recorded";

          return (
            <div
              key={event.id}
              className={`flex flex-col justify-between rounded-xl border p-5 transition ${
                isRecorded
                  ? "border-gray-800 bg-gray-900/60 hover:border-indigo-500/60 hover:bg-gray-900"
                  : "border-gray-800/80 bg-gray-950/40"
              }`}
            >
              <div className="space-y-3">
                {/* Event Tag & Platform */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      isRecorded
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {isRecorded ? "Recorded & AI Synced" : "Scheduled • Bot Will Join"}
                  </span>

                  <span className="text-xs text-gray-500 font-medium">
                    {event.platform}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                  {event.title}
                </h3>

                {/* Timing */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">{event.dateFormatted}</span>
                  <span>•</span>
                  <span>{event.time}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-gray-500">{event.duration}</span>
                </div>

                {/* Attendees list */}
                <div className="pt-1">
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    Attendees: {event.attendees.join(", ")}
                  </p>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                {isRecorded && event.meetingId ? (
                  <Link
                    href={`/meetings/${event.meetingId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition group"
                  >
                    Open Recording & Transcript
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                ) : (
                  <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Awaiting call time
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
