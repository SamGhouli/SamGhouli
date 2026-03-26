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
  name: string
  sport: string
  league: string
  institution: string
  season_label: string
  created_at: string
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
