-- Migration: Add drills, load_scores tables and players view
-- Run this in: Supabase Dashboard → SQL Editor

-- ============================================================
-- DRILLS
-- ============================================================

CREATE TABLE IF NOT EXISTS drills (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES users(id),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'technical',
  intensity       TEXT NOT NULL DEFAULT 'medium' CHECK (intensity IN ('low', 'medium', 'high')),
  duration_mins   INT,
  players_required INT,
  equipment       TEXT[],
  tags            TEXT[],
  video_url       TEXT,
  thumbnail_url   TEXT,
  is_archived     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drills_team ON drills(team_id);
CREATE INDEX IF NOT EXISTS idx_drills_category ON drills(category);

CREATE OR REPLACE TRIGGER trg_drills_updated_at
  BEFORE UPDATE ON drills
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drills_team_read"
  ON drills FOR SELECT
  USING (team_id = auth_user_team_id() OR team_id IS NULL);

CREATE POLICY "drills_staff_write"
  ON drills FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "drills_staff_update"
  ON drills FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ============================================================
-- LOAD SCORES
-- ============================================================

CREATE TABLE IF NOT EXISTS load_scores (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES training_sessions(id) ON DELETE SET NULL,
  date              DATE NOT NULL,
  duration_mins     INT,
  rpe               INT CHECK (rpe BETWEEN 1 AND 10),
  session_load      NUMERIC(8,2),
  acute_load        NUMERIC(8,2),
  chronic_load      NUMERIC(8,2),
  acwr              NUMERIC(5,3),
  daily_load        NUMERIC(8,2),
  weekly_load       NUMERIC(8,2),
  training_monotony NUMERIC(5,3),
  training_strain   NUMERIC(8,2),
  source            TEXT DEFAULT 'manual',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, date, session_id)
);

CREATE INDEX IF NOT EXISTS idx_load_scores_athlete_date ON load_scores(athlete_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_load_scores_team_date ON load_scores(team_id, date DESC);

ALTER TABLE load_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "load_scores_athlete_read_own"
  ON load_scores FOR SELECT
  USING (athlete_id = auth_user_id());

CREATE POLICY "load_scores_staff_read_team"
  ON load_scores FOR SELECT
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "load_scores_athlete_insert"
  ON load_scores FOR INSERT
  WITH CHECK (athlete_id = auth_user_id());

CREATE POLICY "load_scores_staff_write"
  ON load_scores FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "load_scores_staff_update"
  ON load_scores FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ============================================================
-- PLAYERS VIEW
-- ============================================================

CREATE OR REPLACE VIEW players AS
  SELECT
    u.id,
    u.auth_id,
    u.team_id,
    u.full_name,
    u.email,
    u.jersey_number,
    u.position,
    u.avatar_url,
    u.date_of_birth,
    u.year_of_study,
    u.wearable_source,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM users u
  WHERE u.role = 'athlete';
