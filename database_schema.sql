-- database_schema_supabase.sql
-- Idempotent Postgres schema for Supabase

-- Drop in reverse FK order to avoid conflicts
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS ai_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (matchers) - Use UUID to match Supabase auth
CREATE TABLE IF NOT EXISTS users (
  id       UUID PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT NOT NULL UNIQUE,
  password TEXT
);

-- AI Profiles table
CREATE TABLE IF NOT EXISTS ai_profiles (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name               TEXT NOT NULL,
  personality        TEXT NOT NULL,
  description        TEXT NOT NULL,
  hobbies            TEXT,
  model_type         TEXT,
  compatibility_tags TEXT,
  password           TEXT,
  user_id            UUID,
  CONSTRAINT fk_ai_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Matches table (links two AI profiles; optionally created by a user)
CREATE TABLE IF NOT EXISTS matches (
  id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ai1_id  BIGINT NOT NULL,
  ai2_id  BIGINT NOT NULL,
  user_id UUID,
  CONSTRAINT fk_matches_ai1
    FOREIGN KEY (ai1_id) REFERENCES ai_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_ai2
    FOREIGN KEY (ai2_id) REFERENCES ai_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Threads table (for a match)
CREATE TABLE IF NOT EXISTS threads (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id BIGINT NOT NULL,
  CONSTRAINT fk_threads_match
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id    BIGINT NOT NULL,
  sender_ai_id BIGINT NOT NULL,
  message_text TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_messages_thread
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_ai_id) REFERENCES ai_profiles(id) ON DELETE CASCADE
);
