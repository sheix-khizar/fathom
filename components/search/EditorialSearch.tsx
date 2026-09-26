"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export interface SearchMeetingResult {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: string;
  summary?: string | null;
}

export interface SearchTranscriptMatch {
  id: string;
  meeting_id: string;
  speaker: string;
  text: string;
  timestamp: string;
  offset_seconds: number;
  line_order: number;
  meetingTitle: string;
  meetingDate?: string;
}

interface SearchApiResponse {
  query: string;
  meetings: SearchMeetingResult[];
  transcriptMatches: SearchTranscriptMatch[];
  error?: string;
}

type FilterTab = "all" | "meetings" | "transcripts";

const SUGGESTED_QUERIES = [
  "Supabase",
  "Architecture",
  "Roadmap",
  "Acme",
  "Launch",
  "Discovery",
  "RLS",
];

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Highlight matched query substring safely
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim() || !text) {
    return <span>{text}</span>;
  }

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded bg-amber-100 text-amber-900 px-1 py-0.5 font-semibold underline decoration-amber-400"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export default function EditorialSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const [isLoading, setIsLoading] = useState(false);
  const [matchedMeetings, setMatchedMeetings] = useState<SearchMeetingResult[]>([]);
  const [matchedTranscripts, setMatchedTranscripts] = useState<SearchTranscriptMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if URL changes externally
  useEffect(() => {
    if (urlQuery !== inputValue) {
      setInputValue(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }, [urlQuery]);

  // Debounce user input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);

      // Sync query parameter to browser URL gracefully
      const params = new URLSearchParams(window.location.search);
      if (inputValue.trim()) {
        params.set("q", inputValue.trim());
      } else {
        params.delete("q");
      }
      const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, router]);

  // Execute search fetch whenever debounced query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setMatchedMeetings([]);
      setMatchedTranscripts([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Search failed with status ${res.status}`);
        }
        return res.json() as Promise<SearchApiResponse>;
      })
      .then((data) => {
        if (!isMounted) return;
        setMatchedMeetings(data.meetings || []);
        setMatchedTranscripts(data.transcriptMatches || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Search API error:", err);
        setErrorMessage(err.message || "Failed to query workspace index.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedQuery]);

  const totalCount = matchedMeetings.length + matchedTranscripts.length;

  const handleClear = () => {
    setInputValue("");
    setDebouncedQuery("");
    setMatchedMeetings([]);
    setMatchedTranscripts([]);
    router.replace("/search", { scroll: false });
  };

  const handleSuggestionClick = (keyword: string) => {
    setInputValue(keyword);
    setDebouncedQuery(keyword);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20 px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-medium tracking-wide uppercase text-teal-800">
            Intelligence Search
          </span>
          <span className="font-mono text-xs text-slate-400">•</span>
          <span className="font-mono text-xs text-slate-500">Real-time Index</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Search Workspace
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Scan meeting titles, Gemini-synthesized insights, and synchronized dialogue transcript lines across all recorded sessions.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-3">
        <div className="relative card-elevation rounded-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            id="workspace-search-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search keywords, speakers, decisions, or transcript phrases..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-24 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition"
          />

          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {isLoading && (
              <span className="h-4 w-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            )}
            {inputValue && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg px-2.5 py-1 text-xs font-mono text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Clear query"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs when query exists */}
        {debouncedQuery.trim() && !isLoading && totalCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeTab === "all"
                    ? "bg-teal-700 text-white shadow-sm font-semibold"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                All Results ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("meetings")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeTab === "meetings"
                    ? "bg-teal-700 text-white shadow-sm font-semibold"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Meeting Titles ({matchedMeetings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("transcripts")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeTab === "transcripts"
                    ? "bg-teal-700 text-white shadow-sm font-semibold"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Transcript Lines ({matchedTranscripts.length})
              </button>
            </div>

            <span className="text-xs font-mono text-slate-500">
              Showing {activeTab === "all" ? totalCount : activeTab === "meetings" ? matchedMeetings.length : matchedTranscripts.length} matches for &ldquo;{debouncedQuery.trim()}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Error State */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Search Request Failed</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        )}

        {/* Empty State: No Query Entered */}
        {!debouncedQuery.trim() && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-4 card-elevation">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900">
                Search meetings and transcript dialogue
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Type keywords to find discussion topics, architectural decisions, and spoken phrases.
              </p>
            </div>

            {/* Suggestions Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Quick Keywords
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUERIES.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => handleSuggestionClick(keyword)}
                    className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 hover:border-teal-400 hover:text-teal-800 transition cursor-pointer shadow-sm"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3 card-elevation">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-600">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              Scanning database for &ldquo;{debouncedQuery}&rdquo;...
            </div>
          </div>
        )}

        {/* Honest No Results State */}
        {!isLoading && debouncedQuery.trim() && totalCount === 0 && !errorMessage && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 card-elevation">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900">
                No results found for &ldquo;{debouncedQuery}&rdquo;
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                No meeting titles or transcript lines matched your query. Try searching for terms like &ldquo;Supabase&rdquo;, &ldquo;Roadmap&rdquo;, or &ldquo;Architecture&rdquo;.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center rounded-xl bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            >
              Clear Search Query
            </button>
          </div>
        )}

        {/* Results List */}
        {!isLoading && debouncedQuery.trim() && totalCount > 0 && (
          <div className="space-y-6">
            {/* Section 1: Meeting Matches */}
            {(activeTab === "all" || activeTab === "meetings") && matchedMeetings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Meeting Sessions ({matchedMeetings.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white overflow-hidden card-elevation">
                  {matchedMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="group flex flex-col gap-2 p-5 transition hover:bg-slate-50/80"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-blue-700">
                            TITLE MATCH
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {formatDisplayDate(meeting.date)}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            • {meeting.duration}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono">
                          Open detail →
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                        <HighlightedText text={meeting.title} query={debouncedQuery} />
                      </h4>

                      {meeting.summary && (
                        <p className="text-xs leading-relaxed text-slate-600 line-clamp-2 italic">
                          <HighlightedText text={meeting.summary} query={debouncedQuery} />
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Transcript Matches */}
            {(activeTab === "all" || activeTab === "transcripts") && matchedTranscripts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-600" />
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Dialogue Transcripts ({matchedTranscripts.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white overflow-hidden card-elevation">
                  {matchedTranscripts.map((match) => (
                    <Link
                      key={match.id}
                      href={`/meetings/${match.meeting_id}`}
                      className="group flex flex-col gap-3 p-5 transition hover:bg-slate-50/80"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-teal-800">
                            TRANSCRIPT MATCH
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {match.meetingTitle}
                          </span>
                          {match.meetingDate && (
                            <span className="text-xs font-mono text-slate-500">
                              • {formatDisplayDate(match.meetingDate)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {match.timestamp}
                          </span>
                          <span className="text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-mono">
                            Jump →
                          </span>
                        </div>
                      </div>

                      {/* Dialogue quote block */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {match.speaker}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-800 pl-3.5 border-l-2 border-teal-600">
                          &ldquo;<HighlightedText text={match.text} query={debouncedQuery} />&rdquo;
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
