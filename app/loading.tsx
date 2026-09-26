export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 px-4 sm:px-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-4">
        <div className="h-4 w-32 rounded-full bg-[var(--muted)]" />
        <div className="h-8 w-72 rounded-xl bg-[var(--muted)]" />
        <div className="h-4 w-96 rounded-lg bg-[var(--muted)]" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--border)]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-[var(--border)]/60 bg-[var(--muted)]/40 p-3 space-y-1">
              <div className="h-3 w-16 bg-[var(--muted)] rounded" />
              <div className="h-6 w-8 bg-[var(--muted)] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-36 rounded bg-[var(--muted)]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-[var(--muted)]" />
                <div className="h-4 w-12 rounded bg-[var(--muted)]" />
              </div>
              <div className="h-5 w-48 rounded bg-[var(--muted)]" />
              <div className="h-12 w-full rounded bg-[var(--muted)]/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
