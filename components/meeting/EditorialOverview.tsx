import { Meeting } from "@/lib/supabase/types";

interface EditorialOverviewProps {
  meeting: Meeting;
}

export default function EditorialOverview({ meeting }: EditorialOverviewProps) {
  const hasSummary = Boolean(meeting.summary && meeting.summary.trim().length > 0);
  const hasDecisions = Boolean(meeting.decisions && Array.isArray(meeting.decisions) && meeting.decisions.length > 0);

  if (!hasSummary && !hasDecisions) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">No AI Intelligence Generated Yet</h3>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
          {meeting.status === 'upcoming'
            ? 'This meeting is scheduled for the future. Once the transcript is captured, Google Gemini will automatically extract an executive summary and decisions.'
            : 'No transcript was available for Gemini to process. Once dialogue is recorded, structured insights will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Executive Summary Block - The Centerpiece */}
      {hasSummary && (
        <section className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/20 via-[var(--card)] to-[var(--card)] p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                  Gemini Executive Summary
                </h3>
                <span className="text-[10px] text-[var(--muted-foreground)] block">
                  Distilled from synchronous dialogue turns
                </span>
              </div>
            </div>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-mono font-medium text-indigo-300">
              AI Synthesized
            </span>
          </div>

          <div className="border-l-2 border-indigo-500/40 pl-4 sm:pl-5 py-1">
            <p className="text-base sm:text-lg leading-relaxed text-[var(--foreground)] font-serif md:font-sans">
              {meeting.summary}
            </p>
          </div>
        </section>
      )}

      {/* Decisions Finalized Block */}
      {hasDecisions && (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Agreed Decisions & Commitments
                </h3>
                <span className="text-[10px] text-[var(--muted-foreground)] block">
                  Explicit team consensus points extracted by AI
                </span>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-400">
              {meeting.decisions.length} recorded
            </span>
          </div>

          <ul className="space-y-3">
            {meeting.decisions.map((decision, index) => (
              <li
                key={index}
                className="group flex items-start gap-3.5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 hover:border-emerald-500/30 hover:bg-[var(--muted)]/60 p-4 text-sm text-[var(--foreground)] transition duration-150"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/30">
                  ✓
                </span>
                <span className="leading-relaxed text-sm font-medium">{decision}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
