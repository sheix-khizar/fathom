-- Supabase Migration: 002_tighten_rls_and_permissions.sql
-- 1. Grant table access to PostgREST roles (fixes "permission denied for table meetings")
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Drop overly permissive public read policies if they exist
DROP POLICY IF EXISTS "Allow public read on meetings" ON meetings;
DROP POLICY IF EXISTS "Allow public read on transcript_lines" ON transcript_lines;
DROP POLICY IF EXISTS "Allow public read on action_items" ON action_items;
DROP POLICY IF EXISTS "Allow public read on share_clips" ON share_clips;

DROP POLICY IF EXISTS "Allow public read on shared meetings" ON meetings;
DROP POLICY IF EXISTS "Allow public read on shared transcript lines" ON transcript_lines;

-- 3. Ensure Row Level Security is active
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_clips ENABLE ROW LEVEL SECURITY;

-- 4. Scoped Public RLS Policies
-- a) share_clips: Public can read clips to look up by token
CREATE POLICY "Allow public read on share_clips"
  ON share_clips FOR SELECT
  TO anon, authenticated
  USING (true);

-- b) meetings: Public can ONLY read a meeting IF an active share_clip exists for it
CREATE POLICY "Allow public read on shared meetings"
  ON meetings FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM share_clips
      WHERE share_clips.meeting_id = meetings.id
    )
  );

-- c) transcript_lines: Public can ONLY read transcript lines for meetings that have a share_clip
CREATE POLICY "Allow public read on shared transcript lines"
  ON transcript_lines FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM share_clips
      WHERE share_clips.meeting_id = transcript_lines.meeting_id
    )
  );

-- d) action_items: NO public read policy!
-- Action items remain strictly private to internal server routes (service_role).
