import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/shared/TopBar'
import { AlertStrip } from '@/components/coach/AlertStrip'
import { UpcomingEvents } from '@/components/coach/UpcomingEvents'
import { MondayPreviewCard } from '@/components/ai/MondayPreviewCard'
import { DEMO_DATA } from '@/lib/demo/data'
import { BookOpen, ArrowRight } from 'lucide-react'
import type { Alert, TeamEvent } from '@/types/database'

interface PageProps {
  searchParams: { demo?: string }
}

interface FlaggedAthlete {
  name: string
  status: 'limited' | 'out'
  reason: string
}

function longDate(d: Date) {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function matchDay(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Simple server-renderable pillar row
function PillarBar({
  label,
  value,
  max = 100,
  unit = '',
  color,
}: {
  label: string
  value: number
  max?: number
  unit?: string
  color: string
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-text-muted">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums text-text-primary">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default async function CoachDashboard({ searchParams }: PageProps) {
  const isDemo = searchParams.demo === 'true'

  let teamReadiness = 0
  let physicalAvg = 0
  let sleepAvg = 0
  let mentalAggregate = 0
  let trainingLoadAvg = 0
  let availableFull = 0
  let totalAthletes = 0
  let limitedCount = 0
  let outCount = 0
  let academicFlags = 0
  let nextMatch: TeamEvent | null = null
  let daysUntilNextMatch = 0
  let alerts: Alert[] = []
  let upcomingEvents: TeamEvent[] = []
  let flaggedAthletes: FlaggedAthlete[] = []

  const today = new Date()

  if (isDemo) {
    const d = DEMO_DATA
    const scores = d.readinessScores
    const avg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

    teamReadiness = d.teamReadiness
    physicalAvg = avg(scores.map((s) => s.physical_score))
    sleepAvg = avg(scores.map((s) => s.sleep_score))
    mentalAggregate = avg(
      d.wellnessCheckins.filter((w) => w.mental_score != null).map((w) => w.mental_score)
    )
    trainingLoadAvg = avg(scores.map((s) => Math.round(s.training_load)))
    availableFull = d.availabilitySummary.full
    totalAthletes = d.athletes.length
    limitedCount = d.availability.filter((a) => a.status === 'limited').length
    outCount = d.availability.filter((a) => a.status === 'out').length
    academicFlags = d.academicRecords.filter((r) => r.eligibility_status !== 'ok').length
    alerts = d.alerts.filter((a) => !a.is_read)
    upcomingEvents = d.upcomingEvents
    nextMatch = d.upcomingEvents.find((e) => e.event_type === 'match') ?? null

    if (nextMatch) {
      daysUntilNextMatch = Math.max(
        0,
        Math.ceil(
          (new Date(nextMatch.event_date + 'T00:00:00').getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    }

    flaggedAthletes = d.availability
      .filter((a) => a.status !== 'full')
      .map((a) => {
        const athlete = d.athletes.find((at) => at.id === a.athlete_id)
        return {
          name: athlete?.full_name ?? '',
          status: a.status as 'limited' | 'out',
          reason: a.reason ?? '',
        }
      })
      .filter((a) => a.name)
  } else {
    try {
      const supabase = await createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('team_id')
          .eq('auth_id', authUser.id)
          .single()

        const teamId = userData?.team_id
        if (teamId) {
          const todayStr = today.toISOString().split('T')[0]
          const [scoresResult, availResult, academicResult, alertsResult, eventsResult] =
            await Promise.all([
              supabase
                .from('readiness_scores')
                .select('physical_score, sleep_score, combined_score, training_load')
                .eq('team_id', teamId)
                .eq('date', todayStr),
              supabase
                .from('athlete_availability')
                .select('status, reason')
                .eq('team_id', teamId)
                .eq('date', todayStr),
              supabase
                .from('academic_records')
                .select('eligibility_status')
                .eq('team_id', teamId)
                .neq('eligibility_status', 'ok'),
              supabase
                .from('alerts')
                .select('*')
                .eq('team_id', teamId)
                .eq('is_read', false)
                .order('created_at', { ascending: false })
                .limit(5),
              supabase
                .from('team_events')
                .select('*')
                .eq('team_id', teamId)
                .gte('event_date', todayStr)
                .order('event_date', { ascending: true })
                .limit(5),
            ])

          const scores = scoresResult.data ?? []
          const availability = availResult.data ?? []
          const avg = (arr: number[]) =>
            arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

          teamReadiness = avg(scores.map((s) => s.combined_score))
          physicalAvg = avg(scores.map((s) => s.physical_score))
          sleepAvg = avg(scores.map((s) => s.sleep_score))
          trainingLoadAvg = avg(scores.map((s) => Math.round(s.training_load ?? 0)))
          totalAthletes = scores.length
          availableFull = availability.filter((a) => a.status === 'full').length
          limitedCount = availability.filter((a) => a.status === 'limited').length
          outCount = availability.filter((a) => a.status === 'out').length
          academicFlags = (academicResult.data ?? []).length
          alerts = (alertsResult.data ?? []) as Alert[]
          upcomingEvents = (eventsResult.data ?? []) as TeamEvent[]
          nextMatch = upcomingEvents.find((e) => e.event_type === 'match') ?? null
          if (nextMatch) {
            daysUntilNextMatch = Math.max(
              0,
              Math.ceil(
                (new Date(nextMatch.event_date + 'T00:00:00').getTime() - today.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          }
        }
      }
    } catch {
      // silently fall through
    }
  }

  const matchOpponent = nextMatch?.title.replace(/^.*vs\.\s*/i, '').replace(/^.*vs\s*/i, '') ?? ''
  const matchCountdownLabel =
    daysUntilNextMatch === 0
      ? 'Today'
      : daysUntilNextMatch === 1
      ? 'Tomorrow'
      : `In ${daysUntilNextMatch} days`
  const matchPrepHref = isDemo ? '/coach/match-prep?demo=true' : '/coach/match-prep'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="McMaster Marauders"
        subtitle={longDate(today)}
        alertCount={alerts.length}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── Monday Morning Preview (first training day of week) ── */}
        {isDemo && <MondayPreviewCard />}

        {/* ── Match banner ─────────────────────────────────────────── */}
        {nextMatch && daysUntilNextMatch <= 7 && (
          <a
            href={matchPrepHref}
            className="group relative flex items-end justify-between overflow-hidden rounded-2xl border border-lime/20 bg-[#0b1a0e] p-6 transition-colors hover:border-lime/35"
          >
            {/* Accent line */}
            <div className="absolute left-0 top-0 h-px w-3/4 bg-gradient-to-r from-lime/80 to-transparent" />
            {/* Pitch stripe texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #3DB87F 0px, transparent 1px, transparent 48px)',
              }}
            />

            <div className="relative z-10">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lime/60">
                {matchCountdownLabel}
                {nextMatch.start_time && ` · ${nextMatch.start_time.slice(0, 5)}`}
              </p>
              <h2 className="font-display text-3xl font-black italic leading-tight text-white">
                {matchOpponent}
              </h2>
              <p className="mt-1.5 text-sm text-text-muted">
                {matchDay(nextMatch.event_date)}
                {nextMatch.location ? ` · ${nextMatch.location}` : ''}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-lime/70 transition-colors group-hover:text-lime">
                Match Prep <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="relative z-10 ml-8 shrink-0 text-right">
              <div className="font-display text-[6rem] font-black italic leading-none text-lime/90">
                {daysUntilNextMatch}
              </div>
              <p className="text-xs text-text-muted">
                {daysUntilNextMatch === 1 ? 'day' : 'days'}
              </p>
            </div>
          </a>
        )}

        {/* ── Squad + Readiness ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px]">

          {/* Squad status */}
          <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Squad Today
              </h2>
              <span className="text-xs text-text-muted">{totalAthletes} athletes</span>
            </div>

            {/* Availability strip */}
            {totalAthletes > 0 && (
              <div className="mb-3 flex h-1.5 gap-px overflow-hidden rounded-full bg-surface-3">
                {availableFull > 0 && (
                  <div
                    className="bg-lime"
                    style={{ flex: availableFull }}
                  />
                )}
                {limitedCount > 0 && (
                  <div
                    className="bg-amber"
                    style={{ flex: limitedCount }}
                  />
                )}
                {outCount > 0 && (
                  <div
                    className="bg-rose"
                    style={{ flex: outCount }}
                  />
                )}
              </div>
            )}

            <div className="mb-4 flex items-center gap-5 text-xs">
              {availableFull > 0 && (
                <span>
                  <span className="font-bold text-lime">{availableFull}</span>{' '}
                  <span className="text-text-muted">full</span>
                </span>
              )}
              {limitedCount > 0 && (
                <span>
                  <span className="font-bold text-amber">{limitedCount}</span>{' '}
                  <span className="text-text-muted">limited</span>
                </span>
              )}
              {outCount > 0 && (
                <span>
                  <span className="font-bold text-rose">{outCount}</span>{' '}
                  <span className="text-text-muted">out</span>
                </span>
              )}
            </div>

            {/* Named flags */}
            {flaggedAthletes.length > 0 ? (
              <div className="space-y-2.5 border-t border-border-1 pt-3">
                {flaggedAthletes.map((a) => (
                  <div key={a.name} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 text-xs leading-none font-bold ${
                        a.status === 'out' ? 'text-rose' : 'text-amber'
                      }`}
                    >
                      {a.status === 'out' ? '✕' : '▲'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-text-primary">{a.name}</span>
                      {a.reason && (
                        <span className="ml-2 text-[11px] text-text-muted">— {a.reason}</span>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-semibold capitalize ${
                        a.status === 'out' ? 'text-rose' : 'text-amber'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              totalAthletes > 0 && (
                <p className="text-xs text-text-muted border-t border-border-1 pt-3">
                  Full squad available.
                </p>
              )
            )}
          </div>

          {/* Readiness */}
          <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Readiness
            </p>
            <div className="mb-5 flex items-end gap-1.5">
              <span className="font-display text-[3.75rem] font-black italic leading-none text-lime">
                {teamReadiness || '—'}
              </span>
              {teamReadiness > 0 && (
                <span className="mb-1.5 text-xs text-text-muted">/ 100</span>
              )}
            </div>
            <div className="space-y-3">
              <PillarBar label="Physical" value={physicalAvg} color="#3DB87F" />
              <PillarBar label="Sleep" value={sleepAvg} color="#a78bfa" />
              <PillarBar label="Mental" value={mentalAggregate} color="#60a5fa" />
              <PillarBar
                label="Training Load"
                value={trainingLoadAvg}
                max={21}
                unit=" AU"
                color="#fbbf24"
              />
            </div>
          </div>
        </div>

        {/* ── Academic flags ───────────────────────────────────────── */}
        {academicFlags > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-violet/20 bg-violet/5 px-4 py-3">
            <BookOpen className="h-4 w-4 shrink-0 text-violet" />
            <p className="text-xs text-text-primary">
              <span className="font-semibold text-violet">{academicFlags}</span> athlete
              {academicFlags > 1 ? 's' : ''} under academic review — confirm eligibility before
              next squad selection.
            </p>
          </div>
        )}

        {/* ── Alerts ───────────────────────────────────────────────── */}
        {alerts.length > 0 && <AlertStrip alerts={alerts} />}

        {/* ── Upcoming events ──────────────────────────────────────── */}
        <UpcomingEvents events={upcomingEvents} />

        {/* ── Privacy ──────────────────────────────────────────────── */}
        <p className="text-center text-[11px] text-text-faint">
          Mental health data is aggregated and anonymised. Individual athlete wellness inputs are
          never visible to coaching staff.
        </p>
      </div>
    </div>
  )
}
