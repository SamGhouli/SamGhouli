'use client'

import { useMemo } from 'react'
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
import { DEMO_DATA } from '@/lib/demo/data'
import { useTeamReadiness } from '@/hooks/useTeamReadiness'
import { useTeam } from '@/hooks/useTeam'

const CHART_COLORS = {
  physical: '#d4ff5c',
  sleep: '#60a5fa',
  combined: '#4ade80',
}

// Generate 7-day trend data from demo scores (mock variation per day)
function buildTrendData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const base = [68, 70, 66, 72, 69, 71, 71]
  return days.map((day, i) => ({ day, avg: base[i] }))
}

export default function ReadinessPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const { team } = useTeam()
  const liveData = useTeamReadiness(isDemo ? undefined : (team?.id ?? undefined))

  const athletes = isDemo
    ? DEMO_DATA.readinessScores.map((score) => {
        const user = DEMO_DATA.athletes.find((a) => a.id === score.athlete_id)!
        return { ...score, user }
      })
    : liveData.athletes

  const loading = isDemo ? false : liveData.loading

  const barData = useMemo(
    () =>
      athletes.map((a) => ({
        name: a.user?.full_name?.split(' ')[0] ?? 'Athlete',
        physical: a.physical_score,
        sleep: a.sleep_score,
        combined: a.combined_score,
      })),
    [athletes]
  )

  const trendData = buildTrendData()

  const teamAvg = athletes.length
    ? Math.round(
        athletes.reduce((sum, a) => sum + a.combined_score, 0) / athletes.length
      )
    : 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Readiness Breakdown"
        subtitle={`Team average: ${teamAvg} · ${athletes.length} athletes`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <LoadingState message="Loading readiness data..." />
        ) : athletes.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No readiness data"
            description="Readiness scores will appear once athletes submit their daily data."
          />
        ) : (
          <>
            {/* Bar Chart: Physical vs Sleep */}
            <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
              <h2 className="mb-4 text-sm font-semibold text-text-primary">
                Physical vs Sleep Score — Today
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#7a869a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#7a869a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e2334',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8,
                      color: '#e8ebf5',
                      fontSize: 12,
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: '#7a869a', paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="physical"
                    name="Physical"
                    fill={CHART_COLORS.physical}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="sleep"
                    name="Sleep"
                    fill={CHART_COLORS.sleep}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart: Team Average over 7 days */}
            <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
              <h2 className="mb-4 text-sm font-semibold text-text-primary">
                Team Average Readiness — Last 7 Days
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#7a869a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[50, 90]}
                    tick={{ fill: '#7a869a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e2334',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8,
                      color: '#e8ebf5',
                      fontSize: 12,
                    }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="Avg Readiness"
                    stroke={CHART_COLORS.combined}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART_COLORS.combined }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Athlete Table */}
            <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
              <h2 className="mb-4 text-sm font-semibold text-text-primary">
                Individual Scores
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-1">
                      <th className="pb-2 text-left text-xs font-medium text-text-muted">Athlete</th>
                      <th className="pb-2 text-center text-xs font-medium text-text-muted">Combined</th>
                      <th className="pb-2 text-center text-xs font-medium text-text-muted">Physical</th>
                      <th className="pb-2 text-center text-xs font-medium text-text-muted">Sleep</th>
                      <th className="pb-2 text-right text-xs font-medium text-text-muted">Training Load</th>
                      <th className="pb-2 text-right text-xs font-medium text-text-muted">HRV</th>
                      <th className="pb-2 text-right text-xs font-medium text-text-muted">Sleep hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-1">
                    {athletes
                      .slice()
                      .sort((a, b) => b.combined_score - a.combined_score)
                      .map((athlete) => (
                        <tr key={athlete.id} className="hover:bg-surface-3/50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-bg"
                                style={{ backgroundColor: athlete.user?.avatar_color ?? '#7a869a' }}
                              >
                                {athlete.user?.initials ?? '?'}
                              </div>
                              <div>
                                <div className="text-xs font-medium text-text-primary">
                                  {athlete.user?.full_name ?? 'Unknown'}
                                </div>
                                <div className="text-[10px] text-text-muted">
                                  {athlete.user?.position ?? '—'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <ScoreBadge score={athlete.combined_score} size="sm" />
                          </td>
                          <td className="py-3 text-center">
                            <ScoreBadge score={athlete.physical_score} size="sm" />
                          </td>
                          <td className="py-3 text-center">
                            <ScoreBadge score={athlete.sleep_score} size="sm" />
                          </td>
                          <td className="py-3 text-right text-xs text-text-muted">
                            {athlete.training_load.toFixed(1)}
                          </td>
                          <td className="py-3 text-right text-xs text-text-muted">
                            {athlete.hrv ?? '—'}
                          </td>
                          <td className="py-3 text-right text-xs text-text-muted">
                            {athlete.sleep_hours?.toFixed(1) ?? '—'}h
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
