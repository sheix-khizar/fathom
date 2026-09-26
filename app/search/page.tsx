import { Suspense } from "react";
import EditorialSearch from "@/components/search/EditorialSearch";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl py-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
            <span className="h-3 w-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Loading workspace search index...
          </div>
        </div>
      }
    >
      <EditorialSearch />
    </Suspense>
  );
}
