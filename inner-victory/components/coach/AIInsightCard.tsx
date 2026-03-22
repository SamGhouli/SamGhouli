'use client'
import { useEffect, useRef } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { useAIInsight } from '@/hooks/useAIInsights'
import { cn } from '@/lib/utils'

interface AIInsightCardProps {
  context: {
    teamReadiness: number
    physicalScore: number
    mentalAggregateScore: number
    sleepScore: number
    trainingLoad: number
    activeAlerts: { alert_type: string; severity: string; message: string }[]
    daysUntilNextMatch: number
    recentActivity: { type: string; description: string }[]
  }
  initialInsight?: string
}

export function AIInsightCard({ context, initialInsight }: AIInsightCardProps) {
  const { insight, loading, refresh } = useAIInsight(initialInsight)
  const loaded = useRef(false)

  useEffect(() => {
    if (!loaded.current && !initialInsight && context.teamReadiness > 0) {
      loaded.current = true
      refresh(context as unknown as Record<string, unknown>)
    }
  }, [context.teamReadiness]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime/10">
            <Sparkles className="h-4 w-4 text-lime" />
          </div>
          <div>
            <div className="text-xs font-semibold text-text-primary">AI Coaching Insight</div>
            <div className="text-[10px] text-text-muted">Powered by Claude</div>
          </div>
        </div>
        <button
          onClick={() => refresh(context as unknown as Record<string, unknown>)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border-1 px-2.5 py-1.5 text-[11px] text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <div className={cn('min-h-[48px] transition-opacity', loading && 'opacity-40')}>
        {loading ? (
          <div className="space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-surface-3" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-3" />
          </div>
        ) : insight ? (
          <p className="text-sm leading-relaxed text-text-primary">{insight}</p>
        ) : (
          <p className="text-sm text-text-muted">Click refresh to generate today&apos;s coaching insight.</p>
        )}
      </div>
    </div>
  )
}
