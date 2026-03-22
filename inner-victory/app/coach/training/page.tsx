'use client'

import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { DEMO_DATA } from '@/lib/demo/data'
import type { TrainingSession } from '@/types/database'
import { Dumbbell } from 'lucide-react'

const SESSION_TYPE_COLORS: Record<string, string> = {
  cardio: 'bg-rose/10 border-rose/20 text-rose',
  tactical: 'bg-violet/10 border-violet/20 text-violet',
  recovery: 'bg-teal/10 border-teal/20 text-teal',
  strength: 'bg-amber/10 border-amber/20 text-amber',
  technical: 'bg-sky/10 border-sky/20 text-sky',
  match_prep: 'bg-lime/10 border-lime/20 text-lime',
}

const INTENSITY_CONFIG = {
  high: { color: 'bg-rose', label: 'High' },
  moderate: { color: 'bg-amber', label: 'Moderate' },
  low: { color: 'bg-green', label: 'Low' },
}

function rpeColor(rpe: number) {
  if (rpe >= 8) return 'text-rose'
  if (rpe >= 6) return 'text-amber'
  return 'text-green'
}

export default function TrainingPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const sessions: TrainingSession[] = isDemo ? DEMO_DATA.trainingSessions : []

  // Summary stats
  const thisWeekSessions = sessions // In demo all are this week
  const avgDuration =
    thisWeekSessions.length
      ? Math.round(
          thisWeekSessions.reduce((s, t) => s + t.duration_mins, 0) / thisWeekSessions.length
        )
      : 0
  const avgRpe =
    thisWeekSessions.length
      ? (thisWeekSessions.reduce((s, t) => s + t.avg_rpe, 0) / thisWeekSessions.length).toFixed(1)
      : '—'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Training Log"
        subtitle={`${sessions.length} session${sessions.length !== 1 ? 's' : ''} recorded`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="text-xs text-text-muted mb-1">Sessions This Week</div>
            <div className="text-2xl font-bold text-lime tabular-nums">{thisWeekSessions.length}</div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="text-xs text-text-muted mb-1">Avg Duration</div>
            <div className="text-2xl font-bold text-sky tabular-nums">
              {avgDuration}
              <span className="text-sm font-normal text-text-muted"> min</span>
            </div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="text-xs text-text-muted mb-1">Avg RPE This Week</div>
            <div className={`text-2xl font-bold tabular-nums ${rpeColor(parseFloat(String(avgRpe)))}`}>
              {avgRpe}
              <span className="text-sm font-normal text-text-muted"> / 10</span>
            </div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="text-xs text-text-muted mb-1">Highest Intensity</div>
            <div className="text-2xl font-bold text-rose tabular-nums">
              {sessions.filter((s) => s.intensity === 'high').length}
            </div>
            <div className="text-[10px] text-text-muted">high-intensity</div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            icon="🏋️"
            title="No training sessions"
            description="Training sessions will appear here once they are logged."
          />
        ) : (
          <div className="space-y-3">
            {sessions
              .slice()
              .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
              .map((session) => {
                const typeColor =
                  SESSION_TYPE_COLORS[session.session_type] ??
                  'bg-surface-3 border-border-1 text-text-muted'
                const intensity =
                  INTENSITY_CONFIG[session.intensity as keyof typeof INTENSITY_CONFIG] ??
                  INTENSITY_CONFIG.moderate

                return (
                  <div
                    key={session.id}
                    className="rounded-xl border border-border-1 bg-surface-2 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber/10">
                        <Dumbbell className="h-4 w-4 text-amber" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-text-primary truncate">
                              {session.title}
                            </h3>
                            <div className="mt-1 text-[10px] text-text-muted">
                              {new Date(session.session_date).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className={`text-lg font-bold tabular-nums ${rpeColor(session.avg_rpe)}`}>
                              {session.avg_rpe.toFixed(1)}
                            </div>
                            <div className="text-[10px] text-text-muted">avg RPE</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          {/* Type chip */}
                          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize ${typeColor}`}>
                            {session.session_type.replace('_', ' ')}
                          </span>

                          {/* Duration */}
                          <span className="text-xs text-text-muted">
                            {session.duration_mins} min
                          </span>

                          {/* Intensity indicator */}
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${intensity.color}`} />
                            <span className="text-xs text-text-muted">{intensity.label}</span>
                          </div>
                        </div>

                        {session.notes && (
                          <p className="mt-2 text-[11px] text-text-muted line-clamp-2">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
