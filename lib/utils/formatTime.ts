/**
 * Formats a duration in seconds into mm:ss or hh:mm:ss.
 * Example: 65 -> "01:05", 3665 -> "1:01:05"
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const paddedMins = minutes.toString().padStart(2, "0");
  const paddedSecs = secs.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }

  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Formats seconds into human readable duration string.
 * Example: 1845 -> "30m 45s", 3600 -> "1h"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a clean display format.
 * Example: "2026-09-10" -> "Sep 10, 2026"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, monthIndex, day);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
