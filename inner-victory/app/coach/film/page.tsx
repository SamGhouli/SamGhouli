'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import type { FilmSession } from '@/types/database'
import { Film, Tag } from 'lucide-react'

// Demo film session data
const DEMO_FILM_SESSIONS: FilmSession[] = [
  {
    id: 'fs-001',
    team_id: 'demo-team-mcmaster-001',
    title: 'vs. Laurier Golden Hawks — Full Match Review',
    session_type: 'match_review',
    match_result: 'W 3-1',
    clip_count: 18,
    tagged_athlete_ids: ['demo-athlete-001', 'demo-athlete-002'],
    tags: ['pressing', 'set-pieces', 'transition'],
    notes: 'Focus on high press effectiveness. Review defensive shape on second half.',
    created_by: 'demo-coach-001',
    session_date: '2026-03-16',
    created_at: '2026-03-16T11:00:00Z',
  },
  {
    id: 'fs-002',
    team_id: 'demo-team-mcmaster-001',
    title: 'Defensive Shape Workshop — 4-2-3-1 vs Western',
    session_type: 'opposition_scout',
    match_result: undefined,
    clip_count: 11,
    tagged_athlete_ids: ['demo-athlete-007', 'demo-athlete-004'],
    tags: ['defensive-shape', 'opponent-analysis'],
    notes: 'Western run a high line — exploit with through balls.',
    created_by: 'demo-coach-001',
    session_date: '2026-03-19',
    created_at: '2026-03-19T10:00:00Z',
  },
  {
    id: 'fs-003',
    team_id: 'demo-team-mcmaster-001',
    title: 'Set-Piece Routines — Corner & Free Kick Library',
    session_type: 'tactical',
    match_result: undefined,
    clip_count: 9,
    tagged_athlete_ids: [],
    tags: ['set-pieces', 'corners', 'free-kicks'],
    notes: 'New near-post corner variant introduced. Review execution.',
    created_by: 'demo-coach-001',
    session_date: '2026-03-21',
    created_at: '2026-03-21T09:00:00Z',
  },
  {
    id: 'fs-004',
    team_id: 'demo-team-mcmaster-001',
    title: 'Individual Highlights — Marcus Thompson Q1 2026',
    session_type: 'individual',
    match_result: undefined,
    clip_count: 7,
    tagged_athlete_ids: ['demo-athlete-001'],
    tags: ['individual', 'development'],
    notes: 'Attacking movement, finishing technique review.',
    created_by: 'demo-coach-001',
    session_date: '2026-03-14',
    created_at: '2026-03-14T14:00:00Z',
  },
]

const SESSION_TYPE_LABELS: Record<string, string> = {
  match_review: 'Match Review',
  opposition_scout: 'Opposition Scout',
  tactical: 'Tactical',
  individual: 'Individual',
  recovery: 'Recovery',
}

const SESSION_TYPE_COLORS: Record<string, string> = {
  match_review: 'bg-sky/10 border-sky/20 text-sky',
  opposition_scout: 'bg-violet/10 border-violet/20 text-violet',
  tactical: 'bg-amber/10 border-amber/20 text-amber',
  individual: 'bg-teal/10 border-teal/20 text-teal',
  recovery: 'bg-green/10 border-green/20 text-green',
}

const ALL_TYPES = ['all', 'match_review', 'opposition_scout', 'tactical', 'individual']

interface FilmSessionCardProps {
  session: FilmSession
}

function FilmSessionCard({ session }: FilmSessionCardProps) {
  const typeLabel = SESSION_TYPE_LABELS[session.session_type] ?? session.session_type
  const typeColor =
    SESSION_TYPE_COLORS[session.session_type] ?? 'bg-surface-3 border-border-1 text-text-muted'

  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 p-5 flex flex-col gap-3 hover:border-border-1/60 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet/10">
            <Film className="h-4 w-4 text-violet" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary leading-snug truncate">
              {session.title}
            </h3>
            <div className="mt-1 text-[10px] text-text-muted">
              {new Date(session.session_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
        {session.match_result && (
          <span className="shrink-0 rounded border border-green/20 bg-green/10 px-2 py-0.5 text-xs font-semibold text-green">
            {session.match_result}
          </span>
        )}
      </div>

      {/* Type + Clips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${typeColor}`}>
          {typeLabel}
        </span>
        <span className="text-xs text-text-muted">{session.clip_count} clips</span>
      </div>

      {/* Tags */}
      {session.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {session.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded bg-surface-3 px-2 py-0.5 text-[10px] text-text-muted"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {session.notes && (
        <p className="text-[11px] text-text-muted line-clamp-2">{session.notes}</p>
      )}
    </div>
  )
}

export default function FilmPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const sessions: FilmSession[] = isDemo ? DEMO_FILM_SESSIONS : []
  const [filter, setFilter] = useState('all')

  const filtered =
    filter === 'all' ? sessions : sessions.filter((s) => s.session_type === filter)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Film Sessions"
        subtitle={`${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === type
                  ? 'border-lime/30 bg-lime/10 text-lime'
                  : 'border-border-1 bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text-primary'
              }`}
            >
              {type === 'all' ? 'All' : SESSION_TYPE_LABELS[type] ?? type}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="🎬"
            title="No film sessions"
            description="Film sessions will appear here once they have been created."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((session) => (
              <FilmSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
