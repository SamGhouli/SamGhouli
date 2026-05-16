-- Inner Victory Database Schema
-- Platform: Supabase (PostgreSQL)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'staff', 'admin');
CREATE TYPE availability_status AS ENUM ('full', 'limited', 'unavailable');
CREATE TYPE alert_type AS ENUM (
  'declining_trend',
  'availability_change',
  'academic_flag',
  'injury_flag',
  'mental_health_flag',
  'low_readiness'
);
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE session_type AS ENUM ('strength', 'cardio', 'recovery', 'tactical', 'match_prep', 'other');
CREATE TYPE prospect_status AS ENUM ('identified', 'contacted', 'evaluating', 'offered', 'committed', 'declined');

-- ============================================================
-- TEAMS
-- ============================================================

CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id      UUID NOT NULL REFERENCES auth.users(id),
  name          TEXT NOT NULL,
  age_group     TEXT,                    -- "U17", "U SPORTS Men", etc.
  sport         TEXT,
  league        TEXT,
  division      TEXT,
  institution   TEXT,
  logo_url      TEXT,
  season_label  TEXT,
  timezone      TEXT NOT NULL DEFAULT 'America/Toronto',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS (athletes, coaches, staff)
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id         UUID UNIQUE,                  -- references auth.users(id)
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'athlete',
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  jersey_number   INT,
  position        TEXT,
  avatar_url      TEXT,
  date_of_birth   DATE,
  year_of_study   INT,                          -- academic year (1–4+)
  wearable_source       TEXT DEFAULT 'manual',       -- 'whoop', 'oura', 'garmin', 'apple_health', 'manual'
  whoop_access_token    TEXT,
  whoop_refresh_token   TEXT,
  oura_access_token     TEXT,
  garmin_access_token   TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================================================
-- READINESS SCORES
-- ============================================================

CREATE TABLE readiness_scores (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id               UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  overall_score         NUMERIC(5,2),
  physical_score        NUMERIC(5,2),
  sleep_score           NUMERIC(5,2),
  mental_score          NUMERIC(5,2),
  -- HRV data
  hrv                   NUMERIC(6,2),
  hrv_baseline          NUMERIC(6,2),
  -- Heart rate
  resting_hr            NUMERIC(5,2),
  resting_hr_baseline   NUMERIC(5,2),
  -- Combined / derived
  combined_score        NUMERIC(5,2),
  training_load         NUMERIC(5,2),
  sleep_hours           NUMERIC(4,2),
  -- Strain (0–21 Whoop-style scale)
  strain                NUMERIC(4,2),
  -- Metadata
  wearable_source       TEXT DEFAULT 'manual',  -- 'whoop', 'garmin', 'oura', 'manual'
  data_source           TEXT DEFAULT 'manual',  -- legacy alias
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, date)
);

CREATE INDEX idx_readiness_athlete_date ON readiness_scores(athlete_id, date DESC);
CREATE INDEX idx_readiness_team_date ON readiness_scores(team_id, date DESC);

-- ============================================================
-- WELLNESS CHECK-INS
-- ============================================================

CREATE TABLE wellness_checkins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  -- Subjective scores (1–10)
  mood_score      INT CHECK (mood_score BETWEEN 1 AND 10),
  energy_level    INT CHECK (energy_level BETWEEN 1 AND 10),
  stress_level    INT CHECK (stress_level BETWEEN 1 AND 10),
  sleep_hours     NUMERIC(4,2),
  sleep_quality   INT CHECK (sleep_quality BETWEEN 1 AND 10),
  -- Derived mental score (0–100)
  mental_score    NUMERIC(5,2),
  -- Flags
  has_soreness    BOOLEAN DEFAULT FALSE,
  soreness_areas  TEXT[],
  has_illness     BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, date)
);

CREATE INDEX idx_checkins_athlete_date ON wellness_checkins(athlete_id, date DESC);
CREATE INDEX idx_checkins_team_date ON wellness_checkins(team_id, date DESC);

-- ============================================================
-- TEAM MENTAL AGGREGATES (anonymised daily team summaries)
-- ============================================================

CREATE TABLE team_mental_aggregates (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id               UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  avg_mood              NUMERIC(4,2),
  avg_energy            NUMERIC(4,2),
  avg_stress            NUMERIC(4,2),
  avg_sleep_hours       NUMERIC(4,2),
  avg_sleep_quality     NUMERIC(4,2),
  avg_mental_score      NUMERIC(5,2),               -- derived 0–100 score
  response_count        INT DEFAULT 0,
  check_in_count        INT DEFAULT 0,              -- alias for response_count
  total_athletes        INT DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, date)
);

CREATE INDEX idx_team_mental_team_date ON team_mental_aggregates(team_id, date DESC);

-- ============================================================
-- ATHLETE AVAILABILITY
-- ============================================================

CREATE TABLE athlete_availability (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  status          availability_status NOT NULL DEFAULT 'full',
  reason          TEXT,
  restrictions    TEXT[],
  cleared_by      UUID REFERENCES users(id),
  cleared_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, date)
);

CREATE INDEX idx_availability_athlete_date ON athlete_availability(athlete_id, date DESC);
CREATE INDEX idx_availability_team_date ON athlete_availability(team_id, date DESC);

-- ============================================================
-- ACADEMIC RECORDS
-- ============================================================

CREATE TABLE academic_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  term            TEXT NOT NULL DEFAULT 'Current',
  gpa             NUMERIC(3,2),
  attendance_pct  NUMERIC(5,2),
  credits_taken   INT,
  credits_passed  INT,
  eligibility_status TEXT NOT NULL DEFAULT 'ok' CHECK (eligibility_status IN ('ok', 'review', 'ineligible')),
  is_flagged      BOOLEAN DEFAULT FALSE,
  flag_reason     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_academic_athlete ON academic_records(athlete_id);

-- ============================================================
-- STAFF NOTES (private notes on athletes)
-- ============================================================

CREATE TABLE staff_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_private      BOOLEAN DEFAULT TRUE,   -- only visible to staff
  tags            TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_athlete ON staff_notes(athlete_id);
CREATE INDEX idx_notes_author ON staff_notes(author_id);

-- ============================================================
-- FILM SESSIONS
-- ============================================================

CREATE TABLE film_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id             UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by          UUID NOT NULL REFERENCES users(id),
  title               TEXT NOT NULL,
  description         TEXT,
  session_type        TEXT NOT NULL DEFAULT 'other',  -- 'match_review', 'opposition_scout', 'training_clip', 'highlight', 'other'
  match_result        TEXT,                           -- e.g. 'W 3-1 vs Laurier'
  clip_count          INT DEFAULT 0,
  tagged_athlete_ids  UUID[] DEFAULT '{}',
  video_url           TEXT,
  thumbnail_url       TEXT,
  duration_mins       INT,
  session_date        DATE,
  tags                TEXT[],
  notes               TEXT,
  is_published        BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_film_team ON film_sessions(team_id);

-- ============================================================
-- TRAINING SESSIONS
-- ============================================================

CREATE TABLE training_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES users(id),
  title             TEXT NOT NULL,
  session_type      session_type NOT NULL DEFAULT 'other',
  session_date      DATE NOT NULL,
  start_time        TIME,
  duration_mins     INT,
  location          TEXT,
  description       TEXT,
  rpe_target        INT CHECK (rpe_target BETWEEN 1 AND 10),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_team_date ON training_sessions(team_id, session_date DESC);

-- Training session attendance
CREATE TABLE training_attendance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attended        BOOLEAN DEFAULT TRUE,
  rpe_actual      INT CHECK (rpe_actual BETWEEN 1 AND 10),
  notes           TEXT,
  UNIQUE (session_id, athlete_id)
);

-- ============================================================
-- MATCH STATS
-- ============================================================

CREATE TABLE match_stats (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  athlete_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_date        DATE NOT NULL,
  opponent          TEXT,
  venue             TEXT,
  is_home           BOOLEAN DEFAULT TRUE,
  -- Generic stats (sport-agnostic key-value)
  stats             JSONB DEFAULT '{}',
  minutes_played    INT,
  started           BOOLEAN DEFAULT FALSE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_match_stats_athlete ON match_stats(athlete_id, match_date DESC);
CREATE INDEX idx_match_stats_team ON match_stats(team_id, match_date DESC);

-- ============================================================
-- RECRUITMENT PROSPECTS
-- ============================================================

CREATE TABLE recruitment_prospects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  added_by        UUID NOT NULL REFERENCES users(id),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  position        TEXT,
  grad_year       INT,
  current_school  TEXT,
  location        TEXT,
  status          prospect_status NOT NULL DEFAULT 'identified',
  priority        INT DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),  -- 1=highest
  notes           TEXT,
  video_urls      TEXT[],
  tags            TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prospects_team ON recruitment_prospects(team_id);
CREATE INDEX idx_prospects_status ON recruitment_prospects(status);

-- ============================================================
-- THERAPISTS
-- ============================================================

CREATE TABLE therapists (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID REFERENCES teams(id),   -- NULL = platform therapist
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  specialization  TEXT[],
  bio             TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- THERAPIST MATCHES (athlete ↔ therapist assignments)
-- ============================================================

CREATE TABLE therapist_matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_id    UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  assigned_by     UUID REFERENCES users(id),
  matched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  UNIQUE (athlete_id, therapist_id)
);

CREATE INDEX idx_therapist_matches_athlete ON therapist_matches(athlete_id);

-- ============================================================
-- TEAM EVENTS (calendar)
-- ============================================================

CREATE TABLE team_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT NOT NULL DEFAULT 'other',  -- 'match', 'training', 'film', 'recovery', 'meeting', 'medical', 'other'
  event_date      DATE NOT NULL,
  start_time      TEXT,                            -- e.g. "07:30" (HH:MM)
  duration_mins   INT,
  location        TEXT,
  opponent        TEXT,
  notes           TEXT,
  is_mandatory    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_team_date ON team_events(team_id, event_date);

-- ============================================================
-- ALERTS
-- ============================================================

CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  athlete_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type      alert_type NOT NULL,
  severity        alert_severity NOT NULL DEFAULT 'warning',
  title           TEXT NOT NULL,
  message         TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  is_resolved     BOOLEAN DEFAULT FALSE,
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_team ON alerts(team_id, created_at DESC);
CREATE INDEX idx_alerts_athlete ON alerts(athlete_id, created_at DESC);
CREATE INDEX idx_alerts_unread ON alerts(team_id, is_read, is_resolved);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_availability_updated_at
  BEFORE UPDATE ON athlete_availability
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_film_updated_at
  BEFORE UPDATE ON film_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_training_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_prospects_updated_at
  BEFORE UPDATE ON recruitment_prospects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON staff_notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON team_events
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_mental_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's record
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: get current user's team_id
CREATE OR REPLACE FUNCTION auth_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: is current user staff or coach
CREATE OR REPLACE FUNCTION is_staff_or_above()
RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('coach', 'staff', 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ---- TEAMS ----
CREATE POLICY "team_members_read_own_team"
  ON teams FOR SELECT
  USING (id = auth_user_team_id());

-- ---- USERS ----
-- Athletes can read other members of their own team
CREATE POLICY "users_read_same_team"
  ON users FOR SELECT
  USING (team_id = auth_user_team_id());

-- Athletes can update their own record
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth_user_id());

-- Staff/coaches can update any user in their team
CREATE POLICY "staff_update_team_users"
  ON users FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- READINESS SCORES ----
-- Athletes read their own scores
CREATE POLICY "readiness_athlete_read_own"
  ON readiness_scores FOR SELECT
  USING (athlete_id = auth_user_id());

-- Coaches/staff read all scores for their team
CREATE POLICY "readiness_staff_read_team"
  ON readiness_scores FOR SELECT
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- Athletes insert/update their own scores
CREATE POLICY "readiness_athlete_insert"
  ON readiness_scores FOR INSERT
  WITH CHECK (athlete_id = auth_user_id());

CREATE POLICY "readiness_athlete_update"
  ON readiness_scores FOR UPDATE
  USING (athlete_id = auth_user_id());

-- ---- WELLNESS CHECK-INS ----
CREATE POLICY "checkins_athlete_read_own"
  ON wellness_checkins FOR SELECT
  USING (athlete_id = auth_user_id());

CREATE POLICY "checkins_staff_read_team"
  ON wellness_checkins FOR SELECT
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "checkins_athlete_insert"
  ON wellness_checkins FOR INSERT
  WITH CHECK (athlete_id = auth_user_id());

CREATE POLICY "checkins_athlete_update"
  ON wellness_checkins FOR UPDATE
  USING (athlete_id = auth_user_id());

-- ---- TEAM MENTAL AGGREGATES ----
-- All team members can read (data is anonymised)
CREATE POLICY "mental_aggregates_team_read"
  ON team_mental_aggregates FOR SELECT
  USING (team_id = auth_user_team_id());

-- Only staff can write
CREATE POLICY "mental_aggregates_staff_write"
  ON team_mental_aggregates FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- ATHLETE AVAILABILITY ----
CREATE POLICY "availability_team_read"
  ON athlete_availability FOR SELECT
  USING (team_id = auth_user_team_id());

CREATE POLICY "availability_staff_write"
  ON athlete_availability FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "availability_staff_update"
  ON athlete_availability FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- ACADEMIC RECORDS ----
-- Athletes read their own
CREATE POLICY "academic_athlete_read_own"
  ON academic_records FOR SELECT
  USING (athlete_id = auth_user_id());

-- Staff read all in team
CREATE POLICY "academic_staff_read_team"
  ON academic_records FOR SELECT
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "academic_staff_write"
  ON academic_records FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "academic_staff_update"
  ON academic_records FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- STAFF NOTES ----
-- Only staff can read/write notes
CREATE POLICY "notes_staff_read"
  ON staff_notes FOR SELECT
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "notes_staff_write"
  ON staff_notes FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "notes_author_update"
  ON staff_notes FOR UPDATE
  USING (author_id = auth_user_id() AND is_staff_or_above());

-- ---- FILM SESSIONS ----
CREATE POLICY "film_team_read"
  ON film_sessions FOR SELECT
  USING (team_id = auth_user_team_id());

CREATE POLICY "film_staff_write"
  ON film_sessions FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "film_staff_update"
  ON film_sessions FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- TRAINING SESSIONS ----
CREATE POLICY "training_team_read"
  ON training_sessions FOR SELECT
  USING (team_id = auth_user_team_id());

CREATE POLICY "training_staff_write"
  ON training_sessions FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- TRAINING ATTENDANCE ----
CREATE POLICY "attendance_team_read"
  ON training_attendance FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM training_sessions WHERE team_id = auth_user_team_id()
    )
  );

-- ---- MATCH STATS ----
CREATE POLICY "match_stats_athlete_read_own"
  ON match_stats FOR SELECT
  USING (athlete_id = auth_user_id());

CREATE POLICY "match_stats_staff_read_team"
  ON match_stats FOR SELECT
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "match_stats_staff_write"
  ON match_stats FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- RECRUITMENT PROSPECTS ----
CREATE POLICY "prospects_staff_only"
  ON recruitment_prospects FOR ALL
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- THERAPISTS ----
CREATE POLICY "therapists_team_read"
  ON therapists FOR SELECT
  USING (team_id = auth_user_team_id() OR team_id IS NULL);

-- ---- THERAPIST MATCHES ----
CREATE POLICY "therapist_matches_athlete_read_own"
  ON therapist_matches FOR SELECT
  USING (athlete_id = auth_user_id());

CREATE POLICY "therapist_matches_staff_read_team"
  ON therapist_matches FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM users WHERE team_id = auth_user_team_id()
    ) AND is_staff_or_above()
  );

CREATE POLICY "therapist_matches_staff_write"
  ON therapist_matches FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM users WHERE team_id = auth_user_team_id()
    ) AND is_staff_or_above()
  );

-- ---- TEAM EVENTS ----
CREATE POLICY "events_team_read"
  ON team_events FOR SELECT
  USING (team_id = auth_user_team_id());

CREATE POLICY "events_staff_write"
  ON team_events FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "events_staff_update"
  ON team_events FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ---- ALERTS ----
CREATE POLICY "alerts_staff_read"
  ON alerts FOR SELECT
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "alerts_staff_write"
  ON alerts FOR INSERT
  WITH CHECK (team_id = auth_user_team_id() AND is_staff_or_above());

CREATE POLICY "alerts_staff_update"
  ON alerts FOR UPDATE
  USING (team_id = auth_user_team_id() AND is_staff_or_above());

-- ============================================================
-- DRILLS
-- ============================================================

-- Drills: coach-owned, team-owned, or seed (public read-only)
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
    (owner_coach_id IS NULL AND owner_team_id IS NOT NULL AND is_seed = FALSE) OR
    (owner_coach_id IS NULL AND owner_team_id IS NULL AND is_seed = TRUE)
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
  WITH CHECK (owner_coach_id = auth.uid() OR owner_team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid()));

CREATE POLICY "drills_coach_update"
  ON drills FOR UPDATE
  USING (owner_coach_id = auth.uid() OR owner_team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid()));

CREATE POLICY "drills_coach_delete"
  ON drills FOR DELETE
  USING (owner_coach_id = auth.uid() OR owner_team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid()));

-- ============================================================
-- LOAD SCORES  (daily training load per athlete)
-- ============================================================

CREATE TABLE load_scores (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES training_sessions(id) ON DELETE SET NULL,
  date              DATE NOT NULL,
  -- Session metrics
  duration_mins     INT,
  rpe               INT CHECK (rpe BETWEEN 1 AND 10),      -- rate of perceived exertion
  session_load      NUMERIC(8,2),                           -- rpe × duration_mins
  -- Cumulative load windows
  acute_load        NUMERIC(8,2),                           -- 7-day rolling average
  chronic_load      NUMERIC(8,2),                           -- 28-day rolling average
  acwr              NUMERIC(5,3),                           -- acute:chronic workload ratio
  -- Monotony & strain
  daily_load        NUMERIC(8,2),
  weekly_load       NUMERIC(8,2),
  training_monotony NUMERIC(5,3),
  training_strain   NUMERIC(8,2),
  -- Source
  source            TEXT DEFAULT 'manual',                  -- 'manual', 'wearable', 'calculated'
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, date, session_id)
);

CREATE INDEX idx_load_scores_athlete_date ON load_scores(athlete_id, date DESC);
CREATE INDEX idx_load_scores_team_date ON load_scores(team_id, date DESC);

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
-- PLAYERS
-- ============================================================

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
-- PLAYER TOUCHPOINTS
-- ============================================================

CREATE TABLE player_touchpoints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  occurred_on DATE NOT NULL,
  note        TEXT NOT NULL,
  kind        TEXT DEFAULT 'observation'
    CHECK (kind IN ('observation', 'contact', 'trial_session', 'other')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_touchpoints_player_date ON player_touchpoints(player_id, occurred_on DESC);

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
-- PLAYER AVAILABILITY
-- ============================================================

CREATE TABLE player_availability (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id      UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  state          TEXT NOT NULL
    CHECK (state IN ('fit', 'monitor', 'limited', 'out')),
  reason         TEXT,
  effective_from DATE NOT NULL,
  effective_to   DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_player_current
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
-- SESSIONS
-- ============================================================

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  scheduled_for   TIMESTAMPTZ NOT NULL,
  title           TEXT,
  tactical_focus  TEXT,
  notes           TEXT,
  status          TEXT DEFAULT 'planned'
    CHECK (status IN ('planned', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_team_date ON sessions(team_id, scheduled_for DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_coach_all"
  ON sessions FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE coach_id = auth.uid()));

-- ============================================================
-- SESSION BLOCKS
-- ============================================================

CREATE TABLE session_blocks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  drill_id         UUID REFERENCES drills(id),
  order_index      INT NOT NULL,
  duration_minutes INT,
  intensity        TEXT CHECK (intensity IN ('recovery', 'low', 'moderate', 'high', 'max')),
  coach_notes      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocks_session_order ON session_blocks(session_id, order_index);

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
-- SESSION ATTENDANCE
-- ============================================================

CREATE TABLE session_attendance (
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'attended'
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
