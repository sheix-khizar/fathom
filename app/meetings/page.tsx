import Link from "next/link";
import { getMeetings } from "@/lib/data/meetings";
import { formatDate, formatDuration } from "@/lib/utils/formatTime";

export default function MeetingsListPage() {
  const meetings = getMeetings();

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Recorded Meetings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Access synced transcripts, AI summaries, decisions, and action items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
            {meetings.length} Recorded Meetings
          </span>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meetings.map((meeting) => (
          <Link
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
            className="group flex flex-col justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-5 transition hover:border-indigo-500/50 hover:bg-gray-900 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-100 group-hover:text-indigo-300 transition line-clamp-1">
                  {meeting.title}
                </h2>
                <span className="shrink-0 rounded bg-gray-800 px-2 py-0.5 font-mono text-[11px] text-gray-400">
                  {formatDuration(meeting.durationSec)}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-gray-400 line-clamp-2">
                {meeting.summary.overview}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>{formatDate(meeting.date)}</span>
                <span>•</span>
                <span>{meeting.participants.length} attendees</span>
              </div>

              <span className="text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-medium">
                View detail →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
