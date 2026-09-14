"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Meeting, SearchResult } from "@/lib/types";
import { searchMeetings } from "@/lib/utils/search";
import { formatDate, formatTime } from "@/lib/utils/formatTime";

interface SearchResultsProps {
  meetings: Meeting[];
}

type FilterType = "all" | "title" | "transcript";

const QUICK_SEARCH_SUGGESTIONS = [
  "Roadmap",
  "latency",
  "PgBouncer",
  "compliance",
  "Product Hunt",
  "retention",
  "Acme",
];

export default function SearchResults({ meetings }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlQuery = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const query = localQuery !== null ? localQuery : urlQuery;

  // Update URL query param when user searches
  const handleQueryChange = (val: string) => {
    setLocalQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("q", val.trim());
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setLocalQuery("");
    router.replace("/search");
  };

  // Perform search across seeded meetings
  const allResults = useMemo(() => {
    return searchMeetings(meetings, query);
  }, [meetings, query]);

  // Apply category filters
  const filteredResults = useMemo(() => {
    if (activeFilter === "title") {
      return allResults.filter((r) => r.type === "title");
    }
    if (activeFilter === "transcript") {
      return allResults.filter((r) => r.type === "transcript");
    }
    return allResults;
  }, [allResults, activeFilter]);

  const titleCount = allResults.filter((r) => r.type === "title").length;
  const transcriptCount = allResults.filter((r) => r.type === "transcript").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header & Search Input Box */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Search Meetings & Transcripts
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Search across call titles, dialogue transcript lines, and timestamps.
          </p>
        </div>

        {/* Large Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search keywords, speakers, decisions, or transcript phrases..."
            className="w-full rounded-xl border border-gray-800 bg-gray-900/90 pl-11 pr-24 py-3 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition shadow-lg"
          />

          {query && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-3 flex items-center px-2 text-xs font-medium text-gray-400 hover:text-white transition"
              title="Clear search query"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips row (only visible when a query exists) */}
        {query.trim() && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                  activeFilter === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800"
                }`}
              >
                All Matches ({allResults.length})
              </button>

              <button
                onClick={() => setActiveFilter("title")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                  activeFilter === "title"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800"
                }`}
              >
                Meeting Titles ({titleCount})
              </button>

              <button
                onClick={() => setActiveFilter("transcript")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                  activeFilter === "transcript"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800"
                }`}
              >
                Transcripts ({transcriptCount})
              </button>
            </div>

            <span className="text-xs text-gray-500">
              Showing {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"} for &ldquo;
              <span className="text-indigo-400 font-medium">{query.trim()}</span>&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* Results Container */}
      <div className="space-y-3 pt-2">
        {/* Empty state: No query entered yet */}
        {!query.trim() && (
          <div className="rounded-xl border border-gray-800/80 bg-gray-900/40 p-8 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-gray-200">
                Type to start searching
              </h2>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Search matches call titles and full transcript dialogue lines across all recorded meetings.
              </p>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="pt-2">
              <span className="text-xs text-gray-500 block mb-2 font-medium">
                Try searching for:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {QUICK_SEARCH_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleQueryChange(suggestion)}
                    className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/40 border border-gray-700/50 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {query.trim() && filteredResults.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-10 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-gray-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-200">
              No results found for &ldquo;{query}&rdquo;
            </h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Check for typos or try searching for broader keywords like &ldquo;Roadmap&rdquo;, &ldquo;latency&rdquo;, or &ldquo;compliance&rdquo;.
            </p>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 pt-2"
            >
              Clear search input
            </button>
          </div>
        )}

        {/* Results List */}
        {query.trim() && filteredResults.length > 0 && (
          <div className="divide-y divide-gray-800/80 rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden shadow-sm">
            {filteredResults.map((result: SearchResult, idx: number) => {
              const targetUrl = `/meetings/${result.meetingId}${
                result.timestampSec !== undefined ? `?t=${result.timestampSec}` : ""
              }`;

              return (
                <Link
                  key={`${result.meetingId}-${result.type}-${result.timestampSec ?? idx}`}
                  href={targetUrl}
                  className="group flex flex-col gap-2 p-4 transition hover:bg-gray-800/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          result.type === "title"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        {result.type === "title" ? "Meeting Title" : "Transcript Line"}
                      </span>

                      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-indigo-300 transition">
                        {result.meetingTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(result.date)}</span>
                      {result.timestampSec !== undefined && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded text-[11px] border border-indigo-900/40">
                            {formatTime(result.timestampSec)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Matched text preview */}
                  <p className="text-xs leading-relaxed text-gray-400 group-hover:text-gray-300 transition pl-1">
                    {result.matchedText}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
