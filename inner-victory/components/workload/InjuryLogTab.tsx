'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_DATA, DEMO_INJURY_RECORDS } from '@/lib/demo/data'
import type { RTPStage } from '@/types/database'

const SEVERITY_LABELS: Record<number, { label: string; className: string }> = {
  1: { label: 'Minor', className: 'text-green bg-green/10 border-green/20' },
  2: { label: 'Moderate', className: 'text-amber bg-amber/10 border-amber/20' },
  3: { label: 'Significant', className: 'text-rose bg-rose/10 border-rose/20' },
}

const RTP_STAGES: { stage: RTPStage; label: string; desc: string }[] = [
  { stage: 0, label: 'Not Started', desc: 'Full rest' },
  { stage: 1, label: 'Stage 1', desc: 'Individual running, non-contact' },
  { stage: 2, label: 'Stage 2', desc: 'Non-contact full squad training' },
  { stage: 3, label: 'Stage 3', desc: 'Full contact (pending sign-off)' },
]

export function InjuryLogTab() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rtpStages, setRtpStages] = useState<Record<string, RTPStage>>(
    Object.fromEntries(DEMO_INJURY_RECORDS.map((r) => [r.id, r.rtpStage]))
  )

  function advanceRTP(recordId: string) {
    setRtpStages((prev) => {
      const current = prev[recordId] ?? 0
      const next = Math.min(3, current + 1) as RTPStage
      return { ...prev, [recordId]: next }
    })
  }

  return (
    <div className="space-y-5">
      {/* Summary header */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Injuries', value: DEMO_INJURY_RECORDS.length, color: 'text-rose' },
          { label: 'In Return Protocol', value: DEMO_INJURY_RECORDS.filter((r) => r.rtpStage > 0).length, color: 'text-amber' },
          { label: 'Cleared This Week', value: 0, color: 'text-green' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
            <div className="mt-0.5 text-[10px] text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Injury cards */}
      {DEMO_INJURY_RECORDS.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-2 py-12 text-center">
          <p className="text-sm font-medium text-text-primary">No active injuries</p>
          <p className="mt-1 text-xs text-text-muted">All athletes are healthy.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {DEMO_INJURY_RECORDS.map((record) => {
            const athlete = DEMO_DATA.athletes.find((a) => a.id === record.athleteId)
            if (!athlete) return null
            const sev = SEVERITY_LABELS[record.severity]
            const rtpStage = rtpStages[record.id] ?? record.rtpStage
            const isExpanded = expanded === record.id
            const daysSinceOnset = Math.max(0, Math.ceil(
              (today.getTime() - new Date(record.dateOfOnset + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
            ))

            return (
              <div key={record.id} className="rounded-xl border border-border-1 bg-surface-2">
                {/* Card header */}
                <button
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  onClick={() => setExpanded(isExpanded ? null : record.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: athlete.avatar_color ?? '#8B8FA8', color: '#0F1117' }}
                    >
                      {athlete.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-text-primary">{athlete.full_name}</span>
                        <span className={cn('inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold', sev.className)}>
                          Severity {record.severity} · {sev.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {record.bodyLocation} · Day {daysSinceOnset} · Exp. return {record.expectedReturn}
                      </p>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronDown className="h-4 w-4 shrink-0 text-text-faint" />
                    : <ChevronRight className="h-4 w-4 shrink-0 text-text-faint" />
                  }
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border-1 p-4 space-y-4">
                    {/* Description */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-1">Description</p>
                      <p className="text-xs text-text-primary">{record.description}</p>
                    </div>

                    {/* Mechanism & type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-0.5">Type</p>
                        <p className="text-xs text-text-primary capitalize">{record.injuryType.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-0.5">Mechanism</p>
                        <p className="text-xs text-text-primary capitalize">{record.mechanism}</p>
                      </div>
                    </div>

                    {/* Treatment */}
                    {record.treatmentPlan && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-1">Treatment Plan</p>
                        <p className="text-xs text-text-muted">{record.treatmentPlan}</p>
                      </div>
                    )}

                    {/* Return-to-Play */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">Return-to-Play Protocol</p>
                      <div className="flex gap-1.5">
                        {RTP_STAGES.map(({ stage, label, desc }) => (
                          <div
                            key={stage}
                            className={cn(
                              'flex-1 rounded-lg border px-2 py-2 text-center',
                              rtpStage === stage
                                ? 'border-lime/30 bg-lime/10'
                                : rtpStage > stage
                                ? 'border-border-1 bg-surface-3 opacity-60'
                                : 'border-border-1 bg-surface-3 opacity-30'
                            )}
                          >
                            <p className={cn('text-[10px] font-semibold', rtpStage === stage ? 'text-lime' : 'text-text-muted')}>
                              {label}
                            </p>
                            <p className="mt-0.5 text-[9px] text-text-faint leading-tight">{desc}</p>
                          </div>
                        ))}
                      </div>
                      {rtpStage < 3 && (
                        <button
                          onClick={() => advanceRTP(record.id)}
                          className="mt-2 w-full rounded-lg border border-lime/30 bg-lime/10 py-1.5 text-xs font-medium text-lime transition-colors hover:bg-lime/20"
                        >
                          Advance to {RTP_STAGES[Math.min(3, rtpStage + 1)].label}
                        </button>
                      )}
                      {rtpStage === 3 && (
                        <p className="mt-2 text-center text-[11px] font-medium text-green">
                          ✓ Stage 3 — Pending final clearance
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const today = new Date()
