"use client";

import { useState } from "react";
import Link from "next/link";
import { Meeting } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/utils/formatTime";

interface DashboardClientProps {
  meetings: Meeting[];
}

export default function DashboardClient({ meetings }: DashboardClientProps) {
  // Aggregate action items across all meetings
  const initialActions = meetings.flatMap((m) =>
    m.actionItems.map((item) => ({ ...item, meetingId: m.id, meetingTitle: m.title }))
  );

  const [actions, setActions] = useState(initialActions);
  const [calendarConnected, setCalendarConnected] = useState(true);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const totalDurationSec = meetings.reduce((acc, m) => acc + m.durationSec, 0);
  const totalCompleted = actions.filter((a) => a.completed).length;
  const pendingActions = actions.filter((a) => !a.completed);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* Welcome & System Status Banner */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900/90 to-indigo-950/40 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Fathom AI Notetaker Online
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Meeting Intelligence Workspace
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Real-time speech-to-text diarization, automated executive summaries, decision tracking, and 0-auth public clip sharing across your organization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/meetings"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              View All Meetings ({meetings.length})
            </Link>

            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:bg-gray-700 hover:text-white transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Open Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Recorded Calls</span>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              100% Synced
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{meetings.length} Meetings</p>
          <p className="text-[11px] text-gray-500">Across Product, Eng, Sales, Marketing</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Audio Processed</span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              Nova-2 Pipeline
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{formatDuration(totalDurationSec)}</p>
          <p className="text-[11px] text-gray-500">43 spoken dialogue lines transcribed</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Action Items</span>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              {totalCompleted}/{actions.length} Done
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{pendingActions.length} Pending</p>
          <p className="text-[11px] text-gray-500">Assigned with verified owners</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Time Saved</span>
            <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
              Estimated
            </span>
          </div>
          <p className="text-2xl font-bold text-white">~8.5 Hours</p>
          <p className="text-[11px] text-gray-500">Eliminated re-listening & note drafting</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Meetings Feed */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Recent Recorded Meetings
              </h2>
              <p className="text-xs text-gray-400">
                Click any meeting to jump into synchronized audio, transcript, and AI notes.
              </p>
            </div>

            <Link
              href="/meetings"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              See all →
            </Link>
          </div>

          <div className="space-y-4">
            {meetings.map((m) => (
              <Link
                key={m.id}
                href={`/meetings/${m.id}`}
                className="group block rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition hover:border-indigo-500/60 hover:bg-gray-900 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-gray-100 group-hover:text-indigo-300 transition line-clamp-1">
                      {m.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(m.date)}</span>
                      <span>•</span>
                      <span>{formatDuration(m.durationSec)}</span>
                      <span>•</span>
                      <span>{m.participants.length} attendees</span>
                    </div>
                  </div>

                  <span className="shrink-0 rounded bg-indigo-950/40 px-2 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-900/40">
                    AI Ready
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-gray-400 line-clamp-2">
                  {m.summary.overview}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {m.participants.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-[10px] font-semibold text-gray-300 ring-1 ring-gray-700"
                        title={p}
                      >
                        {p.slice(0, 2).toUpperCase()}
                      </span>
                    ))}
                    {m.participants.length > 3 && (
                      <span className="text-[10px] text-gray-500">
                        +{m.participants.length - 3} more
                      </span>
                    )}
                  </div>

                  <span className="font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Open detail & transcript →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Action Items Widget & Calendar Connector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Action Items Checklist */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Action Items Checklist
                </h3>
              </div>

              <span className="text-xs text-gray-400 font-mono">
                {totalCompleted}/{actions.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {actions.map((act) => (
                <div
                  key={act.id}
                  onClick={() => toggleAction(act.id)}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition cursor-pointer select-none ${
                    act.completed
                      ? "border-gray-800/60 bg-gray-950/30 opacity-70"
                      : "border-gray-800 bg-gray-950/70 hover:border-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={act.completed}
                    onChange={() => toggleAction(act.id)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-snug transition ${
                        act.completed ? "line-through text-gray-500" : "text-gray-200"
                      }`}
                    >
                      {act.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="font-medium text-gray-400">Owner: {act.owner}</span>
                      <Link
                        href={`/meetings/${act.meetingId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-400 hover:underline"
                      >
                        {act.meetingTitle.split("—")[0].trim()}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Sync Status Card */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Calendar Integration
                </h4>
              </div>

              <span
                onClick={() => setCalendarConnected(!calendarConnected)}
                className={`cursor-pointer rounded px-2 py-0.5 text-[10px] font-semibold transition ${
                  calendarConnected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {calendarConnected ? "Connected ✓" : "Disconnected"}
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Google Calendar connected to <span className="text-gray-200">shkkhizar27@gmail.com</span>. Fathom will automatically enter incoming calls as a participant to record and transcribe.
            </p>

            <div className="pt-1">
              <Link
                href="/calendar"
                className="block text-center rounded-lg bg-gray-800 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-700 hover:text-white transition"
              >
                View Full Weekly Calendar →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
