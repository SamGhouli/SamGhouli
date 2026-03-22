'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/utils'

type Period = '7d' | '30d' | 'season'

// Mock trend data
const TREND_7D = [
  { date: 'Mon', combined: 65, physical: 68, mental: 60, sleep: 72, load: 7.2 },
  { date: 'Tue', combined: 70, physical: 72, mental: 65, sleep: 76, load: 8.5 },
  { date: 'Wed', combined: 62, physical: 65, mental: 58, sleep: 68, load: 9.1 },
  { date: 'Thu', combined: 74, physical: 77, mental: 68, sleep: 78, load: 6.8 },
  { date: 'Fri', combined: 71, physical: 74, mental: 66, sleep: 75, load: 7.5 },
  { date: 'Sat', combined: 74, physical: 77, mental: 70, sleep: 70, load: 5.2 },
  { date: 'Sun', combined: 78, physical: 82, mental: 71, sleep: 75, load: 8.2 },
]

const TREND_30D = Array.from({ length: 30 }, (_, i) => {
  const base = 68 + Math.sin(i / 4) * 10
  return {
    date: `D${i + 1}`,
    combined: Math.round(base + Math.random() * 6 - 3),
    physical: Math.round(base + 4 + Math.random() * 6 - 3),
    mental: Math.round(base - 4 + Math.random() * 6 - 3),
    sleep: Math.round(base + 2 + Math.random() * 6 - 3),
    load: parseFloat((7 + Math.random() * 4).toFixed(1)),
  }
})

const TREND_SEASON = Array.from({ length: 16 }, (_, i) => {
  const base = 64 + i * 0.8
  return {
    date: `Wk ${i + 1}`,
    combined: Math.round(base + Math.random() * 8 - 4),
    physical: Math.round(base + 4 + Math.random() * 8 - 4),
    mental: Math.round(base - 4 + Math.random() * 8 - 4),
    sleep: Math.round(base + 2 + Math.random() * 8 - 4),
    load: parseFloat((8 + Math.random() * 5).toFixed(1)),
  }
})

const DATA_MAP: Record<Period, typeof TREND_7D> = {
  '7d': TREND_7D,
  '30d': TREND_30D,
  season: TREND_SEASON,
}

const CHART_THEME = {
  grid: 'rgba(255,255,255,0.05)',
  axisText: '#7a869a',
  tooltip: {
    contentStyle: {
      backgroundColor: '#181c2a',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      color: '#e8ebf5',
      fontSize: 12,
    },
    cursor: { stroke: 'rgba(255,255,255,0.08)' },
  },
}

const TABS: { label: string; value: Period }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'Season', value: 'season' },
]

export default function TrendsPage() {
  const [period, setPeriod] = useState<Period>('7d')
  const data = DATA_MAP[period]

  return (
    <div className="min-h-screen px-4 pt-6 pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Trends</h1>
        <p className="text-sm text-text-muted mt-0.5">Your readiness over time</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 rounded-xl bg-surface-2 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={cn(
              'flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 min-h-[36px]',
              period === tab.value
                ? 'bg-surface-3 text-text-primary'
                : 'text-text-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Combined Readiness Line Chart */}
      <div className="rounded-xl bg-surface-2 border border-border-1 p-4">
        <p className="text-xs font-semibold text-text-primary mb-4">Combined Readiness</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART_THEME.axisText, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={period === '30d' ? 4 : 0}
            />
            <YAxis
              domain={[40, 100]}
              tick={{ fill: CHART_THEME.axisText, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={CHART_THEME.tooltip.contentStyle}
              cursor={CHART_THEME.tooltip.cursor}
            />
            <Line
              type="monotone"
              dataKey="combined"
              name="Combined"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#4ade80' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stacked Area: Physical + Mental + Sleep */}
      <div className="rounded-xl bg-surface-2 border border-border-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-text-primary">Pillar Breakdown</p>
          <div className="flex items-center gap-3">
            {[
              { label: 'Physical', color: '#4ade80' },
              { label: 'Mental', color: '#60a5fa' },
              { label: 'Sleep', color: '#a78bfa' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[10px] text-text-muted">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPhysical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMental" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSleep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART_THEME.axisText, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={period === '30d' ? 4 : 0}
            />
            <YAxis
              domain={[30, 100]}
              tick={{ fill: CHART_THEME.axisText, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={CHART_THEME.tooltip.contentStyle}
              cursor={CHART_THEME.tooltip.cursor}
            />
            <Area
              type="monotone"
              dataKey="physical"
              name="Physical"
              stroke="#4ade80"
              strokeWidth={1.5}
              fill="url(#gradPhysical)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="mental"
              name="Mental"
              stroke="#60a5fa"
              strokeWidth={1.5}
              fill="url(#gradMental)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="sleep"
              name="Sleep"
              stroke="#a78bfa"
              strokeWidth={1.5}
              fill="url(#gradSleep)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Training Load Bar Chart */}
      <div className="rounded-xl bg-surface-2 border border-border-1 p-4">
        <p className="text-xs font-semibold text-text-primary mb-4">Training Load (Strain)</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={period === 'season' ? 8 : 14}>
            <CartesianGrid stroke={CHART_THEME.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART_THEME.axisText, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={period === '30d' ? 4 : 0}
            />
            <YAxis
              domain={[0, 16]}
              tick={{ fill: CHART_THEME.axisText, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={CHART_THEME.tooltip.contentStyle}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar
              dataKey="load"
              name="Strain"
              fill="#fbbf24"
              opacity={0.8}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight blurb */}
      <div className="rounded-xl bg-surface-2 border border-border-1 p-4">
        <p className="text-xs font-semibold text-text-muted mb-1">Trend Insight</p>
        <p className="text-sm text-text-primary leading-relaxed">
          Your readiness is trending upward over the past 7 days (+13 pts). Sleep quality is your strongest pillar. Consider monitoring mental scores heading into match week.
        </p>
      </div>
    </div>
  )
}
