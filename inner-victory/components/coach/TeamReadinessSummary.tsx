'use client'
import { cn } from '@/lib/utils'

interface PillarBarProps {
  label: string
  value: number
  delta?: number
  color: string
}

function PillarBar({ label, value, delta, color }: PillarBarProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-text-muted">{label}</span>
        <div className="flex items-center gap-2">
          {delta !== undefined && (
            <span className={cn('text-[10px] font-medium', delta >= 0 ? 'text-green' : 'text-rose')}>
              {delta >= 0 ? '+' : ''}{delta}
            </span>
          )}
          <span className="text-xs font-semibold tabular-nums text-text-primary">{value}</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

interface TeamReadinessSummaryProps {
  physicalScore: number
  mentalScore: number
  sleepScore: number
  trainingLoad: number
  physicalDelta?: number
  mentalDelta?: number
  sleepDelta?: number
}

export function TeamReadinessSummary({
  physicalScore,
  mentalScore,
  sleepScore,
  trainingLoad,
  physicalDelta,
  mentalDelta,
  sleepDelta,
}: TeamReadinessSummaryProps) {
  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
      <h2 className="mb-4 text-sm font-semibold text-text-primary">Team Readiness Breakdown</h2>
      <div className="space-y-4">
        <PillarBar label="Physical" value={physicalScore} delta={physicalDelta} color="#4ade80" />
        <PillarBar label="Mental (Agg.)" value={mentalScore} delta={mentalDelta} color="#60a5fa" />
        <PillarBar label="Sleep" value={sleepScore} delta={sleepDelta} color="#a78bfa" />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-text-muted">Training Load</span>
            <span className="text-xs font-semibold tabular-nums text-text-primary">{trainingLoad} AU</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-amber transition-all duration-700"
              style={{ width: `${Math.min(100, (trainingLoad / 21) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
