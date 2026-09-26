-- Supabase Migration: 003_add_recording_url.sql
-- Add optional recording_url to meetings table for raw uploaded audio/video files

ALTER TABLE meetings ADD COLUMN IF NOT EXISTS recording_url TEXT;
