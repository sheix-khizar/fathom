import { Meeting } from "@/lib/supabase/types";

interface EditorialOverviewProps {
  meeting: Meeting;
}

export default function EditorialOverview({ meeting }: EditorialOverviewProps) {
  const hasSummary = Boolean(meeting.summary && meeting.summary.trim().length > 0);
  const hasDecisions = Boolean(meeting.decisions && Array.isArray(meeting.decisions) && meeting.decisions.length > 0);

  if (!hasSummary && !hasDecisions) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-[var(--foreground)]">No AI Intelligence Generated Yet</h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
          {meeting.status === 'upcoming'
            ? 'This meeting is scheduled for the future. Once the transcript is captured, Google Gemini will automatically extract an executive summary and decisions.'
            : 'No transcript was available for Gemini to process. Once dialogue is recorded, structured insights will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Executive Summary Block */}
      {hasSummary && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Gemini Executive Summary
            </h3>
          </div>
          <p className="text-base leading-relaxed text-[var(--foreground)] font-serif md:font-sans">
            {meeting.summary}
          </p>
        </section>
      )}

      {/* Decisions Finalized Block */}
      {hasDecisions && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Agreed Decisions & Commitments
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {meeting.decisions.length} recorded
            </span>
          </div>

          <ul className="space-y-3">
            {meeting.decisions.map((decision, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-3.5 text-sm text-[var(--foreground)]"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  ✓
                </span>
                <span className="leading-snug">{decision}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
