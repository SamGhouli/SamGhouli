'use client'

import { AlertTriangle } from 'lucide-react'
import { DEMO_DATA } from '@/lib/demo/data'
import type { SessionBlockV2 } from '@/types/database'

interface AvailabilitySnapshotProps {
  blocks: SessionBlockV2[]
}

export function AvailabilitySnapshot({ blocks }: AvailabilitySnapshotProps) {
  const flagged = DEMO_DATA.availability.filter((a) => a.status !== 'full')
  const hasHighBlock = blocks.some((b) => b.intensity === 'high')
  const limitedAthletes = flagged.filter((a) => a.status === 'limited')

  const showWarning = hasHighBlock && limitedAthletes.length > 0

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
        Squad Availability
      </h3>

      {showWarning && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber/5 p-3">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
          <div>
            <p className="text-xs font-semibold text-amber">High Intensity Block Warning</p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {limitedAthletes.map((a) => {
                const athlete = DEMO_DATA.athletes.find((at) => at.id === a.athlete_id)
                return athlete?.full_name.split(' ')[0]
              }).filter(Boolean).join(' and ')}{' '}
              {limitedAthletes.length === 1 ? 'is' : 'are'} on limited availability — consider
              reducing their workload in the high-intensity block.
            </p>
          </div>
        </div>
      )}

      {flagged.length === 0 ? (
        <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
          <p className="text-xs text-text-muted text-center">Full squad available today.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {flagged.map((avail) => {
            const athlete = DEMO_DATA.athletes.find((a) => a.id === avail.athlete_id)
            if (!athlete) return null
            return (
              <div
                key={avail.id}
                className="flex items-start gap-2.5 rounded-xl border border-border-1 bg-surface-2 p-3"
              >
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: athlete.avatar_color ?? '#8B8FA8', color: '#0F1117' }}
                >
                  {athlete.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-text-primary">{athlete.full_name}</span>
                    <span className={`shrink-0 text-[10px] font-semibold capitalize ${
                      avail.status === 'out' ? 'text-rose' : 'text-amber'
                    }`}>
                      {avail.status}
                    </span>
                  </div>
                  {avail.reason && (
                    <p className="mt-0.5 text-[11px] text-text-muted truncate">{avail.reason}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full availability list */}
      <div className="border-t border-border-1 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">All Athletes</p>
        <div className="grid grid-cols-3 gap-1.5">
          {DEMO_DATA.athletes.map((athlete) => {
            const avail = DEMO_DATA.availability.find((a) => a.athlete_id === athlete.id)
            const status = avail?.status ?? 'full'
            return (
              <div
                key={athlete.id}
                className="flex items-center gap-1.5 rounded-lg border border-border-1 bg-surface-3 px-2 py-1.5"
              >
                <div
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      status === 'full' ? '#3DB87F' : status === 'limited' ? '#fbbf24' : '#f43f5e',
                  }}
                />
                <span className="truncate text-[10px] text-text-muted">
                  {athlete.full_name.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
