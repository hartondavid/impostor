-- Run this in your Supabase SQL Editor to add the new columns to the existing table.
-- Safe to run multiple times (IF NOT EXISTS guards).

ALTER TABLE game_rooms
  ADD COLUMN IF NOT EXISTS first_host_id TEXT,
  ADD COLUMN IF NOT EXISTS round_skipped BOOLEAN DEFAULT FALSE;
