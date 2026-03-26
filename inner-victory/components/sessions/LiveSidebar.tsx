'use client'

import { useState } from 'react'
import { X, AlertCircle, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_DATA } from '@/lib/demo/data'
import type { SidebarTab, LiveState } from '@/hooks/useSessionPlanner'
import type { SessionPlanV2 } from '@/types/database'

interface LiveSidebarProps {
  plan: SessionPlanV2
  live: LiveState
  onClose: () => void
  onSetTab: (tab: SidebarTab) => void
  onUpdateAthleteStatus: (athleteId: string, status: string) => void
  onLogIncident: (desc: string) => void
  onUpdateNotes: (notes: string) => void
}

const INTENSITY_STYLE: Record<string, string> = {
  low: 'text-green',
  medium: 'text-amber',
  high: 'text-rose',
}

export function LiveSidebar({
  plan,
  live,
  onClose,
  onSetTab,
  onUpdateAthleteStatus,
  onLogIncident,
  onUpdateNotes,
}: LiveSidebarProps) {
  const [incidentText, setIncidentText] = useState('')

  function submitIncident() {
    if (!incidentText.trim()) return
    onLogIncident(incidentText.trim())
    setIncidentText('')
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-border-1 bg-surface-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-1 px-4 py-3">
        <div className="flex gap-1">
          {(['overview', 'roster', 'notes'] as SidebarTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onSetTab(tab)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                live.sidebarTab === tab
                  ? 'bg-lime/15 text-lime'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-text-faint hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Overview tab */}
        {live.sidebarTab === 'overview' && (
          <div className="space-y-2">
            {plan.blocks.map((block, idx) => {
              const isCurrent = idx === live.currentBlockIndex
              const isPast = idx < live.currentBlockIndex
              return (
                <div
                  key={block.id}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 transition-colors',
                    isCurrent
                      ? 'border-lime/30 bg-lime/10'
                      : isPast
                      ? 'border-border-1 bg-surface-2 opacity-50'
                      : 'border-border-1 bg-surface-2'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-xs font-medium', isCurrent ? 'text-lime' : isPast ? 'text-text-faint' : 'text-text-primary')}>
                      {block.name}
                    </span>
                    <span className={cn('text-[10px]', INTENSITY_STYLE[block.intensity])}>
                      {block.durationMins}m
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="mt-0.5 inline-block text-[10px] text-lime/70">Current</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Roster tab */}
        {live.sidebarTab === 'roster' && (
          <div className="space-y-2">
            {DEMO_DATA.athletes.map((athlete) => {
              const base = DEMO_DATA.availability.find((a) => a.athlete_id === athlete.id)
              const currentStatus = live.statusOverrides[athlete.id] ?? base?.status ?? 'full'
              return (
                <div
                  key={athlete.id}
                  className="rounded-lg border border-border-1 bg-surface-2 p-3 space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: athlete.avatar_color ?? '#8B8FA8', color: '#0F1117' }}
                    >
                      {athlete.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-text-primary truncate">{athlete.full_name}</div>
                      <div className="text-[10px] text-text-muted">{athlete.position}</div>
                    </div>
                    <span className={cn(
                      'text-[10px] font-semibold capitalize',
                      currentStatus === 'full' ? 'text-green' : currentStatus === 'limited' ? 'text-amber' : 'text-rose'
                    )}>
                      {currentStatus}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {(['full', 'limited', 'out'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => onUpdateAthleteStatus(athlete.id, s)}
                        className={cn(
                          'flex-1 rounded border py-0.5 text-[10px] font-medium capitalize transition-colors',
                          currentStatus === s
                            ? s === 'full' ? 'border-green/30 bg-green/10 text-green' : s === 'limited' ? 'border-amber/30 bg-amber/10 text-amber' : 'border-rose/30 bg-rose/10 text-rose'
                            : 'border-border-1 bg-surface-3 text-text-faint hover:text-text-muted'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Notes tab */}
        {live.sidebarTab === 'notes' && (
          <div className="space-y-4">
            {/* Coaching notes */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Session Notes
              </label>
              <textarea
                value={live.notes}
                onChange={(e) => onUpdateNotes(e.target.value)}
                placeholder="Live coaching observations, individual flags…"
                rows={5}
                className="w-full resize-none rounded-lg border border-border-1 bg-surface-2 px-3 py-2.5 text-xs text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
              />
            </div>

            {/* Incident log */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Incident Log
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={incidentText}
                  onChange={(e) => setIncidentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitIncident() } }}
                  placeholder="Log an incident…"
                  className="flex-1 rounded-lg border border-border-1 bg-surface-2 px-3 py-1.5 text-xs text-text-primary placeholder:text-text-faint focus:border-amber/40 focus:outline-none"
                />
                <button
                  onClick={submitIncident}
                  disabled={!incidentText.trim()}
                  className="flex items-center gap-1 rounded-lg border border-amber/30 bg-amber/10 px-2 py-1.5 text-[10px] font-medium text-amber disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {live.incidents.length === 0 ? (
                <p className="mt-3 text-center text-[11px] text-text-faint">No incidents logged.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {live.incidents.map((inc) => (
                    <div key={inc.id} className="rounded-lg border border-amber/20 bg-amber/5 p-2.5">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber" />
                        <div>
                          <p className="text-[11px] text-text-primary">{inc.description}</p>
                          <p className="mt-0.5 text-[10px] text-text-faint">
                            {new Date(inc.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
