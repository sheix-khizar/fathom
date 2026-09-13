export type TranscriptLine = {
  id: string;
  speaker: string;
  timestampSec: number;
  text: string;
};

export type ActionItem = {
  id: string;
  title: string;
  owner: string;
  completed: boolean;
};

export type MeetingSummary = {
  overview: string;
  keyPoints: string[];
  decisions: string[];
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  durationSec: number;
  participants: string[];
  recordingUrl: string;
  summary: MeetingSummary;
  transcript: TranscriptLine[];
  actionItems: ActionItem[];
};

export type ShareClip = {
  id: string;
  meetingId: string;
  startSec: number;
  endSec: number;
  token: string;
  createdAt?: string;
};

export type SummaryTemplate = {
  id: string;
  name: string;
  description: string;
};

export type SearchResult = {
  meetingId: string;
  meetingTitle: string;
  date: string;
  matchedText: string;
  timestampSec?: number;
  type: "title" | "transcript";
};
