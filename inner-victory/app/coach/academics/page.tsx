'use client'

import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { FlagTag } from '@/components/shared/FlagTag'
import { DEMO_DATA } from '@/lib/demo/data'
import type { AcademicRecord, User } from '@/types/database'
import { BookOpen } from 'lucide-react'

interface AcademicRow extends AcademicRecord {
  athlete: User
}

function buildDemoRows(): AcademicRow[] {
  return DEMO_DATA.academicRecords.map((rec) => ({
    ...rec,
    athlete: DEMO_DATA.athletes.find((a) => a.id === rec.athlete_id)!,
  }))
}

const ELIGIBILITY_CONFIG = {
  ok: {
    label: 'Eligible',
    className: 'bg-green/10 border-green/20 text-green',
  },
  review: {
    label: 'Under Review',
    className: 'bg-amber/10 border-amber/20 text-amber',
  },
  ineligible: {
    label: 'Ineligible',
    className: 'bg-rose/10 border-rose/20 text-rose',
  },
}

function gpaColor(gpa: number) {
  if (gpa >= 3.0) return 'text-green'
  if (gpa >= 2.3) return 'text-amber'
  return 'text-rose'
}

export default function AcademicsPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const rows: AcademicRow[] = isDemo ? buildDemoRows() : []

  const flaggedCount = rows.filter((r) => r.eligibility_status !== 'ok').length

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Academic Flags"
        subtitle={`${flaggedCount} flagged · ${rows.length} athletes tracked`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {(['ok', 'review', 'ineligible'] as const).map((status) => {
            const count = rows.filter((r) => r.eligibility_status === status).length
            const cfg = ELIGIBILITY_CONFIG[status]
            return (
              <div
                key={status}
                className="rounded-xl border border-border-1 bg-surface-2 p-4 flex items-center gap-3"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${cfg.className}`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <div className={`text-2xl font-bold tabular-nums ${cfg.className.split(' ').find(c => c.startsWith('text-'))}`}>
                    {count}
                  </div>
                  <div className="text-[10px] text-text-muted">{cfg.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No academic records"
            description="Academic records will appear here once they are added for your athletes."
          />
        ) : (
          <div className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-1 bg-surface-3/50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-text-muted">Athlete</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">GPA</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Attendance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Eligibility</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Flag Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-1">
                  {rows
                    .slice()
                    .sort((a, b) => {
                      const order = { ineligible: 0, review: 1, ok: 2 }
                      return order[a.eligibility_status] - order[b.eligibility_status]
                    })
                    .map((row) => {
                      const cfg = ELIGIBILITY_CONFIG[row.eligibility_status]
                      return (
                        <tr key={row.id} className="hover:bg-surface-3/40 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-bg"
                                style={{ backgroundColor: row.athlete.avatar_color ?? '#7a869a' }}
                              >
                                {row.athlete.initials ?? '?'}
                              </div>
                              <div>
                                <div className="text-xs font-medium text-text-primary">
                                  {row.athlete.full_name}
                                </div>
                                <div className="text-[10px] text-text-muted">
                                  {row.athlete.position} · {row.athlete.year_of_study}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-mono text-sm font-semibold ${gpaColor(row.gpa)}`}>
                              {row.gpa.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-mono text-sm font-semibold ${
                                row.attendance_pct >= 85
                                  ? 'text-green'
                                  : row.attendance_pct >= 75
                                  ? 'text-amber'
                                  : 'text-rose'
                              }`}
                            >
                              {row.attendance_pct}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-text-muted max-w-[220px]">
                            {row.flag_reason ? (
                              <div className="flex items-start gap-1.5">
                                <FlagTag type="academic" />
                                <span className="truncate">{row.flag_reason}</span>
                              </div>
                            ) : (
                              <span className="text-text-faint italic">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                            {new Date(row.updated_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
