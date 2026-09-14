import { MeetingSummary } from "@/lib/types";

interface SummaryPanelProps {
  summary: MeetingSummary;
}

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
            AI Executive Overview
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-200">
          {summary.overview}
        </p>
      </div>

      {/* Key Points Block */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Key Discussion Points
          </h3>
        </div>
        <ul className="space-y-2.5">
          {summary.keyPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <span className="leading-snug">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Decisions Made Block */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Decisions Finalized
          </h3>
        </div>
        <ul className="space-y-3">
          {summary.decisions.map((decision, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-emerald-900/30 bg-emerald-950/20 p-3 text-sm text-emerald-200"
            >
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="leading-snug">{decision}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
