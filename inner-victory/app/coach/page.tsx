import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/shared/TopBar'
import { AIInsightCard } from '@/components/coach/AIInsightCard'
import { TeamReadinessSummary } from '@/components/coach/TeamReadinessSummary'
import { AlertStrip } from '@/components/coach/AlertStrip'
import { UpcomingEvents } from '@/components/coach/UpcomingEvents'
import { DEMO_DATA } from '@/lib/demo/data'
import { RefreshCw, Users, AlertTriangle, BookOpen, Calendar, Shield } from 'lucide-react'
import type { Alert, TeamEvent } from '@/types/database'

interface PageProps {
  searchParams: { demo?: string }
}

function formatDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
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
  let injuryFlags = 0
  let academicFlags = 0
  let nextMatchDate: string | null = null
  let alerts: Alert[] = []
  let upcomingEvents: TeamEvent[] = []
  let recentActivity: typeof DEMO_DATA.recentActivity = []

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
    injuryFlags = d.availability.filter((a) => a.status !== 'full').length
    academicFlags = d.academicRecords.filter((r) => r.eligibility_status !== 'ok').length
    nextMatchDate =
      d.upcomingEvents.find((e) => e.event_type === 'match')?.event_date ?? null
    alerts = d.alerts.filter((a) => !a.is_read)
    upcomingEvents = d.upcomingEvents
    recentActivity = d.recentActivity
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
          const today = new Date().toISOString().split('T')[0]

          const [
            scoresResult,
            availResult,
            academicResult,
            alertsResult,
            eventsResult,
          ] = await Promise.all([
            supabase
              .from('readiness_scores')
              .select('physical_score, sleep_score, combined_score, training_load')
              .eq('team_id', teamId)
              .eq('date', today),
            supabase
              .from('athlete_availability')
              .select('status')
              .eq('team_id', teamId)
              .eq('date', today),
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
              .gte('event_date', today)
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
          injuryFlags = availability.filter((a) => a.status !== 'full').length
          academicFlags = (academicResult.data ?? []).length
          alerts = (alertsResult.data ?? []) as Alert[]
          upcomingEvents = (eventsResult.data ?? []) as TeamEvent[]
          nextMatchDate =
            upcomingEvents.find((e) => e.event_type === 'match')?.event_date ?? null
        }
      }
    } catch {
      // Silently fall through to zeros
    }
  }

  const today = new Date()
  const daysUntilNextMatch = nextMatchDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextMatchDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0

  const aiContext = {
    teamReadiness,
    physicalScore: physicalAvg,
    mentalAggregateScore: mentalAggregate,
    sleepScore: sleepAvg,
    trainingLoad: trainingLoadAvg,
    activeAlerts: alerts.map((a) => ({
      alert_type: a.alert_type,
      severity: a.severity,
      message: a.message,
    })),
    daysUntilNextMatch,
    recentActivity: recentActivity.map((r) => ({
      type: r.type,
      description: r.description,
    })),
  }

  const kpis = [
    {
      label: 'Team Readiness',
      value: teamReadiness,
      suffix: '',
      accent: 'text-lime',
      bg: 'bg-lime/10',
      icon: Shield,
      sub: 'Combined score',
    },
    {
      label: 'Available Athletes',
      value: availableFull,
      suffix: `/ ${totalAthletes}`,
      accent: 'text-green',
      bg: 'bg-green/10',
      icon: Users,
      sub: 'Full availability',
    },
    {
      label: 'Injury Flags',
      value: injuryFlags,
      suffix: '',
      accent: 'text-amber',
      bg: 'bg-amber/10',
      icon: AlertTriangle,
      sub: 'Limited or out',
    },
    {
      label: 'Academic Flags',
      value: academicFlags,
      suffix: '',
      accent: 'text-violet',
      bg: 'bg-violet/10',
      icon: BookOpen,
      sub: 'Under review',
    },
    {
      label: 'Next Match',
      value: daysUntilNextMatch,
      suffix: daysUntilNextMatch === 1 ? ' day' : ' days',
      accent: 'text-rose',
      bg: 'bg-rose/10',
      icon: Calendar,
      sub: nextMatchDate
        ? new Date(nextMatchDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })
        : 'None scheduled',
    },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Command Centre"
        subtitle={formatDate(today)}
        actions={
          <a
            href={`/coach${isDemo ? '?demo=true' : ''}`}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border-1 px-3 text-xs text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </a>
        }
        alertCount={alerts.length}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="rounded-xl border border-border-1 bg-surface-2 p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${kpi.bg}`}>
                    <Icon className={`h-4 w-4 ${kpi.accent}`} />
                  </div>
                  <span className="text-xs text-text-muted">{kpi.label}</span>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${kpi.accent}`}>
                  {kpi.value}
                  {kpi.suffix && (
                    <span className="text-base font-normal text-text-muted">{kpi.suffix}</span>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-text-muted">{kpi.sub}</div>
              </div>
            )
          })}
        </div>

        {/* AI Insight */}
        <AIInsightCard context={aiContext} />

        {/* Two-column grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: Team Readiness Summary */}
          <TeamReadinessSummary
            physicalScore={physicalAvg}
            mentalScore={mentalAggregate}
            sleepScore={sleepAvg}
            trainingLoad={trainingLoadAvg}
          />

          {/* Right: Alerts + Upcoming Events stacked */}
          <div className="flex flex-col gap-4">
            <AlertStrip alerts={alerts} />
            <UpcomingEvents events={upcomingEvents} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-text-muted">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      act.severity === 'critical'
                        ? 'bg-rose'
                        : act.severity === 'warning'
                        ? 'bg-amber'
                        : 'bg-sky'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-text-primary">{act.title}</div>
                    <div className="text-[10px] text-text-muted">{act.description}</div>
                  </div>
                  <span className="shrink-0 text-[10px] text-text-faint">
                    {new Date(act.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Banner */}
        <div className="rounded-xl border border-border-1 bg-surface-1 px-5 py-4">
          <p className="text-center text-[11px] text-text-muted">
            <span className="font-semibold text-text-primary">Privacy Notice:</span>{' '}
            Mental health data is aggregated and anonymised. Individual athlete wellness inputs are
            never visible to coaching staff.
          </p>
        </div>
      </div>
    </div>
  )
}
