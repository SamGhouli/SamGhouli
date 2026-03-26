'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, Users, Activity, TrendingUp, MessageSquare, Target } from 'lucide-react'
import { DEMO_DATA, DEMO_INJURY_RECORDS, DEMO_WORKLOAD_ENTRIES, DEMO_ATHLETE_IDS } from '@/lib/demo/data'

const LOAD_BASELINES: Record<string, number> = {
  [DEMO_ATHLETE_IDS.marcus]: 68 * 7,
  [DEMO_ATHLETE_IDS.amara]: 75 * 7,
  [DEMO_ATHLETE_IDS.jordan]: 72 * 7,
}

interface BriefData {
  squadAvailability: string
  loadConcerns: string
  rtpStatus: string
  sessionContext: string
  tacticalNote: string
}

interface PreMatchBriefCardProps {
  opponent: string
  matchDate: string
  daysUntilMatch: number
}

export function PreMatchBriefCard({ opponent, matchDate, daysUntilMatch }: PreMatchBriefCardProps) {
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load concerns
    const loadConcerns = Object.entries(LOAD_BASELINES).map(([athleteId, baseline]) => {
      const entries = DEMO_WORKLOAD_ENTRIES.filter((e) => e.athleteId === athleteId)
      const total = entries.reduce((s, e) => s + e.load, 0)
      if (total > baseline * 1.1) {
        const athlete = DEMO_DATA.athletes.find((a) => a.id === athleteId)
        return { name: athlete?.full_name ?? '', percentAbove: Math.round(((total / baseline) - 1) * 100) }
      }
      return null
    }).filter(Boolean) as { name: string; percentAbove: number }[]

    // RTP athletes
    const rtpAthletes = DEMO_INJURY_RECORDS.filter((r) => r.rtpStage > 0).map((r) => {
      const athlete = DEMO_DATA.athletes.find((a) => a.id === r.athleteId)
      const stageLabels = ['', 'Individual non-contact running', 'Non-contact full squad training', 'Full contact training']
      return {
        name: athlete?.full_name ?? '',
        stage: r.rtpStage,
        cleared: stageLabels[r.rtpStage] ?? 'limited activity',
      }
    })

    const context = {
      opponent,
      matchDate,
      daysUntilMatch,
      availabilitySnapshot: DEMO_DATA.availabilitySummary,
      loadConcerns,
      rtpAthletes,
      reflectionPatterns: undefined,
      tacticalNotes: undefined,
    }

    fetch('/api/coach/pre-match-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    })
      .then((r) => r.json())
      .then((data) => setBrief(data))
      .catch(() => setBrief(null))
      .finally(() => setLoading(false))
  }, [opponent, matchDate, daysUntilMatch])

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-violet/20 bg-violet/5 px-5 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-violet" />
        <span className="text-xs text-text-muted">Generating pre-match brief…</span>
      </div>
    )
  }

  if (!brief) return null

  const sections = [
    { key: 'squadAvailability', label: 'Squad Availability', icon: Users, content: brief.squadAvailability },
    { key: 'loadConcerns', label: 'Load Concerns', icon: Activity, content: brief.loadConcerns },
    { key: 'rtpStatus', label: 'Return-to-Play Status', icon: TrendingUp, content: brief.rtpStatus },
    { key: 'sessionContext', label: 'Session Context', icon: MessageSquare, content: brief.sessionContext },
    { key: 'tacticalNote', label: 'Tactical Note', icon: Target, content: brief.tacticalNote },
  ].filter((s) => s.content)

  return (
    <div className="rounded-xl border border-violet/20 bg-violet/5 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-violet/10">
        <Sparkles className="h-4 w-4 text-violet shrink-0" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-violet">AI Pre-Match Brief</p>
          <p className="mt-0.5 text-[11px] text-text-muted">vs. {opponent} · {daysUntilMatch === 0 ? 'Today' : daysUntilMatch === 1 ? 'Tomorrow' : `In ${daysUntilMatch} days`}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {sections.map(({ key, label, icon: Icon, content }) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Icon className="h-3 w-3 text-text-muted" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
            </div>
            <p className="text-xs text-text-primary leading-relaxed">{content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
