export default function ShareClipLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 px-4 sm:px-6 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-14 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 flex items-center justify-between">
        <div className="h-4 w-48 rounded bg-[var(--muted)]" />
        <div className="h-8 w-24 rounded-xl bg-[var(--muted)]" />
      </div>

      {/* Header Skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-4">
        <div className="h-4 w-32 rounded-full bg-[var(--muted)]" />
        <div className="h-8 w-3/4 rounded-xl bg-[var(--muted)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--muted)]" />
      </div>

      {/* Scrubber Skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-32 rounded bg-[var(--muted)]" />
          <div className="h-4 w-16 rounded bg-[var(--muted)]" />
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--muted)]" />
      </div>

      {/* Transcript Lines Skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
        <div className="h-5 w-48 rounded bg-[var(--muted)]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 space-y-2">
            <div className="h-3 w-28 rounded bg-[var(--muted)]" />
            <div className="h-4 w-full rounded bg-[var(--muted)]/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
