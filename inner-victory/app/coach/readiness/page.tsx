'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { StatusDot } from '@/components/shared/StatusDot'
import { AvailabilityTab } from '@/components/workload/AvailabilityTab'
import { WorkloadTab } from '@/components/workload/WorkloadTab'
import { InjuryLogTab } from '@/components/workload/InjuryLogTab'
import { DEMO_DATA } from '@/lib/demo/data'
import { useTeamReadiness } from '@/hooks/useTeamReadiness'
import { useTeam } from '@/hooks/useTeam'
import { cn } from '@/lib/utils'
import type { AthleteAvailability } from '@/types/database'

const CHART_COLORS = {
  readiness: '#3DB87F',
  load: '#fbbf24',
  trend: '#60a5fa',
}

const CHART_STYLE = {
  tooltip: {
    backgroundColor: '#252836',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    color: '#F0F0F0',
    fontSize: 12,
  },
  axis: { fill: '#8B8FA8', fontSize: 11 },
  grid: 'rgba(255,255,255,0.05)',
}

const RECENT_SESSIONS = DEMO_DATA.trainingSessions.length
const UPCOMING_SESSIONS = DEMO_DATA.upcomingEvents.filter((e) => e.event_type === 'training').length
const UPCOMING_MATCHES = DEMO_DATA.upcomingEvents.filter((e) => e.event_type === 'match').length
const RECENT_MATCHES = DEMO_DATA.matchStats.map((m) => m.match_date).filter((v, i, a) => a.indexOf(v) === i).length

const ATHLETE_SESSIONS: Record<string, number> = {
  'demo-athlete-001': 3,
  'demo-athlete-002': 3,
  'demo-athlete-003': 2,
  'demo-athlete-004': 3,
  'demo-athlete-005': 3,
  'demo-athlete-006': 3,
  'demo-athlete-007': 3,
  'demo-athlete-008': 2,
  'demo-athlete-009': 3,
}

function getWorkloadRisk(trainingLoad: number, readiness: number): { label: string; className: string } {
  if (trainingLoad > 15 && readiness < 60) return { label: 'High Risk', className: 'text-rose bg-rose/10 border-rose/20' }
  if (trainingLoad > 13 || readiness < 70) return { label: 'Monitor', className: 'text-amber bg-amber/10 border-amber/20' }
  return { label: 'On Track', className: 'text-green bg-green/10 border-green/20' }
}

function buildTrendData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const readiness = [68, 70, 66, 72, 69, 71, 71]
  const load = [13, 14, 16, 13, 15, 11, 12]
  return days.map((day, i) => ({ day, readiness: readiness[i], load: load[i] }))
}

type TabKey = 'readiness' | 'availability' | 'workload' | 'injuries'

const TABS: { id: TabKey; label: string }[] = [
  { id: 'readiness', label: 'Readiness' },
  { id: 'availability', label: 'Availability' },
  { id: 'workload', label: 'Workload' },
  { id: 'injuries', label: 'Injury Log' },
]

export default function ReadinessPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const [activeTab, setActiveTab] = useState<TabKey>('readiness')

  const { team } = useTeam()
  const liveData = useTeamReadiness(isDemo ? undefined : (team?.id ?? undefined))

  const athletes = isDemo
    ? DEMO_DATA.readinessScores.map((score) => {
        const user = DEMO_DATA.athletes.find((a) => a.id === score.athlete_id)!
        const availability = DEMO_DATA.availability.find(
          (av) => av.athlete_id === score.athlete_id
        ) as AthleteAvailability | undefined
        return { ...score, user, availability }
      })
    : liveData.athletes.map((a) => ({
        ...a,
        availability: undefined as AthleteAvailability | undefined,
      }))

  const loading = isDemo ? false : liveData.loading

  const barData = useMemo(
    () =>
      athletes.map((a) => ({
        name: a.user?.full_name?.split(' ')[0] ?? 'Athlete',
        readiness: a.combined_score,
        load: Math.round(a.training_load),
      })),
    [athletes]
  )

  const trendData = buildTrendData()

  const teamAvg = athletes.length
    ? Math.round(athletes.reduce((sum, a) => sum + a.combined_score, 0) / athletes.length)
    : 0

  const avgLoad = athletes.length
    ? (athletes.reduce((sum, a) => sum + a.training_load, 0) / athletes.length).toFixed(1)
    : '0'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Readiness & Workload"
        subtitle={`Team avg ${teamAvg} · Avg load ${avgLoad} AU · ${athletes.length} athletes`}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border-1 bg-surface-1 px-6 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-t-lg px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-lime text-lime bg-lime/5'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* ── Readiness tab ── */}
          {activeTab === 'readiness' && (
            loading ? (
              <LoadingState message="Loading readiness data..." />
            ) : athletes.length === 0 ? (
              <EmptyState
                icon="📊"
                title="No readiness data"
                description="Readiness scores will appear once training sessions and check-ins are logged."
              />
            ) : (
              <>
                {/* Workload Context Banner */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Sessions (last 7 days)', value: RECENT_SESSIONS, color: 'text-lime' },
                    { label: 'Matches (last 7 days)', value: RECENT_MATCHES, color: 'text-sky' },
                    { label: 'Sessions (next 7 days)', value: UPCOMING_SESSIONS, color: 'text-amber' },
                    { label: 'Matches (next 7 days)', value: UPCOMING_MATCHES, color: 'text-rose' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border-1 bg-surface-2 p-4">
                      <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                      <div className="mt-0.5 text-[10px] text-text-muted">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bar Chart */}
                <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
                  <h2 className="mb-4 text-sm font-semibold text-text-primary">
                    Readiness vs Training Load — Today
                  </h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                      <XAxis dataKey="name" tick={CHART_STYLE.axis} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={CHART_STYLE.axis} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE.tooltip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#8B8FA8', paddingTop: 8 }} />
                      <Bar dataKey="readiness" name="Readiness Score" fill={CHART_COLORS.readiness} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="load" name="Training Load (AU)" fill={CHART_COLORS.load} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
                  <h2 className="mb-4 text-sm font-semibold text-text-primary">
                    Team Average — Last 7 Days
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trendData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                      <XAxis dataKey="day" tick={CHART_STYLE.axis} axisLine={false} tickLine={false} />
                      <YAxis domain={[40, 90]} tick={CHART_STYLE.axis} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE.tooltip} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#8B8FA8', paddingTop: 8 }} />
                      <Line type="monotone" dataKey="readiness" name="Avg Readiness" stroke={CHART_COLORS.readiness} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.readiness }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="load" name="Avg Load (AU)" stroke={CHART_COLORS.load} strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3, fill: CHART_COLORS.load }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Individual table */}
                <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
                  <h2 className="mb-4 text-sm font-semibold text-text-primary">Individual Readiness</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-1">
                          <th className="pb-2 text-left text-xs font-medium text-text-muted">Athlete</th>
                          <th className="pb-2 text-center text-xs font-medium text-text-muted">Readiness</th>
                          <th className="pb-2 text-right text-xs font-medium text-text-muted">Training Load</th>
                          <th className="pb-2 text-right text-xs font-medium text-text-muted">Sessions (7d)</th>
                          <th className="pb-2 text-right text-xs font-medium text-text-muted">Availability</th>
                          <th className="pb-2 text-right text-xs font-medium text-text-muted">Workload Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-1">
                        {athletes.slice().sort((a, b) => a.combined_score - b.combined_score).map((athlete) => {
                          const risk = getWorkloadRisk(athlete.training_load, athlete.combined_score)
                          const sessions = ATHLETE_SESSIONS[athlete.athlete_id] ?? 3
                          return (
                            <tr key={athlete.id} className="hover:bg-surface-3/50 transition-colors">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                    style={{ backgroundColor: athlete.user?.avatar_color ?? '#8B8FA8', color: '#0F1117' }}
                                  >
                                    {athlete.user?.initials ?? '?'}
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-text-primary">{athlete.user?.full_name ?? 'Unknown'}</div>
                                    <div className="text-[10px] text-text-muted">{athlete.user?.position ?? '—'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-center"><ScoreBadge score={athlete.combined_score} size="sm" /></td>
                              <td className="py-3 text-right text-xs text-text-muted">{athlete.training_load.toFixed(1)} AU</td>
                              <td className="py-3 text-right text-xs text-text-muted">{sessions}</td>
                              <td className="py-3 text-right"><StatusDot status={athlete.availability?.status ?? 'full'} showLabel /></td>
                              <td className="py-3 text-right">
                                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${risk.className}`}>
                                  {risk.label}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-[10px] text-text-faint">
                    Readiness is derived from training load, session density, and wellness check-ins. No wearable data required.
                  </p>
                </div>
              </>
            )
          )}

          {/* ── Availability tab ── */}
          {activeTab === 'availability' && <AvailabilityTab />}

          {/* ── Workload tab ── */}
          {activeTab === 'workload' && <WorkloadTab />}

          {/* ── Injuries tab ── */}
          {activeTab === 'injuries' && <InjuryLogTab />}
        </div>
      </div>
    </div>
  )
}
