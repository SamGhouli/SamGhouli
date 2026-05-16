export type Role =
  | 'athlete'
  | 'coach'
  | 'assistant_coach'
  | 'physio'
  | 'strength_coach'
  | 'video_coordinator'
  | 'athletic_director'

export type AvailabilityStatus = 'full' | 'limited' | 'out'

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Team {
  id: string
  coach_id: string
  name: string
  age_group?: string
  sport?: string
  league?: string
  division?: string
  institution?: string
  logo_url?: string
  season_label?: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  team_id: string
  full_name: string
  role: Role
  jersey_number?: number
  position?: string
  year_of_study?: string
  avatar_color?: string
  initials?: string
  created_at: string
}

export interface ReadinessScore {
  id: string
  athlete_id: string
  team_id: string
  date: string
  physical_score: number
  sleep_score: number
  combined_score: number
  training_load: number
  hrv: number
  resting_hr: number
  sleep_hours: number
  strain: number
  wearable_source: string
  created_at: string
}

export interface WellnessCheckin {
  id: string
  athlete_id: string
  date: string
  mood_score: number
  stress_level: number
  energy_level: number
  notes: string
  mental_score: number
  created_at: string
}

export interface AthleteAvailability {
  id: string
  athlete_id: string
  team_id: string
  date: string
  status: AvailabilityStatus
  reason: string
  notes: string
  cleared_by: string
  created_at: string
}

export interface AcademicRecord {
  id: string
  athlete_id: string
  team_id: string
  gpa: number
  attendance_pct: number
  eligibility_status: 'ok' | 'review' | 'ineligible'
  flag_reason: string
  updated_at: string
}

export interface StaffNote {
  id: string
  athlete_id: string
  team_id: string
  author_id: string
  author_role: string
  note_text: string
  tags: string[]
  source: string
  is_private: boolean
  created_at: string
}

export interface Alert {
  id: string
  team_id: string
  athlete_id?: string
  alert_type: string
  severity: AlertSeverity
  message: string
  is_read: boolean
  created_at: string
}

export interface FilmSession {
  id: string
  team_id: string
  title: string
  session_type: string
  match_result?: string
  clip_count: number
  tagged_athlete_ids: string[]
  tags: string[]
  notes: string
  created_by: string
  session_date: string
  created_at: string
}

export interface TrainingSession {
  id: string
  team_id: string
  title: string
  session_type: string
  duration_mins: number
  avg_rpe: number
  intensity: string
  notes: string
  created_by: string
  session_date: string
  created_at: string
}

export interface MatchStat {
  id: string
  athlete_id: string
  team_id: string
  match_date: string
  opponent: string
  minutes_played: number
  goals: number
  assists: number
  rating: number
  notes: string
  created_at: string
}

export interface RecruitmentProspect {
  id: string
  team_id: string
  name: string
  position: string
  age: number
  current_club: string
  status: string
  notes: string
  academic_eligible: boolean
  created_by: string
  created_at: string
}

export interface TeamEvent {
  id: string
  team_id: string
  title: string
  event_type: string
  event_date: string
  start_time: string
  duration_mins: number
  location: string
  notes: string
  created_by: string
  created_at: string
}

export interface Therapist {
  id: string
  full_name: string
  specialisations: string[]
  bio: string
  availability_notes: string
  created_at: string
}

export interface TherapistMatch {
  id: string
  athlete_id: string
  therapist_id: string
  status: string
  matched_at: string
}

export interface TeamMentalAggregate {
  id: string
  team_id: string
  date: string
  avg_mental_score: number
  check_in_count: number
  total_athletes: number
  created_at: string
}

// ---------------------------------------------------------------------------
// Session Planner
// ---------------------------------------------------------------------------

export type SessionBlockType =
  | 'warm-up'
  | 'technical'
  | 'tactical'
  | 'physical'
  | 'set-pieces'
  | 'cool-down'

export type SessionType =
  | 'pre-match'
  | 'post-match'
  | 'recovery'
  | 'high-intensity'
  | 'technical'
  | 'tactical'
  | 'strength'
  | 'friendly'

export type BlockIntensity = 'low' | 'medium' | 'high'

export interface SessionBlockV2 {
  id: string
  type: SessionBlockType
  name: string
  durationMins: number
  intensity: BlockIntensity
  drills: string[]
  coachNotes: string
}

export interface SessionPlanV2 {
  id: string
  title: string
  date: string
  startTime: string
  venue: string
  sessionType: SessionType
  blocks: SessionBlockV2[]
  rpe?: number
  coachReflection?: string
  status: 'planned' | 'live' | 'completed'
}

export interface Incident {
  id: string
  timestamp: string
  description: string
  athleteId?: string
  confirmed: boolean
}

// ---------------------------------------------------------------------------
// Workload & Availability
// ---------------------------------------------------------------------------

export interface WorkloadEntry {
  id: string
  athleteId: string
  date: string
  durationMins: number
  rpe: number
  load: number
  sessionType: string
}

// ---------------------------------------------------------------------------
// Injury records
// ---------------------------------------------------------------------------

export type InjuryType = 'soft-tissue' | 'bone' | 'overuse' | 'illness' | 'contact' | 'other'
export type InjuryMechanism = 'training' | 'match' | 'unknown'
export type InjurySeverity = 1 | 2 | 3
export type RTPStage = 0 | 1 | 2 | 3

export interface InjuryRecord {
  id: string
  athleteId: string
  injuryType: InjuryType
  bodyLocation: string
  severity: InjurySeverity
  dateOfOnset: string
  mechanism: InjuryMechanism
  description: string
  expectedReturn: string
  treatmentPlan: string
  rtpStage: RTPStage
  stageEnteredAt: Partial<Record<number, string>>
}

export interface AvailabilityHistoryEntry {
  id: string
  athleteId: string
  date: string
  status: AvailabilityStatus
  restriction: string
  reason: string
  reasonCategory: string
  decisionMaker: string
  expectedReturn: string
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export type PlayerStatus = 'trial' | 'target' | 'committed' | 'current' | 'alumni'

export interface Player {
  id: string
  team_id: string
  first_name: string
  last_name: string
  position?: string
  jersey_number?: number
  date_of_birth?: string
  status: PlayerStatus
  source?: string
  last_contact_date?: string
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Player Touchpoints
// ---------------------------------------------------------------------------

export type TouchpointKind = 'observation' | 'contact' | 'trial_session' | 'other'

export interface PlayerTouchpoint {
  id: string
  player_id: string
  occurred_on: string
  note: string
  kind: TouchpointKind
  created_at: string
}

// ---------------------------------------------------------------------------
// Player Availability
// ---------------------------------------------------------------------------

export type AvailabilityState = 'fit' | 'monitor' | 'limited' | 'out'

export interface PlayerAvailability {
  id: string
  player_id: string
  state: AvailabilityState
  reason?: string
  effective_from: string
  effective_to?: string       // null = currently in effect
  created_at: string
}

// ---------------------------------------------------------------------------
// Drills
// ---------------------------------------------------------------------------

export type DrillIntensity = 'recovery' | 'low' | 'moderate' | 'high' | 'max'

export interface Drill {
  id: string
  owner_coach_id?: string
  owner_team_id?: string
  is_seed: boolean
  name: string
  description?: string
  duration_minutes?: number
  intensity?: DrillIntensity
  objectives: string[]
  age_groups: string[]
  created_at: string
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export type SessionStatus = 'planned' | 'completed' | 'cancelled'

export interface Session {
  id: string
  team_id: string
  scheduled_for: string
  title?: string
  tactical_focus?: string
  notes?: string
  status: SessionStatus
  created_at: string
}

// ---------------------------------------------------------------------------
// Session Blocks
// ---------------------------------------------------------------------------

export interface SessionBlock {
  id: string
  session_id: string
  drill_id?: string           // null = ad-hoc block
  order_index: number
  duration_minutes?: number
  intensity?: DrillIntensity
  coach_notes?: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Session Attendance
// ---------------------------------------------------------------------------

export type AttendanceStatus = 'attended' | 'partial' | 'absent' | 'modified'

export interface SessionAttendance {
  session_id: string
  player_id: string
  status: AttendanceStatus
}

// ---------------------------------------------------------------------------
// Load Scores
// ---------------------------------------------------------------------------

export interface LoadScore {
  id: string
  athlete_id: string
  team_id: string
  session_id?: string
  date: string
  duration_mins?: number
  rpe?: number
  session_load?: number
  acute_load?: number
  chronic_load?: number
  acwr?: number
  daily_load?: number
  weekly_load?: number
  training_monotony?: number
  training_strain?: number
  source?: string
  notes?: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Table map
// ---------------------------------------------------------------------------
//
//  teams                → Team
//  players              → Player
//  player_touchpoints   → PlayerTouchpoint
//  player_availability  → PlayerAvailability
//  drills               → Drill
//  sessions             → Session
//  session_blocks       → SessionBlock
//  session_attendance   → SessionAttendance
//  load_scores          → LoadScore
