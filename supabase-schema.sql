-- =============================================================
-- Advent Calendar PWA — Supabase Database Schema
-- =============================================================
-- Run this SQL in your Supabase SQL Editor to set up all tables,
-- indexes, RLS policies, and seed data.
-- =============================================================

-- 1. CALENDARS
-- Stores each advent calendar (one per family group)
CREATE TABLE calendars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  puzzle_image_url TEXT,          -- URL of the family photo for the final puzzle
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_calendars_slug ON calendars (slug);

-- 2. CALENDAR RIDDLES / CHALLENGES
-- 24 challenges per calendar, one per day (polymorphic: riddles, word search, quiz, etc.)
CREATE TABLE calendar_riddles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES calendars (id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 24),
  riddle_text TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',          -- stored lowercase for case-insensitive matching
  hint TEXT,                                  -- optional hint
  challenge_type TEXT NOT NULL DEFAULT 'riddle', -- 'riddle', 'wordsearch', 'quiz', etc.
  config JSONB NOT NULL DEFAULT '{}'::jsonb,  -- polymorphic settings per game type
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (calendar_id, day_number)
);

CREATE INDEX idx_riddles_calendar ON calendar_riddles (calendar_id);

-- 3. USERS
-- Each user belongs to a calendar group
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calendar_id UUID NOT NULL REFERENCES calendars (id) ON DELETE CASCADE,
  avatar_color TEXT DEFAULT '#e74c3c',   -- random avatar color assigned on creation
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (name, calendar_id)             -- no duplicate names within a calendar
);

CREATE INDEX idx_users_calendar ON users (calendar_id);

-- 4. USER PROGRESS
-- Tracks when each user opens and solves each day
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  calendar_id UUID NOT NULL REFERENCES calendars (id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 24),
  opened_at TIMESTAMPTZ DEFAULT now() NOT NULL,  -- when they opened the riddle modal
  solved_at TIMESTAMPTZ,                          -- when they answered correctly (NULL = unsolved)
  score INTEGER,                                  -- optional score for minigames (e.g. photo voting)
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, day_number, calendar_id)
);

CREATE INDEX idx_progress_user ON user_progress (user_id);
CREATE INDEX idx_progress_calendar ON user_progress (calendar_id);
CREATE INDEX idx_progress_day ON user_progress (calendar_id, day_number);

-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================
-- Enable RLS on all tables
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_riddles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for calendars (anyone with the link can see it)
CREATE POLICY "Calendars are viewable by everyone"
  ON calendars FOR SELECT
  USING (true);

-- Public read access for riddles (time-lock is enforced client-side)
CREATE POLICY "Riddles are viewable by everyone"
  ON calendar_riddles FOR SELECT
  USING (true);

-- Public read/insert for users (onboarding creates users)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create a user"
  ON users FOR INSERT
  WITH CHECK (true);

-- Public read/insert/update for user_progress
CREATE POLICY "Progress is viewable by everyone"
  ON user_progress FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert progress"
  ON user_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update progress"
  ON user_progress FOR UPDATE
  USING (true);

-- Admin-only write policies for calendars and riddles
-- (Authenticated admin user via Supabase Auth)
CREATE POLICY "Admins can insert calendars"
  ON calendars FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update calendars"
  ON calendars FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete calendars"
  ON calendars FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert riddles"
  ON calendar_riddles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update riddles"
  ON calendar_riddles FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete riddles"
  ON calendar_riddles FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================================
-- MIGRATION: Add polymorphic challenge_type & config to existing databases
-- =============================================================
ALTER TABLE calendar_riddles 
  ADD COLUMN IF NOT EXISTS challenge_type TEXT NOT NULL DEFAULT 'riddle',
  ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Populate config with existing riddle data if empty
UPDATE calendar_riddles
SET config = jsonb_build_object(
  'question', riddle_text,
  'solution', solution,
  'hint', COALESCE(hint, '')
)
WHERE config = '{}'::jsonb OR config IS NULL;

-- =============================================================
-- STORAGE BUCKET: calendar-media
-- =============================================================
-- Bucket for family puzzle photos and mystery baby photos.
-- Create the public bucket 'calendar-media' in Supabase Storage UI,
-- or run the following policies:
--
-- 1. Allow everyone to view/download photos:
-- CREATE POLICY "Public Access"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'calendar-media');
--
-- 2. Allow authenticated admins (and anon upload if desired) to upload photos:
-- CREATE POLICY "Allow Uploads"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'calendar-media');
--
-- 3. Allow updates / overwrites:
-- CREATE POLICY "Allow Updates"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'calendar-media');
--
-- 4. Allow deletes (per esborrar imatges antigues i estalviar espai):
-- CREATE POLICY "Allow Deletes"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'calendar-media');

