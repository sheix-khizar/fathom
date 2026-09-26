export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  status: 'upcoming' | 'past';
  summary: string | null;
  decisions: string[];
  created_at: string;
}

export interface TranscriptLine {
  id: string;
  meeting_id: string;
  speaker: string;
  text: string;
  timestamp: string;
  offset_seconds: number;
  line_order: number;
  created_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  text: string;
  owner: string | null;
  completed: boolean;
  created_at: string;
}

export interface ShareClip {
  id: string;
  token: string;
  meeting_id: string;
  start_line_id: string | null;
  end_line_id: string | null;
  start_time: string | null;
  end_time: string | null;
  title: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      meetings: {
        Row: Meeting;
        Insert: {
          id?: string;
          title: string;
          date?: string;
          duration?: string;
          participants?: string[];
          status?: 'upcoming' | 'past';
          summary?: string | null;
          decisions?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          duration?: string;
          participants?: string[];
          status?: 'upcoming' | 'past';
          summary?: string | null;
          decisions?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      transcript_lines: {
        Row: TranscriptLine;
        Insert: {
          id?: string;
          meeting_id: string;
          speaker: string;
          text: string;
          timestamp: string;
          offset_seconds?: number;
          line_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          speaker?: string;
          text?: string;
          timestamp?: string;
          offset_seconds?: number;
          line_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      action_items: {
        Row: ActionItem;
        Insert: {
          id?: string;
          meeting_id: string;
          text: string;
          owner?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          text?: string;
          owner?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      share_clips: {
        Row: ShareClip;
        Insert: {
          id?: string;
          token: string;
          meeting_id: string;
          start_line_id?: string | null;
          end_line_id?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          meeting_id?: string;
          start_line_id?: string | null;
          end_line_id?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          title?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
