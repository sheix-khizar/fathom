import { Suspense } from "react";
import { getMeetings } from "@/lib/data/meetings";
import SearchResults from "@/components/search/SearchResults";

export default function SearchPage() {
  const meetings = getMeetings();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-sm text-gray-500">
          Loading search index...
        </div>
      }
    >
      <SearchResults meetings={meetings} />
    </Suspense>
  );
}
