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
            className="rounded bg-amber-400/25 dark:bg-amber-400/30 text-[var(--foreground)] px-0.5 font-medium underline decoration-amber-500/60"
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
  const [apiData, setApiData] = useState<SearchApiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if URL query param changes externally (e.g. from TopBar or back button)
  useEffect(() => {
    if (urlQuery !== inputValue && urlQuery !== debouncedQuery) {
      setInputValue(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }, [urlQuery]);

  // Debounce user input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);

      // Keep URL search query updated
      startTransition(() => {
        const trimmed = inputValue.trim();
        if (trimmed) {
          router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
        } else {
          router.replace(`/search`, { scroll: false });
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, router]);

  // Fetch results whenever debouncedQuery changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setApiData(null);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data: SearchApiResponse) => {
        if (isMounted) {
          setApiData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Search fetch failed:", err);
          setErrorMessage(err.message || "Failed to load search results.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const matchedMeetings = apiData?.meetings || [];
  const matchedTranscripts = apiData?.transcriptMatches || [];
  const totalCount = matchedMeetings.length + matchedTranscripts.length;

  const handleSuggestionClick = (keyword: string) => {
    setInputValue(keyword);
    setDebouncedQuery(keyword);
  };

  const handleClear = () => {
    setInputValue("");
    setDebouncedQuery("");
    setApiData(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--muted)] border border-[var(--border)] px-2.5 py-0.5 text-[10px] font-mono font-medium tracking-wide uppercase text-[var(--muted-foreground)]">
            Intelligence Search
          </span>
          <span className="font-mono text-xs text-[var(--muted-foreground)]">•</span>
          <span className="font-mono text-xs text-[var(--muted-foreground)]">Real-time Index</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Search Workspace
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
          Scan meeting titles, Gemini-synthesized insights, and synchronized dialogue transcript lines across all recorded sessions.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted-foreground)]">
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
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-24 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition shadow-sm"
          />

          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {isLoading && (
              <span className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            )}
            {inputValue && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded px-2 py-1 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition"
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "all"
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm font-semibold"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                All Results ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("meetings")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "meetings"
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm font-semibold"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                Meeting Titles ({matchedMeetings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("transcripts")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === "transcripts"
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm font-semibold"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                Transcript Lines ({matchedTranscripts.length})
              </button>
            </div>

            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              Showing {activeTab === "all" ? totalCount : activeTab === "meetings" ? matchedMeetings.length : matchedTranscripts.length} matches for &ldquo;{debouncedQuery.trim()}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Error State */}
        {errorMessage && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            <p className="font-semibold">Search Request Failed</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        )}

        {/* Empty State: No Query Entered */}
        {!debouncedQuery.trim() && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-10 text-center space-y-4">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Search meetings and transcript dialogue
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                Type keywords to find discussion topics, architectural decisions, and spoken phrases.
              </p>
            </div>

            {/* Suggestions Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider block mb-2">
                Quick Keywords
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {SUGGESTED_QUERIES.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => handleSuggestionClick(keyword)}
                    className="rounded-lg bg-[var(--muted)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground)] hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
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
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
              <span className="h-3 w-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              Scanning database for &ldquo;{debouncedQuery}&rdquo;...
            </div>
          </div>
        )}

        {/* Honest No Results State */}
        {!isLoading && debouncedQuery.trim() && totalCount === 0 && !errorMessage && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                No results found for &ldquo;{debouncedQuery}&rdquo;
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                No meeting titles or transcript lines matched your query. Try searching for terms like &ldquo;Supabase&rdquo;, &ldquo;Roadmap&rdquo;, or &ldquo;Architecture&rdquo;.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center rounded-lg bg-[var(--muted)] border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition"
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
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Meeting Sessions ({matchedMeetings.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                  {matchedMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="group flex flex-col gap-2 p-5 transition hover:bg-[var(--muted)]/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400">
                            TITLE MATCH
                          </span>
                          <span className="text-xs font-mono text-[var(--muted-foreground)]">
                            {formatDisplayDate(meeting.date)}
                          </span>
                          <span className="text-xs font-mono text-[var(--muted-foreground)]">
                            • {meeting.duration}
                          </span>
                        </div>

                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Open detail →
                        </span>
                      </div>

                      <h4 className="text-base font-semibold text-[var(--foreground)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        <HighlightedText text={meeting.title} query={debouncedQuery} />
                      </h4>

                      {meeting.summary && (
                        <p className="text-xs leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
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
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Dialogue Transcripts ({matchedTranscripts.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                  {matchedTranscripts.map((match) => (
                    <Link
                      key={match.id}
                      href={`/meetings/${match.meeting_id}`}
                      className="group flex flex-col gap-2.5 p-5 transition hover:bg-[var(--muted)]/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-purple-600 dark:text-purple-400">
                            TRANSCRIPT
                          </span>
                          <span className="text-xs font-medium text-[var(--foreground)]">
                            {match.meetingTitle}
                          </span>
                          {match.meetingDate && (
                            <span className="text-xs font-mono text-[var(--muted-foreground)]">
                              • {formatDisplayDate(match.meetingDate)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded border border-[var(--border)]">
                            {match.timestamp}
                          </span>
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Jump →
                          </span>
                        </div>
                      </div>

                      {/* Dialogue block */}
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-3.5 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span className="text-xs font-semibold text-[var(--foreground)]">
                            {match.speaker}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-[var(--foreground)] pl-3.5 border-l-2 border-indigo-500/40">
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
