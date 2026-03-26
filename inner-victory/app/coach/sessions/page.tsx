'use client'

import { Plus, Calendar, CheckCircle2, Clock, PlayCircle, Edit2 } from 'lucide-react'
import { TopBar } from '@/components/shared/TopBar'
import { useSessionPlanner } from '@/hooks/useSessionPlanner'
import { SessionBuilder } from '@/components/sessions/SessionBuilder'
import { LiveSessionView } from '@/components/sessions/LiveSessionView'
import { PostSessionFlow } from '@/components/sessions/PostSessionFlow'
import { cn } from '@/lib/utils'
import type { SessionPlanV2 } from '@/types/database'
import { DEMO_DATA } from '@/lib/demo/data'

// Days to next match from demo data
const today = new Date()
const nextMatchEvent = DEMO_DATA.upcomingEvents.find((e) => e.event_type === 'match')
const DAYS_TO_MATCH = nextMatchEvent
  ? Math.max(0, Math.ceil((new Date(nextMatchEvent.event_date + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  : 0

const SESSION_TYPE_LABELS: Record<string, string> = {
  'pre-match': 'Pre-Match',
  'post-match': 'Post-Match',
  'recovery': 'Recovery',
  'high-intensity': 'High-Intensity',
  'technical': 'Technical',
  'tactical': 'Tactical',
  'strength': 'Strength & Conditioning',
  'friendly': 'Friendly',
}

const STATUS_CONFIG = {
  planned: { label: 'Planned', className: 'text-sky bg-sky/10 border-sky/20' },
  live: { label: 'Live', className: 'text-lime bg-lime/10 border-lime/20' },
  completed: { label: 'Completed', className: 'text-text-muted bg-surface-3 border-border-1' },
}

function SessionListCard({
  session,
  onEdit,
  onStart,
  onReflect,
}: {
  session: SessionPlanV2
  onEdit: () => void
  onStart: () => void
  onReflect: () => void
}) {
  const cfg = STATUS_CONFIG[session.status]
  const d = new Date(session.date + 'T00:00:00')
  const totalMins = session.blocks.reduce((s, b) => s + b.durationMins, 0)

  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-primary truncate">
            {session.title || '(Untitled session)'}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-muted">
            <Calendar className="h-3 w-3" />
            {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' · '}{session.startTime}
            {' · '}
            <Clock className="h-3 w-3" />{totalMins} min
          </div>
          <div className="mt-1 text-[11px] text-text-muted">
            {SESSION_TYPE_LABELS[session.sessionType] ?? session.sessionType}
            {session.venue && ` · ${session.venue}`}
          </div>
        </div>
        <span className={cn('shrink-0 inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold', cfg.className)}>
          {cfg.label}
        </span>
      </div>

      {/* Block summary pills */}
      {session.blocks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {session.blocks.map((block) => (
            <span
              key={block.id}
              className="inline-flex items-center rounded-full border border-border-2 px-2 py-0.5 text-[10px] text-text-faint"
            >
              {block.name} · {block.durationMins}m
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {session.status === 'planned' && (
          <>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-lg border border-border-1 bg-surface-3 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
            <button
              onClick={onStart}
              disabled={session.blocks.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 text-xs font-bold text-bg transition-opacity disabled:opacity-40"
            >
              <PlayCircle className="h-3.5 w-3.5" /> Start Session
            </button>
          </>
        )}
        {session.status === 'completed' && (
          <div className="flex items-center gap-1.5 text-xs text-text-faint">
            <CheckCircle2 className="h-3.5 w-3.5 text-lime" />
            Completed
            {session.rpe !== undefined && (
              <span className="ml-1 text-text-faint">· RPE {session.rpe}</span>
            )}
          </div>
        )}
        {session.status === 'live' && (
          <button
            onClick={onReflect}
            className="flex items-center gap-1.5 rounded-lg bg-rose/20 px-3 py-1.5 text-xs font-bold text-rose"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Complete Session
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function TrainingSessionsPage() {
  const planner = useSessionPlanner()
  const { phase, sessions, actions } = planner

  // Phase B — live session is a fixed fullscreen overlay
  if (phase === 'live') {
    return <LiveSessionView planner={planner} />
  }

  // Phase A — builder
  if (phase === 'builder') {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Session Builder"
          subtitle="Plan your training session structure"
        />
        <SessionBuilder planner={planner} daysToMatch={DAYS_TO_MATCH} />
      </div>
    )
  }

  // Phase C — reflection
  if (phase === 'reflection') {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Training Sessions"
          subtitle="Post-session reflection"
        />
        <PostSessionFlow planner={planner} />
      </div>
    )
  }

  // Phase list — default view
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Training Sessions"
        subtitle="Plan, run, and reflect on every session"
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Session Plans</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              {DAYS_TO_MATCH > 0 && (
                <span className="ml-2 text-amber font-medium">{DAYS_TO_MATCH} days to next match</span>
              )}
            </p>
          </div>
          <button
            onClick={actions.newSession}
            className="flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2 text-sm font-bold text-bg transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-2 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No sessions yet</p>
            <p className="mt-1 text-xs text-text-muted">Create your first session plan to get started.</p>
            <button
              onClick={actions.newSession}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2 text-sm font-bold text-bg mx-auto"
            >
              <Plus className="h-4 w-4" /> New Session
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {sessions.map((session) => (
              <SessionListCard
                key={session.id}
                session={session}
                onEdit={() => actions.editSession(session.id)}
                onStart={() => {
                  actions.editSession(session.id)
                  // startSession is called from builder
                }}
                onReflect={() => actions.endSession()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
