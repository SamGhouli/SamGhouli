'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { DEMO_DATA } from '@/lib/demo/data'
import {
  Target,
  Shield,
  Users,
  MessageSquare,
  Flag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  CornerUpRight,
  Zap,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type SquadRole = 'starting' | 'bench' | 'unavailable'
type FormationKey = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2' | '4-1-4-1'

interface SquadEntry {
  athleteId: string
  role: SquadRole
}

interface TacticalSection {
  id: string
  title: string
  content: string
}

// ── Demo defaults ──────────────────────────────────────────────────────────────

const DEMO_NEXT_MATCH = DEMO_DATA.upcomingEvents.find(
  (e) => e.event_type === 'match'
)!

const DEMO_READINESS_MAP = Object.fromEntries(
  DEMO_DATA.readinessScores.map((r) => [r.athlete_id, r.combined_score])
)

const DEMO_AVAILABILITY_MAP = Object.fromEntries(
  DEMO_DATA.availability.map((a) => [a.athlete_id, a.status])
)

const INITIAL_SQUAD: SquadEntry[] = [
  { athleteId: DEMO_DATA.athletes[2].id, role: 'starting' },  // Jordan – GK
  { athleteId: DEMO_DATA.athletes[3].id, role: 'starting' },  // Sofia – Defender
  { athleteId: DEMO_DATA.athletes[6].id, role: 'starting' },  // Noah – Defender
  { athleteId: DEMO_DATA.athletes[8].id, role: 'starting' },  // Devonte – Midfielder
  { athleteId: DEMO_DATA.athletes[1].id, role: 'starting' },  // Priya – Midfielder
  { athleteId: DEMO_DATA.athletes[7].id, role: 'starting' },  // Elena – Striker
  { athleteId: DEMO_DATA.athletes[0].id, role: 'starting' },  // Marcus – Forward
  { athleteId: DEMO_DATA.athletes[4].id, role: 'bench' },     // Liam – Winger
  { athleteId: DEMO_DATA.athletes[5].id, role: 'unavailable' }, // Amara – out (fatigue)
]

const INITIAL_TACTICS: TacticalSection[] = [
  {
    id: 'press',
    title: 'Pressing Triggers',
    content: 'Press high on GK distribution. Trigger on central back receiving with back to goal. Second striker locks near-side CB.',
  },
  {
    id: 'buildup',
    title: 'Build-up Play',
    content: 'Play through the thirds — avoid long balls unless under pressure. Full backs invert into CM channels when possible.',
  },
  {
    id: 'transition',
    title: 'Transitions',
    content: 'Win the ball → find Priya or Devonte immediately. Shift to 4-3-3 shape in possession within 3 seconds.',
  },
  {
    id: 'defensive',
    title: 'Defensive Shape',
    content: 'Mid-block at 4-4-2 when out of possession. Noah and Sofia hold defensive line at halfway. No one tracks runners past the block.',
  },
]

const INITIAL_SCOUT = {
  overview: 'Western run a high defensive line with aggressive full backs who push into the final third. Their #10 (Callum Park) is the key creator — drops into pockets and plays quick one-twos. Weakness: slow to recover when full backs are caught high.',
  threats: ['#10 Callum Park — playmaker, set-piece taker', '#9 Darius Cole — pace in behind, strong header', 'Right back (#2) pushes high, creates overloads in wide areas'],
  weaknesses: ['Susceptible to counter-press after losing the ball high', 'Centre backs slow to pivot — exploit with third-man runs', 'Conceded 4 corners in last match — poor zonal marking'],
  keyPlayers: ['#10 Park', '#9 Cole', '#2 RB'],
}

const FORMATIONS: FormationKey[] = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '4-1-4-1']

const ROLE_CONFIG: Record<SquadRole, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  starting: { label: 'Starting XI', icon: CheckCircle2, color: '#4ade80', bg: '#4ade8015' },
  bench: { label: 'Bench', icon: AlertCircle, color: '#fbbf24', bg: '#fbbf2415' },
  unavailable: { label: 'Unavailable', icon: XCircle, color: '#fb7185', bg: '#fb718515' },
}

function formatMatchDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const p = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${p}`
}

function readinessColor(score: number) {
  if (score >= 75) return '#4ade80'
  if (score >= 55) return '#fbbf24'
  return '#fb7185'
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden mb-4">
      <button
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="h-4 w-4 text-lime shrink-0" />
        <span className="flex-1 text-sm font-semibold text-text-primary">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-faint" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-faint" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function MatchPrepPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const match = isDemo ? DEMO_NEXT_MATCH : null

  const [formation, setFormation] = useState<FormationKey>('4-2-3-1')
  const [squad, setSquad] = useState<SquadEntry[]>(INITIAL_SQUAD)
  const [tactics, setTactics] = useState<TacticalSection[]>(INITIAL_TACTICS)
  const [scout, setScout] = useState(INITIAL_SCOUT)
  const [teamMessage, setTeamMessage] = useState(
    "Let's bring our best to London. We've prepared well this week — trust the shape, press hard in the first 20, and play without fear. Every minute counts. — Coach Mitchell"
  )
  const [messageSaved, setMessageSaved] = useState(false)
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null)

  // Set pieces state
  const [corners, setCorners] = useState({
    taker: 'Priya Sharma',
    nearPost: 'Marcus Thompson',
    farPost: 'Noah Bergström',
    edge: 'Devonte Williams',
    clearance: 'Sofia Reyes',
  })
  const [freekicks, setFreekicks] = useState({
    taker: 'Elena Volkov',
    wall: 'Jordan Casey (GK)',
    runner: 'Marcus Thompson',
  })

  function setAthleteRole(athleteId: string, role: SquadRole) {
    setSquad((prev) =>
      prev.map((e) => (e.athleteId === athleteId ? { ...e, role } : e))
    )
    setActiveSquadId(null)
  }

  function updateTactic(id: string, content: string) {
    setTactics((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)))
  }

  const athletes = isDemo ? DEMO_DATA.athletes : []

  const squadGroups: Record<SquadRole, typeof athletes> = {
    starting: [],
    bench: [],
    unavailable: [],
  }
  for (const entry of squad) {
    const a = athletes.find((x) => x.id === entry.athleteId)
    if (a) squadGroups[entry.role].push(a)
  }

  if (!match && !isDemo) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar title="Match Preparation" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">No upcoming matches found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar title="Match Preparation" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-5">

          {/* Match header card */}
          {match && (
            <div className="rounded-xl border border-lime/30 bg-lime/5 p-5 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className="h-4 w-4 text-lime" />
                    <span className="text-xs font-bold text-lime uppercase tracking-wide">
                      Next Match
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-text-primary leading-tight mb-2">
                    {match.title}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock className="h-3.5 w-3.5" />
                      {formatMatchDate(match.event_date)} · {formatTime(match.start_time)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {match.location}
                    </span>
                  </div>
                  {match.notes && (
                    <p className="mt-2 text-[11px] text-text-faint italic">{match.notes}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-black text-lime">
                    {(() => {
                      const d = new Date(match.event_date + 'T00:00:00')
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
                      return diff
                    })()}
                  </div>
                  <div className="text-[10px] text-text-muted font-medium">days away</div>
                </div>
              </div>
            </div>
          )}

          {/* Squad Selection */}
          <Section icon={Users} title="Squad Selection">
            <p className="text-xs text-text-muted mb-4">
              Tap an athlete to assign their role. Readiness scores shown from today&apos;s data.
            </p>

            {(['starting', 'bench', 'unavailable'] as SquadRole[]).map((role) => {
              const cfg = ROLE_CONFIG[role]
              const RoleIcon = cfg.icon
              return (
                <div key={role} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <RoleIcon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: cfg.color }}>
                      {cfg.label}
                      <span className="ml-1.5 text-text-faint font-normal normal-case tracking-normal">
                        ({squadGroups[role].length})
                      </span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {squadGroups[role].length === 0 && (
                      <p className="text-[11px] text-text-faint italic pl-1">None assigned</p>
                    )}
                    {squadGroups[role].map((athlete) => {
                      const readiness = DEMO_READINESS_MAP[athlete.id] ?? 0
                      const avail = DEMO_AVAILABILITY_MAP[athlete.id] ?? 'full'
                      const isExpanded = activeSquadId === athlete.id

                      return (
                        <div key={athlete.id}>
                          <button
                            className="w-full flex items-center gap-3 rounded-lg border border-border-1 bg-surface-3 px-3 py-2.5 text-left hover:border-border-2 transition-colors"
                            onClick={() => setActiveSquadId(isExpanded ? null : athlete.id)}
                          >
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-bg"
                              style={{ backgroundColor: athlete.avatar_color }}
                            >
                              {athlete.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-text-primary truncate">
                                {athlete.full_name}
                              </p>
                              <p className="text-[10px] text-text-muted">{athlete.position}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Readiness dot */}
                              <span
                                className="text-xs font-bold tabular-nums"
                                style={{ color: readinessColor(readiness) }}
                              >
                                {readiness}
                              </span>
                              {avail === 'limited' && (
                                <span className="rounded-full bg-amber/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                                  Limited
                                </span>
                              )}
                              {avail === 'out' && (
                                <span className="rounded-full bg-rose/10 px-1.5 py-0.5 text-[10px] font-medium text-rose">
                                  Out
                                </span>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5 text-text-faint" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-text-faint" />
                              )}
                            </div>
                          </button>

                          {/* Role selector */}
                          {isExpanded && (
                            <div className="mt-1 flex gap-2 pl-10">
                              {(['starting', 'bench', 'unavailable'] as SquadRole[]).map((r) => {
                                const rc = ROLE_CONFIG[r]
                                return (
                                  <button
                                    key={r}
                                    onClick={() => setAthleteRole(athlete.id, r)}
                                    className={cn(
                                      'rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors',
                                      role === r
                                        ? 'border-current'
                                        : 'border-border-1 text-text-faint hover:border-border-2'
                                    )}
                                    style={role === r ? { borderColor: rc.color, color: rc.color, backgroundColor: rc.bg } : {}}
                                  >
                                    {rc.label}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </Section>

          {/* Formation & Tactics */}
          <Section icon={Target} title="Formation & Tactical Brief">
            {/* Formation picker */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-text-muted mb-2">Formation</p>
              <div className="flex flex-wrap gap-2">
                {FORMATIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormation(f)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm font-bold tracking-wider transition-colors',
                      formation === f
                        ? 'border-lime bg-lime/10 text-lime'
                        : 'border-border-1 text-text-muted hover:border-border-2 hover:text-text-primary'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical sections */}
            <div className="space-y-3">
              {tactics.map((t) => (
                <div key={t.id}>
                  <p className="text-[11px] font-semibold text-text-muted mb-1.5 flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    {t.title}
                  </p>
                  <textarea
                    value={t.content}
                    onChange={(e) => updateTactic(t.id, e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-xs text-text-primary placeholder:text-text-faint focus:outline-none focus:border-lime resize-none"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Opposition Scout */}
          <Section icon={Shield} title="Opposition Scout Report">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-text-muted mb-1.5">Overview</p>
                <textarea
                  value={scout.overview}
                  onChange={(e) => setScout((s) => ({ ...s, overview: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-lime resize-none"
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-text-muted mb-2">Key Threats</p>
                <div className="space-y-2">
                  {scout.threats.map((threat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-rose mt-0.5 shrink-0" />
                      <input
                        value={threat}
                        onChange={(e) => {
                          const next = [...scout.threats]
                          next[i] = e.target.value
                          setScout((s) => ({ ...s, threats: next }))
                        }}
                        className="flex-1 rounded-lg border border-border-1 bg-surface-3 px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-lime"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-text-muted mb-2">Weaknesses to Exploit</p>
                <div className="space-y-2">
                  {scout.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green mt-0.5 shrink-0" />
                      <input
                        value={w}
                        onChange={(e) => {
                          const next = [...scout.weaknesses]
                          next[i] = e.target.value
                          setScout((s) => ({ ...s, weaknesses: next }))
                        }}
                        className="flex-1 rounded-lg border border-border-1 bg-surface-3 px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-lime"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Set Pieces */}
          <Section icon={CornerUpRight} title="Set Piece Assignments" defaultOpen={false}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Corners */}
              <div>
                <p className="text-xs font-semibold text-lime mb-3 flex items-center gap-1.5">
                  <CornerUpRight className="h-3.5 w-3.5" />
                  Corners
                </p>
                {Object.entries(corners).map(([k, v]) => (
                  <div key={k} className="mb-2">
                    <p className="text-[10px] text-text-faint mb-0.5 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                    <input
                      value={v}
                      onChange={(e) => setCorners((c) => ({ ...c, [k]: e.target.value }))}
                      className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-lime"
                    />
                  </div>
                ))}
              </div>

              {/* Free kicks */}
              <div>
                <p className="text-xs font-semibold text-lime mb-3 flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5" />
                  Free Kicks
                </p>
                {Object.entries(freekicks).map(([k, v]) => (
                  <div key={k} className="mb-2">
                    <p className="text-[10px] text-text-faint mb-0.5 capitalize">{k}</p>
                    <input
                      value={v}
                      onChange={(e) => setFreekicks((f) => ({ ...f, [k]: e.target.value }))}
                      className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-lime"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Team Message */}
          <Section icon={MessageSquare} title="Team Message">
            <p className="text-xs text-text-muted mb-3">
              Visible to all squad members on their Schedule page after you save.
            </p>
            <textarea
              value={teamMessage}
              onChange={(e) => {
                setTeamMessage(e.target.value)
                setMessageSaved(false)
              }}
              rows={5}
              className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2.5 text-sm text-text-primary leading-relaxed focus:outline-none focus:border-lime resize-none mb-3"
              placeholder="Write a pre-match message for your squad…"
            />
            <button
              onClick={() => setMessageSaved(true)}
              className="w-full rounded-lg bg-lime py-2.5 text-sm font-semibold text-black hover:opacity-90 active:opacity-75 transition-opacity"
            >
              {messageSaved ? 'Message Saved ✓' : 'Save & Publish to Squad'}
            </button>
          </Section>

          {/* Preparation Checklist */}
          <Section icon={BookOpen} title="Prep Checklist" defaultOpen={false}>
            <PrepChecklist />
          </Section>

        </div>
      </div>
    </div>
  )
}

// ── Prep Checklist ─────────────────────────────────────────────────────────────

const DEFAULT_CHECKLIST = [
  { id: '1', label: 'Squad selection finalised', done: false },
  { id: '2', label: 'Formation & tactics briefed to assistants', done: false },
  { id: '3', label: 'Opposition scout report distributed', done: false },
  { id: '4', label: 'Set piece routines confirmed', done: false },
  { id: '5', label: 'Team message published to athletes', done: false },
  { id: '6', label: 'Travel arrangements confirmed', done: false },
  { id: '7', label: 'Kit & equipment checked', done: false },
  { id: '8', label: 'Medical clearances reviewed', done: false },
]

function PrepChecklist() {
  const [items, setItems] = useState(DEFAULT_CHECKLIST)
  const done = items.filter((i) => i.done).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-muted">{done} / {items.length} complete</span>
        <div className="h-1.5 flex-1 mx-4 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-lime transition-all"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 rounded-lg border border-border-1 bg-surface-3 px-3 py-2.5 text-left hover:border-border-2 transition-colors"
            onClick={() => setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, done: !i.done } : i))}
          >
            <div className={cn(
              'h-4 w-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors',
              item.done ? 'border-lime bg-lime' : 'border-border-2'
            )}>
              {item.done && <span className="text-bg text-[10px] font-black">✓</span>}
            </div>
            <span className={cn('text-xs', item.done ? 'line-through text-text-faint' : 'text-text-primary')}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
