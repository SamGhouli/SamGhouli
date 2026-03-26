'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, Eye } from 'lucide-react'
import { DEMO_DATA, DEMO_INJURY_RECORDS, DEMO_WORKLOAD_ENTRIES, DEMO_ATHLETE_IDS } from '@/lib/demo/data'

// Baselines
const LOAD_BASELINES: Record<string, number> = {
  [DEMO_ATHLETE_IDS.amara]: 75 * 7,
  [DEMO_ATHLETE_IDS.jordan]: 72 * 7,
}

interface PreviewData {
  context: string
  recommendation: string
  watchList: { name: string; flag: string; action: string }[]
}

export function MondayPreviewCard() {
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const today = new Date()
    const nextMatch = DEMO_DATA.upcomingEvents.find((e) => e.event_type === 'match')
    const daysToNextMatch = nextMatch
      ? Math.max(0, Math.ceil((new Date(nextMatch.event_date + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    // Flagged athletes
    const flaggedAthletes = [
      ...DEMO_DATA.availability.filter((a) => a.status !== 'full').map((a) => {
        const athlete = DEMO_DATA.athletes.find((at) => at.id === a.athlete_id)
        return { name: athlete?.full_name ?? '', reason: a.reason, flag: a.status === 'out' ? 'Unavailable' : 'Limited Availability' }
      }),
      // Overload flags
      ...Object.entries(LOAD_BASELINES).map(([athleteId, baseline]) => {
        const entries = DEMO_WORKLOAD_ENTRIES.filter((e) => e.athleteId === athleteId)
        const total = entries.reduce((s, e) => s + e.load, 0)
        if (total > baseline * 1.25) {
          const athlete = DEMO_DATA.athletes.find((a) => a.id === athleteId)
          return { name: athlete?.full_name ?? '', reason: 'Load above baseline', flag: 'Accumulated Load' }
        }
        return null
      }).filter(Boolean) as { name: string; reason: string; flag: string }[],
    ].filter((a) => a.name).slice(0, 3)

    const context = {
      teamName: DEMO_DATA.team.name,
      daysToNextMatch,
      nextMatchOpponent: nextMatch?.title.replace(/^.*vs\.\s*/i, '').replace(/^.*vs\s*/i, '') ?? 'Unknown',
      lastWeekLoad: 'above baseline',
      baselineLoad: 'normal',
      fullCount: DEMO_DATA.availabilitySummary.full,
      limitedCount: DEMO_DATA.availabilitySummary.limited,
      outCount: DEMO_DATA.availabilitySummary.out,
      flaggedAthletes,
      upcomingSessionTypes: DEMO_DATA.upcomingEvents.filter((e) => e.event_type === 'training').map((e) => e.title),
      injuryPatterns: DEMO_INJURY_RECORDS.length > 0
        ? `${DEMO_INJURY_RECORDS.length} active injuries including ${DEMO_INJURY_RECORDS.map((r) => {
            const athlete = DEMO_DATA.athletes.find((a) => a.id === r.athleteId)
            return `${athlete?.full_name ?? 'Unknown'} (${r.bodyLocation})`
          }).join(', ')}`
        : undefined,
    }

    fetch('/api/coach/monday-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    })
      .then((r) => r.json())
      .then((data) => setPreview(data))
      .catch(() => setPreview(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-violet/20 bg-violet/5 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-violet" />
        <span className="text-xs text-text-muted">Preparing your Monday morning preview…</span>
      </div>
    )
  }

  if (!preview) return null

  return (
    <div className="rounded-xl border border-violet/20 bg-violet/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-violet shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet">Monday Morning Preview</p>
            <p className="mt-0.5 text-xs text-text-muted truncate max-w-sm">
              {preview.recommendation.split('.')[0]}.
            </p>
          </div>
        </div>
        <Eye className={`h-4 w-4 shrink-0 text-violet/60 transition-opacity ${expanded ? 'opacity-100' : 'opacity-50'}`} />
      </button>

      {expanded && (
        <div className="border-t border-violet/10 px-5 pb-5 space-y-4">
          {/* This Week's Context */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
              This Week&apos;s Context
            </p>
            <p className="text-xs text-text-primary leading-relaxed">{preview.context}</p>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg border border-violet/15 bg-violet/10 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-violet">
              This Week&apos;s Recommendation
            </p>
            <p className="text-xs text-text-primary leading-relaxed">{preview.recommendation}</p>
          </div>

          {/* Watch List */}
          {preview.watchList.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                Watch List
              </p>
              <div className="space-y-2">
                {preview.watchList.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-amber/20 bg-amber/5 p-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{item.name}</p>
                        <p className="text-[10px] text-amber">{item.flag}</p>
                        <p className="mt-0.5 text-[11px] text-text-muted">{item.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
