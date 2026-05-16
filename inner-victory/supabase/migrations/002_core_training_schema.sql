-- Migration 002: Core training schema
-- Run in: Supabase Dashboard → SQL Editor

-- ============================================================
-- STEP 1 — Patch teams (add coach_id + age_group)
-- ============================================================

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS coach_id  UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS age_group TEXT;

-- ============================================================
-- STEP 2 — Replace old drills table
-- ============================================================

DROP TABLE IF EXISTS drills CASCADE;

CREATE TABLE drills (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_coach_id   UUID REFERENCES auth.users(id),
  owner_team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
  is_seed          BOOLEAN DEFAULT FALSE,
  name             TEXT NOT NULL,
  description      TEXT,
  duration_minutes INT,
  intensity        TEXT CHECK (intensity IN ('recovery', 'low', 'moderate', 'high', 'max')),
  objectives       TEXT[] DEFAULT '{}',
  age_groups       TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (owner_coach_id IS NOT NULL AND owner_team_id IS NULL AND is_seed = FALSE) OR
    (owner_coach_id IS NULL  AND owner_team_id IS NOT NULL AND is_seed = FALSE) OR
    (owner_coach_id IS NULL  AND owner_team_id IS NULL     AND is_seed = TRUE)
  )
);

ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drills_read"
  ON drills FOR SELECT
  USING (
    is_seed = TRUE OR
    owner_coach_id = auth.uid() OR
    owner_team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid())
  );

CREATE POLICY "drills_coach_insert"
  ON drills FOR INSERT
  WITH CHECK (
    owner_coach_id = auth.uid() OR
    owner_team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid())
  );

CREATE POLICY "drills_coach_update"
  ON drills FOR UPDATE
  USING (
    owner_coach_id = auth.uid() OR
    owner_team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid())
  );

CREATE POLICY "drills_coach_delete"
  ON drills FOR DELETE
  USING (
    owner_coach_id = auth.uid() OR
    owner_team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid())
  );

-- ============================================================
-- STEP 3 — Replace players view with proper table
-- ============================================================

DROP VIEW IF EXISTS players;

CREATE TABLE players (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  position          TEXT,
  jersey_number     INT,
  date_of_birth     DATE,
  status            TEXT NOT NULL DEFAULT 'current'
    CHECK (status IN ('trial', 'target', 'committed', 'current', 'alumni')),
  source            TEXT,
  last_contact_date DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_team_status ON players(team_id, status);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_coach_all"
  ON players FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid()));

-- ============================================================
-- STEP 4 — Player touchpoints
-- ============================================================

CREATE TABLE IF NOT EXISTS player_touchpoints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  occurred_on DATE NOT NULL,
  note        TEXT NOT NULL,
  kind        TEXT DEFAULT 'observation'
    CHECK (kind IN ('observation', 'contact', 'trial_session', 'other')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchpoints_player_date
  ON player_touchpoints(player_id, occurred_on DESC);

ALTER TABLE player_touchpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "touchpoints_coach_all"
  ON player_touchpoints FOR ALL
  USING (
    player_id IN (
      SELECT p.id FROM players p
      JOIN teams t ON t.id = p.team_id
      WHERE t.coach_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 5 — Player availability
-- ============================================================

CREATE TABLE IF NOT EXISTS player_availability (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id      UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  state          TEXT NOT NULL
    CHECK (state IN ('fit', 'monitor', 'limited', 'out')),
  reason         TEXT,
  effective_from DATE NOT NULL,
  effective_to   DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_player_current
  ON player_availability(player_id) WHERE effective_to IS NULL;

ALTER TABLE player_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_coach_all"
  ON player_availability FOR ALL
  USING (
    player_id IN (
      SELECT p.id FROM players p
      JOIN teams t ON t.id = p.team_id
      WHERE t.coach_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 6 — Sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id        UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  scheduled_for  TIMESTAMPTZ NOT NULL,
  title          TEXT,
  tactical_focus TEXT,
  notes          TEXT,
  status         TEXT DEFAULT 'planned'
    CHECK (status IN ('planned', 'completed', 'cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_team_date
  ON sessions(team_id, scheduled_for DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_coach_all"
  ON sessions FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid()));

-- ============================================================
-- STEP 7 — Session blocks
-- ============================================================

CREATE TABLE IF NOT EXISTS session_blocks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  drill_id         UUID REFERENCES drills(id),
  order_index      INT NOT NULL,
  duration_minutes INT,
  intensity        TEXT CHECK (intensity IN ('recovery', 'low', 'moderate', 'high', 'max')),
  coach_notes      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocks_session_order
  ON session_blocks(session_id, order_index);

ALTER TABLE session_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocks_coach_all"
  ON session_blocks FOR ALL
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN teams t ON t.id = s.team_id
      WHERE t.coach_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 8 — Session attendance
-- ============================================================

CREATE TABLE IF NOT EXISTS session_attendance (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status     TEXT DEFAULT 'attended'
    CHECK (status IN ('attended', 'partial', 'absent', 'modified')),
  PRIMARY KEY (session_id, player_id)
);

ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_coach_all"
  ON session_attendance FOR ALL
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN teams t ON t.id = s.team_id
      WHERE t.coach_id = auth.uid()
    )
  );
