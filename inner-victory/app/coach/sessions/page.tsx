'use client'

import { useState } from 'react'
import { TopBar } from '@/components/shared/TopBar'
import {
  ClipboardList, BookOpen, MessageSquare, ChevronDown, ChevronUp,
  Plus, Tag, User, Clock, CheckCircle2, Circle, Zap, Target, AlignLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Drill {
  order: number
  name: string
  duration: number
  notes: string
}

interface SessionPlan {
  id: string
  date: string
  title: string
  type: string
  intensity: 'low' | 'moderate' | 'high'
  duration: number
  objectives: string[]
  drills: Drill[]
  playerNotes: string
  status: 'planned' | 'completed'
}

interface WeekPlan {
  week: string
  theme: string
  sessions: number
  focus: string[]
  completed: boolean
  current?: boolean
}

interface CoachNote {
  id: string
  sessionDate: string
  sessionTitle: string
  timestamp: string
  note: string
  tags: string[]
  athletes: string[]
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const CURRENT_PHASE = {
  name: 'Playoffs Prep',
  period: 'Mar – Apr 2026',
  weekNumber: 3,
  totalWeeks: 6,
  focus: ['High press patterns', 'Set piece organisation', 'Transition speed', 'Squad rotation management'],
  nextPhase: 'Conference Playoffs (Apr–May)',
}

const WEEKLY_PLAN: WeekPlan[] = [
  {
    week: 'Week 1 · Mar 8–14',
    theme: 'Tactical Re-Set',
    sessions: 4,
    focus: ['Defensive shape review', 'Wide press triggers', '4-3-3 vs 3-5-2 scenarios'],
    completed: true,
  },
  {
    week: 'Week 2 · Mar 15–21',
    theme: 'Match Load + Recovery',
    sessions: 3,
    focus: ['Match vs. Laurier (W 3-1)', 'Post-match recovery', 'Set piece refinement'],
    completed: true,
  },
  {
    week: 'Week 3 · Mar 22–28',
    theme: 'Match Prep — Western',
    sessions: 4,
    focus: ['High press patterns', 'Opposition scout integration', 'Match fitness', 'Pre-match activation'],
    completed: false,
    current: true,
  },
  {
    week: 'Week 4 · Mar 29 – Apr 4',
    theme: 'Recovery + Queens Prep',
    sessions: 4,
    focus: ['Post-match recovery', 'Queens opposition analysis', 'Set piece focus', 'Home advantage tactics'],
    completed: false,
  },
  {
    week: 'Week 5 · Apr 5–11',
    theme: 'Sharpness Block',
    sessions: 3,
    focus: ['High intensity sharpness', 'Squad competition', 'Mental resilience'],
    completed: false,
  },
  {
    week: 'Week 6 · Apr 12–18',
    theme: 'Taper & Playoffs Entry',
    sessions: 2,
    focus: ['Reduced load, maintained sharpness', 'Finalize set pieces', 'Team cohesion'],
    completed: false,
  },
]

const SESSION_PLANS: SessionPlan[] = [
  {
    id: 'sp-001',
    date: '2026-03-22',
    title: 'High Press Pattern Work',
    type: 'Tactical',
    intensity: 'moderate',
    duration: 90,
    objectives: [
      'Establish consistent pressing triggers from front three',
      'Improve second-ball recovery to defensive shape',
      'Compact press against wide formations',
    ],
    drills: [
      { order: 1, name: 'Rondo Activation (4v2)', duration: 10, notes: 'Warm-up / activation — keep tempo high.' },
      { order: 2, name: 'Pressing Triggers Walkthrough', duration: 15, notes: 'Shadow work. Coach narrates trigger moments.' },
      { order: 3, name: '5v5+2 Press & Counter', duration: 20, notes: 'High intensity. Track press success rate live.' },
      { order: 4, name: '8v8 Defensive Shape vs Wide Play', duration: 25, notes: 'Block compactness focus. GK leads distribution.' },
      { order: 5, name: 'Full Press Scenario (11v8)', duration: 15, notes: 'Integrate all press triggers. Score = press won.' },
      { order: 6, name: 'Cool-down & Debrief', duration: 5, notes: 'Review press success. Key messages for match day.' },
    ],
    playerNotes: 'Jordan (GK) limited — adjust GK-out build-up drills. Elena — monitor hamstring in sprint elements.',
    status: 'planned',
  },
  {
    id: 'sp-002',
    date: '2026-03-24',
    title: 'Pre-Match Activation — Western Away',
    type: 'Match Prep',
    intensity: 'low',
    duration: 60,
    objectives: [
      'Sharpen touch and movement patterns before the Western match',
      'Rehearse set pieces — corners and defensive throws',
      'Keep legs fresh — quality over quantity',
    ],
    drills: [
      { order: 1, name: 'Dynamic Warm-Up', duration: 10, notes: '' },
      { order: 2, name: 'One-Touch Passing Patterns', duration: 15, notes: 'Keep it crisp. Pair up by position.' },
      { order: 3, name: 'Attacking Corner Routines (×4 variants)', duration: 15, notes: 'Run A, B, C and short — 100% accuracy target.' },
      { order: 4, name: 'Shadow Play — Final Third', duration: 15, notes: 'No opposition. Shape and timing only.' },
      { order: 5, name: 'Defensive Set Pieces Walkthrough', duration: 5, notes: 'Corners and free kicks. No contact.' },
    ],
    playerNotes: 'Full squad expected. Keep intensity low — we travel at 09:00 Thursday.',
    status: 'planned',
  },
]

const COACH_NOTES: CoachNote[] = [
  {
    id: 'cn-001',
    sessionDate: '2026-03-20',
    sessionTitle: 'High-Intensity Interval Block',
    timestamp: '2026-03-20T10:45:00Z',
    note: 'Marcus and Priya were outstanding in the sprint repeats — best split times of the season. Amara visibly fatigued by the 45-minute mark — pulled from the final block. Need to monitor closely ahead of Wednesday.',
    tags: ['performance', 'fatigue', 'monitoring'],
    athletes: ['Marcus Thompson', 'Priya Sharma', 'Amara Diallo'],
  },
  {
    id: 'cn-002',
    sessionDate: '2026-03-19',
    sessionTitle: 'Tactical Shape & Set Pieces',
    timestamp: '2026-03-19T10:00:00Z',
    note: 'Set piece delivery from Liam was excellent — scored on both corner variants in practice. Defensive block shape has improved significantly. Jordan had a wobble on the short corner scenario — will run it again Thursday.',
    tags: ['set-pieces', 'positive', 'goalkeeper'],
    athletes: ['Liam Okafor', 'Jordan Casey'],
  },
  {
    id: 'cn-003',
    sessionDate: '2026-03-18',
    sessionTitle: 'Recovery Activation',
    timestamp: '2026-03-18T09:30:00Z',
    note: 'Light session post-travel. Energy levels low across the board — expected. Used the session for individual conversations. Devonte mentioned tight quad — flagged to physio for assessment.',
    tags: ['recovery', 'health'],
    athletes: ['Devonte Williams'],
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const INTENSITY_CONFIG = {
  low: { label: 'Low', className: 'text-green bg-green/10 border-green/20' },
  moderate: { label: 'Moderate', className: 'text-amber bg-amber/10 border-amber/20' },
  high: { label: 'High', className: 'text-rose bg-rose/10 border-rose/20' },
}

const TAB_ITEMS = [
  { id: 'planner', label: 'Session Planner', icon: ClipboardList },
  { id: 'plan', label: 'Training Plan', icon: Target },
  { id: 'notes', label: 'Coach Notes', icon: MessageSquare },
]

function SessionCard({
  session,
  selected,
  onClick,
}: {
  session: SessionPlan
  selected: boolean
  onClick: () => void
}) {
  const cfg = INTENSITY_CONFIG[session.intensity]
  const d = new Date(session.date)
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-colors',
        selected
          ? 'border-lime bg-lime/10'
          : 'border-border-1 bg-surface-2 hover:bg-surface-3/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-text-primary truncate">{session.title}</div>
          <div className="mt-0.5 text-[10px] text-text-muted">
            {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' · '}{session.type}{' · '}{session.duration} min
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
          {cfg.label}
        </span>
      </div>
    </button>
  )
}

function SessionDetail({ session }: { session: SessionPlan }) {
  const [open, setOpen] = useState(false)
  const cfg = INTENSITY_CONFIG[session.intensity]
  const d = new Date(session.date)

  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{session.title}</h3>
          <p className="mt-0.5 text-xs text-text-muted">
            {d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}{session.type}{' · '}{session.duration} min
          </p>
        </div>
        <span className={`shrink-0 inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
          {cfg.label} intensity
        </span>
      </div>

      {/* Objectives */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
          <Target className="h-3 w-3" /> Objectives
        </div>
        <ul className="space-y-1.5">
          {session.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-text-primary">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime" />
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* Drill Sequence */}
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex w-full items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wide mb-2"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Drill Sequence ({session.drills.length} drills · {session.duration} min total)
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {open && (
          <div className="space-y-2">
            {session.drills.map((drill) => (
              <div
                key={drill.order}
                className="flex items-start gap-3 rounded-lg bg-surface-3/60 px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/20 text-[10px] font-bold text-lime">
                  {drill.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-text-primary">{drill.name}</span>
                    <span className="shrink-0 text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />{drill.duration} min
                    </span>
                  </div>
                  {drill.notes && (
                    <p className="mt-0.5 text-[11px] text-text-muted">{drill.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player Notes */}
      {session.playerNotes && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
            <User className="h-3 w-3" /> Player Notes
          </div>
          <p className="text-xs text-text-muted rounded-lg bg-surface-3/60 px-3 py-2.5">
            {session.playerNotes}
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function TrainingSessionsPage() {
  const [activeTab, setActiveTab] = useState<'planner' | 'plan' | 'notes'>('planner')
  const [selectedSession, setSelectedSession] = useState<SessionPlan>(SESSION_PLANS[0])
  const [newNote, setNewNote] = useState('')
  const [localNotes, setLocalNotes] = useState<CoachNote[]>(COACH_NOTES)

  function handleAddNote() {
    if (!newNote.trim()) return
    const note: CoachNote = {
      id: `cn-new-${Date.now()}`,
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTitle: 'Live Session Note',
      timestamp: new Date().toISOString(),
      note: newNote.trim(),
      tags: ['live'],
      athletes: [],
    }
    setLocalNotes([note, ...localNotes])
    setNewNote('')
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Training Sessions"
        subtitle="Session planning, progressive plans, and live coaching notes"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Tab Bar */}
        <div className="flex gap-1 border-b border-border-1 bg-surface-1 px-6 pt-2">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-lime text-lime bg-lime/5'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6 space-y-6">

          {/* ----------------------------------------------------------------
              TAB: Session Planner
          ---------------------------------------------------------------- */}
          {activeTab === 'planner' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px,1fr]">
              {/* Left: Session list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Planned Sessions
                  </h2>
                  <button className="flex items-center gap-1 rounded-lg border border-border-1 px-2.5 py-1.5 text-[10px] font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary">
                    <Plus className="h-3 w-3" /> New
                  </button>
                </div>
                {SESSION_PLANS.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    selected={selectedSession.id === s.id}
                    onClick={() => setSelectedSession(s)}
                  />
                ))}
                <div className="rounded-xl border border-dashed border-border-2 p-4 text-center">
                  <p className="text-[11px] text-text-faint">
                    More sessions from your calendar will appear here as you add them.
                  </p>
                </div>
              </div>

              {/* Right: Session detail */}
              <SessionDetail session={selectedSession} />
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB: Training Plan
          ---------------------------------------------------------------- */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              {/* Phase Banner */}
              <div className="rounded-xl border border-lime/30 bg-lime/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-lime">
                      Current Phase
                    </div>
                    <h2 className="mt-1 text-lg font-bold text-text-primary font-display">
                      {CURRENT_PHASE.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-text-muted">{CURRENT_PHASE.period}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold tabular-nums text-lime">
                      {CURRENT_PHASE.weekNumber}
                      <span className="text-sm font-normal text-text-muted"> / {CURRENT_PHASE.totalWeeks}</span>
                    </div>
                    <div className="text-[10px] text-text-muted">weeks in</div>
                  </div>
                </div>

                {/* Phase progress bar */}
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-lime transition-all duration-700"
                      style={{ width: `${(CURRENT_PHASE.weekNumber / CURRENT_PHASE.totalWeeks) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Focus areas */}
                <div className="mt-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Phase Focus Areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CURRENT_PHASE.focus.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center rounded-full border border-lime/20 bg-lime/10 px-2.5 py-0.5 text-[11px] text-lime"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-text-muted">
                  Next phase: <span className="font-medium text-text-primary">{CURRENT_PHASE.nextPhase}</span>
                </p>
              </div>

              {/* Weekly breakdown */}
              <div>
                <h2 className="mb-3 text-sm font-semibold text-text-primary">Weekly Breakdown</h2>
                <div className="space-y-3">
                  {WEEKLY_PLAN.map((week, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-xl border p-4 transition-colors',
                        week.current
                          ? 'border-lime/40 bg-lime/5'
                          : week.completed
                          ? 'border-border-1 bg-surface-2 opacity-70'
                          : 'border-border-1 bg-surface-2'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {week.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-lime" />
                            ) : week.current ? (
                              <Circle className="h-4 w-4 text-lime" />
                            ) : (
                              <Circle className="h-4 w-4 text-text-faint" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-text-primary">{week.theme}</span>
                              {week.current && (
                                <span className="inline-flex items-center rounded-full bg-lime/20 px-2 py-0.5 text-[10px] font-bold text-lime">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[10px] text-text-muted">{week.week} · {week.sessions} sessions</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {week.focus.map((f) => (
                                <span
                                  key={f}
                                  className="inline-flex items-center rounded border border-border-2 px-1.5 py-0.5 text-[10px] text-text-muted"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-bold tabular-nums text-text-primary">{week.sessions}</div>
                          <div className="text-[10px] text-text-faint">sessions</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB: Coach Notes
          ---------------------------------------------------------------- */}
          {activeTab === 'notes' && (
            <div className="space-y-5">
              {/* Live note input */}
              <div className="rounded-xl border border-border-1 bg-surface-2 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-lime" />
                  <h2 className="text-xs font-semibold text-text-primary">Add a Note</h2>
                  <span className="text-[10px] text-text-faint">— Live session notes, observations, individual flags</span>
                </div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Note what you observed during the session — technique, fitness, attitude, individual flags…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border-1 bg-surface-3 px-3 py-2.5 text-xs text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none focus:ring-1 focus:ring-lime/30"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-text-faint">
                    Notes are private to coaching staff and timestamped automatically.
                  </p>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 text-xs font-semibold text-bg transition-opacity disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" /> Save Note
                  </button>
                </div>
              </div>

              {/* Notes list */}
              <div className="space-y-4">
                {localNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-border-1 bg-surface-2 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-text-primary">{note.sessionTitle}</div>
                        <div className="mt-0.5 text-[10px] text-text-muted">
                          {new Date(note.sessionDate).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                          })}
                          {' · '}
                          {new Date(note.timestamp).toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed">{note.note}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {note.athletes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.athletes.map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center gap-1 rounded-full border border-sky/20 bg-sky/10 px-2 py-0.5 text-[10px] text-sky"
                            >
                              <User className="h-2.5 w-2.5" />{a}
                            </span>
                          ))}
                        </div>
                      )}
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-border-2 px-2 py-0.5 text-[10px] text-text-muted"
                        >
                          <Tag className="h-2.5 w-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
