'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Sparkles, Activity, Wifi } from 'lucide-react'
import { ReadinessRing } from '@/components/athlete/ReadinessRing'
import { PillarCard } from '@/components/athlete/PillarCard'

// Mock data for demo mode
const DEMO_ATHLETE = {
  full_name: 'Samir Ghouli',
  jersey_number: 4,
  position: 'Attacking Mid',
  initials: 'SG',
  avatar_color: '#d4ff5c',
}

const DEMO_TODAY = {
  combined_score: 78,
  physical_score: 82,
  mental_score: 71,
  sleep_score: 75,
  hrv: 58,
  resting_hr: 52,
  sleep_hours: 7.5,
  strain: 8.2,
}

const DEMO_YESTERDAY = {
  combined_score: 74,
  physical_score: 77,
  mental_score: 68,
  sleep_score: 70,
}

const DEMO_TREND_7D = [
  { day: 'Mon', combined: 65, physical: 68 },
  { day: 'Tue', combined: 70, physical: 72 },
  { day: 'Wed', combined: 62, physical: 65 },
  { day: 'Thu', combined: 74, physical: 77 },
  { day: 'Fri', combined: 71, physical: 74 },
  { day: 'Sat', combined: 74, physical: 77 },
  { day: 'Sun', combined: 78, physical: 82 },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Inline Sparkline using SVG
function Sparkline({
  data,
  color,
  width = 260,
  height = 48,
}: {
  data: number[]
  color: string
  width?: number
  height?: number
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 8) - 4
    return `${x},${y}`
  })
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  )
}

function AthleteHomeContent() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const [athlete] = useState(DEMO_ATHLETE)
  const [today] = useState(DEMO_TODAY)
  const [yesterday] = useState(DEMO_YESTERDAY)
  const [insight, setInsight] = useState<string | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)

  const now = new Date()
  const dateStr = formatDate(now)
  const greeting = getGreeting()

  // Fetch AI insight if in demo or authenticated
  useEffect(() => {
    if (isDemo) {
      setInsight(
        'Your HRV is trending up and sleep quality improved overnight. Today looks good for a higher-intensity session — just watch your stress levels heading into the week.'
      )
      return
    }
    setInsightLoading(true)
    fetch('/api/athlete/insight', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => setInsight(d.insight))
      .catch(() =>
        setInsight(
          'Your readiness looks solid today. Keep up the good work!'
        )
      )
      .finally(() => setInsightLoading(false))
  }, [isDemo])

  const pillars = [
    {
      label: 'Physical',
      score: today.physical_score,
      delta: today.physical_score - yesterday.physical_score,
      color: '#4ade80',
    },
    {
      label: 'Mental',
      score: today.mental_score,
      delta: today.mental_score - yesterday.mental_score,
      color: '#60a5fa',
    },
    {
      label: 'Sleep',
      score: today.sleep_score,
      delta: today.sleep_score - yesterday.sleep_score,
      color: '#a78bfa',
    },
  ]

  const combinedTrend = DEMO_TREND_7D.map((d) => d.combined)
  const physicalTrend = DEMO_TREND_7D.map((d) => d.physical)

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-text-muted font-medium">{greeting}</p>
          <h1 className="text-xl font-bold text-text-primary leading-tight">
            {athlete.full_name.split(' ')[0]}
          </h1>
        </div>
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            backgroundColor: `${athlete.avatar_color}20`,
            color: athlete.avatar_color,
            border: `2px solid ${athlete.avatar_color}40`,
          }}
        >
          {athlete.initials}
        </div>
      </div>

      {/* Date strip */}
      <div className="flex items-center justify-between mb-6 rounded-xl bg-surface-2 px-4 py-2.5 border border-border-1">
        <span className="text-xs text-text-muted font-medium">{dateStr}</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
          <span className="text-[11px] text-text-muted">Synced</span>
        </div>
      </div>

      {/* Readiness Ring */}
      <div className="flex justify-center mb-6">
        <ReadinessRing score={today.combined_score} size={180} />
      </div>

      {/* Pillar Cards */}
      <div className="flex gap-3 mb-5">
        {pillars.map((p) => (
          <PillarCard
            key={p.label}
            label={p.label}
            score={p.score}
            delta={p.delta}
            color={p.color}
          />
        ))}
      </div>

      {/* AI Insight Card */}
      <div className="rounded-xl bg-surface-2 border border-border-1 p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime-dim">
            <Sparkles className="h-4 w-4 text-lime" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-muted mb-1">AI Insight</p>
            {insightLoading ? (
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-surface-3 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-surface-3 animate-pulse" />
              </div>
            ) : (
              <p className="text-sm text-text-primary leading-relaxed">{insight}</p>
            )}
          </div>
        </div>
      </div>

      {/* 7-day Trend Sparkline */}
      <div className="rounded-xl bg-surface-2 border border-border-1 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-text-primary">7-Day Trend</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green" />
              <span className="text-[10px] text-text-muted">Combined</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky" />
              <span className="text-[10px] text-text-muted">Physical</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Sparkline data={combinedTrend} color="#4ade80" />
          </div>
          <Sparkline data={physicalTrend} color="#60a5fa" />
        </div>
        <div className="flex justify-between mt-2">
          {DEMO_TREND_7D.map((d) => (
            <span key={d.day} className="text-[10px] text-text-faint">
              {d.day}
            </span>
          ))}
        </div>
      </div>

      {/* Wearable Stat Tiles 2x2 */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          Wearable Data
        </p>
        <div className="grid grid-cols-2 gap-3">
          <WearableTile label="HRV" value={`${today.hrv}`} unit="ms" color="#4ade80" />
          <WearableTile label="Resting HR" value={`${today.resting_hr}`} unit="bpm" color="#fb7185" />
          <WearableTile label="Sleep" value={`${today.sleep_hours}`} unit="hrs" color="#a78bfa" />
          <WearableTile label="Strain" value={`${today.strain}`} unit="/ 21" color="#fbbf24" />
        </div>
      </div>

      {/* Privacy notice */}
      <p className="text-center text-[11px] text-text-faint leading-relaxed">
        Your data is private and encrypted. Coaches see only availability status — never your personal metrics or notes.
      </p>
    </div>
  )
}

function WearableTile({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string
  unit: string
  color: string
}) {
  return (
    <div className="rounded-xl bg-surface-2 border border-border-1 p-4">
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {value}
        </span>
        <span className="text-xs text-text-faint">{unit}</span>
      </div>
    </div>
  )
}

export default function AthletePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="h-8 w-8 rounded-full border-2 border-lime border-t-transparent animate-spin" /></div>}>
      <AthleteHomeContent />
    </Suspense>
  )
}
