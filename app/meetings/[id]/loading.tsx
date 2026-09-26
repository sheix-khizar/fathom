export default function MeetingDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20 px-4 sm:px-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded-full bg-[var(--muted)]" />
          <div className="h-8 w-24 rounded-xl bg-[var(--muted)]" />
        </div>
        <div className="h-8 w-2/3 rounded-xl bg-[var(--muted)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--muted)]" />
        <div className="h-4 w-1/3 rounded bg-[var(--muted)] pt-2" />
      </div>

      {/* Scrubber Skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-24 rounded bg-[var(--muted)]" />
          <div className="h-4 w-16 rounded bg-[var(--muted)]" />
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--muted)]" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2">
        <div className="h-8 w-24 rounded-xl bg-[var(--muted)]" />
        <div className="h-8 w-24 rounded-xl bg-[var(--muted)]/60" />
        <div className="h-8 w-24 rounded-xl bg-[var(--muted)]/60" />
      </div>

      {/* Content Skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-[var(--muted)]" />
        <div className="h-4 w-full rounded bg-[var(--muted)]/70" />
        <div className="h-4 w-5/6 rounded bg-[var(--muted)]/70" />
        <div className="h-4 w-3/4 rounded bg-[var(--muted)]/70" />
      </div>
    </div>
  );
}
