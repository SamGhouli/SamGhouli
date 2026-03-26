'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { SessionPlanV2 } from '@/types/database'

interface AIPreSessionCardProps {
  draft: SessionPlanV2
  daysToMatch: number
}

export function AIPreSessionCard({ draft, daysToMatch }: AIPreSessionCardProps) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasSufficientData = draft.blocks.length >= 2 && draft.sessionType

  useEffect(() => {
    if (!hasSufficientData) {
      setInsight(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setInsight(null)

    const context = {
      sessionType: draft.sessionType,
      daysToNextMatch: daysToMatch,
      blocks: draft.blocks.map((b) => ({ type: b.type, intensity: b.intensity, durationMins: b.durationMins })),
    }

    fetch('/api/coach/session-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setInsight(data.insight ?? null)
      })
      .catch(() => {
        if (!cancelled) setInsight(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [hasSufficientData, draft.blocks.length, draft.sessionType, daysToMatch])

  if (!hasSufficientData) return null

  return (
    <div className="rounded-xl border border-violet/20 bg-violet/5 p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-violet shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-violet">AI Pre-Session Insight</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-text-faint" />
          <span className="text-xs text-text-faint">Analysing session plan…</span>
        </div>
      ) : insight ? (
        <p className="text-xs text-text-primary leading-relaxed">{insight}</p>
      ) : null}
    </div>
  )
}
