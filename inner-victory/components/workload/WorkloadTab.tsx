'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { DEMO_DATA, DEMO_WORKLOAD_ENTRIES, DEMO_ATHLETE_IDS } from '@/lib/demo/data'
import { cn } from '@/lib/utils'

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

// Baselines (approximate 4-week averages)
const LOAD_BASELINES: Record<string, number> = {
  [DEMO_ATHLETE_IDS.marcus]: 68,
  [DEMO_ATHLETE_IDS.priya]: 68,
  [DEMO_ATHLETE_IDS.jordan]: 72,
  [DEMO_ATHLETE_IDS.sofia]: 65,
  [DEMO_ATHLETE_IDS.liam]: 68,
  [DEMO_ATHLETE_IDS.amara]: 75, // Amara's baseline reflects her usual high load
  [DEMO_ATHLETE_IDS.noah]: 65,
  [DEMO_ATHLETE_IDS.elena]: 60,
  [DEMO_ATHLETE_IDS.devonte]: 68,
}

function workloadStatus(load: number, baseline: number): 'green' | 'amber' | 'red' {
  const ratio = load / baseline
  if (ratio <= 1.2) return 'green'
  if (ratio <= 1.3) return 'amber'
  return 'red'
}

const STATUS_COLORS = { green: '#3DB87F', amber: '#fbbf24', red: '#f43f5e' }

export function WorkloadTab() {
  const athleteLoads = useMemo(() => {
    return DEMO_DATA.athletes.map((athlete) => {
      const entries = DEMO_WORKLOAD_ENTRIES.filter((e) => e.athleteId === athlete.id)
      const totalLoad = entries.reduce((s, e) => s + e.load, 0)
      const baseline = LOAD_BASELINES[athlete.id] ?? 68
      const status = workloadStatus(totalLoad, baseline * 7)
      const ratio = totalLoad / (baseline * 7)
      return { athlete, totalLoad, baseline: baseline * 7, status, ratio, entries }
    })
  }, [])

  const chartData = athleteLoads.map(({ athlete, totalLoad, baseline, status }) => ({
    name: athlete.full_name.split(' ')[0],
    load: totalLoad,
    baseline,
    fill: STATUS_COLORS[status],
  }))

  return (
    <div className="space-y-6">
      {/* 7-day summary chart */}
      <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
        <h2 className="mb-1 text-sm font-semibold text-text-primary">7-Day Adjusted Load (AU)</h2>
        <p className="mb-4 text-[11px] text-text-muted">
          Colour indicates load vs personal baseline: green ≤ 20% above, amber 20–30% above, red &gt; 30% above.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="name" tick={CHART_STYLE.axis} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_STYLE.axis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={CHART_STYLE.tooltip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="load" name="7-day Load (AU)" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual load table */}
      <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">Individual Workload</h2>
        <div className="space-y-3">
          {athleteLoads
            .sort((a, b) => b.ratio - a.ratio)
            .map(({ athlete, totalLoad, baseline, status, ratio }) => (
              <div key={athlete.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: athlete.avatar_color ?? '#8B8FA8', color: '#0F1117' }}
                    >
                      {athlete.initials}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-text-primary">{athlete.full_name}</span>
                      <span className="ml-1.5 text-[10px] text-text-muted">{athlete.position}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs tabular-nums text-text-muted">{totalLoad} AU</span>
                    <span className={cn(
                      'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                      status === 'green' ? 'text-green bg-green/10 border-green/20'
                        : status === 'amber' ? 'text-amber bg-amber/10 border-amber/20'
                        : 'text-rose bg-rose/10 border-rose/20'
                    )}>
                      {ratio > 1 ? `+${Math.round((ratio - 1) * 100)}%` : 'On track'}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (totalLoad / (baseline * 1.5)) * 100)}%`,
                      backgroundColor: STATUS_COLORS[status],
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
        <p className="mt-4 text-[10px] text-text-faint">
          Load = session duration × RPE modifier (1=0.6×, 3=1.0×, 5=1.4×). Baseline recalculated monthly.
        </p>
      </div>
    </div>
  )
}
