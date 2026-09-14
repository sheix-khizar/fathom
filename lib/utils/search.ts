import { Meeting, SearchResult } from "@/lib/types";

/**
 * Extracts a snippet around the matched search term in a text string.
 */
export function extractSnippet(text: string, query: string, maxLength: number = 100): string {
  if (!text || !query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  const start = Math.max(0, index - 25);
  const end = Math.min(text.length, index + query.length + 50);

  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}

/**
 * Performs case-insensitive search across meeting titles and transcript lines.
 * Returns an array of SearchResult objects matching the SearchResult type.
 */
export function searchMeetings(meetings: Meeting[], query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const lowerQuery = trimmed.toLowerCase();
  const results: SearchResult[] = [];

  for (const meeting of meetings) {
    // 1. Check title match
    if (meeting.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        date: meeting.date,
        matchedText: meeting.title,
        type: "title",
      });
    }

    // 2. Check transcript lines matches
    for (const line of meeting.transcript) {
      if (line.text.toLowerCase().includes(lowerQuery)) {
        results.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          date: meeting.date,
          matchedText: extractSnippet(line.text, trimmed),
          timestampSec: line.timestampSec,
          type: "transcript",
        });
      }
    }
  }

  return results;
}
