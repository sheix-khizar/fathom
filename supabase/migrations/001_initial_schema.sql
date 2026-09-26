-- Supabase Migration: 001_initial_schema.sql
-- Fathom Rebuild Plan v2 Schema

-- 1. Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration TEXT NOT NULL DEFAULT '30m',
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'past')) DEFAULT 'past',
  summary TEXT,
  decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Transcript Lines Table
CREATE TABLE IF NOT EXISTS transcript_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  offset_seconds INTEGER NOT NULL DEFAULT 0,
  line_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering transcript lines efficiently
CREATE INDEX IF NOT EXISTS idx_transcript_lines_meeting_order 
  ON transcript_lines (meeting_id, line_order);

-- 3. Action Items Table
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  owner TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for meeting action items
CREATE INDEX IF NOT EXISTS idx_action_items_meeting 
  ON action_items (meeting_id);

-- 4. Share Clips Table
CREATE TABLE IF NOT EXISTS share_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  start_line_id UUID REFERENCES transcript_lines(id) ON DELETE SET NULL,
  end_line_id UUID REFERENCES transcript_lines(id) ON DELETE SET NULL,
  start_time TEXT,
  end_time TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for share token lookups
CREATE INDEX IF NOT EXISTS idx_share_clips_token 
  ON share_clips (token);

-- ============================================================================
-- Permissions & Grants
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ============================================================================
-- Row Level Security (RLS) & Policies
-- ============================================================================

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_clips ENABLE ROW LEVEL SECURITY;

-- 1. share_clips: Public can read share clips by token
CREATE POLICY "Allow public read on share_clips"
  ON share_clips FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. meetings: Public can ONLY read a meeting IF an active share_clip exists for it
CREATE POLICY "Allow public read on shared meetings"
  ON meetings FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM share_clips
      WHERE share_clips.meeting_id = meetings.id
    )
  );

-- 3. transcript_lines: Public can ONLY read transcript lines for meetings that have a share_clip
CREATE POLICY "Allow public read on shared transcript lines"
  ON transcript_lines FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM share_clips
      WHERE share_clips.meeting_id = transcript_lines.meeting_id
    )
  );

-- 4. action_items: Strictly private to backend service_role. No public anon read policy!
