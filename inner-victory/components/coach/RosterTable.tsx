'use client'
import { useState } from 'react'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { StatusDot } from '@/components/shared/StatusDot'
import { FlagTag } from '@/components/shared/FlagTag'
import type { AthleteReadinessRow } from '@/hooks/useTeamReadiness'
import type { AvailabilityStatus } from '@/types/database'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Tab = 'all' | 'ready' | 'monitor' | 'out'

interface RosterTableProps {
  athletes: AthleteReadinessRow[]
  onSelectAthlete: (athlete: AthleteReadinessRow) => void
  selectedId?: string
}

function getTab(athlete: AthleteReadinessRow): Tab {
  if (athlete.availability_status === 'out') return 'out'
  if (athlete.combined_score >= 75) return 'ready'
  if (athlete.combined_score >= 55) return 'monitor'
  return 'out'
}

export function RosterTable({ athletes, onSelectAthlete, selectedId }: RosterTableProps) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [sortKey, setSortKey] = useState<'jersey' | 'score' | 'name'>('jersey')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const TABS = [
    { id: 'all' as Tab, label: 'All', count: athletes.length },
    { id: 'ready' as Tab, label: 'Ready', count: athletes.filter((a) => getTab(a) === 'ready').length },
    { id: 'monitor' as Tab, label: 'Monitor', count: athletes.filter((a) => getTab(a) === 'monitor').length },
    { id: 'out' as Tab, label: 'Out', count: athletes.filter((a) => getTab(a) === 'out').length },
  ]

  const filtered = athletes
    .filter((a) => activeTab === 'all' || getTab(a) === activeTab)
    .sort((a, b) => {
      let diff = 0
      if (sortKey === 'jersey') diff = (a.user?.jersey_number ?? 99) - (b.user?.jersey_number ?? 99)
      if (sortKey === 'score') diff = a.combined_score - b.combined_score
      if (sortKey === 'name') diff = (a.user?.full_name ?? '').localeCompare(b.user?.full_name ?? '')
      return sortDir === 'asc' ? diff : -diff
    })

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  }

  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border-1 px-4 pt-4 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'border border-b-0 border-border-1 bg-surface-3 text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            {tab.label}
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]',
              activeTab === tab.id ? 'bg-lime/10 text-lime' : 'bg-surface-3 text-text-faint'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-1">
              <th className="px-4 py-2.5 text-left">
                <button onClick={() => toggleSort('jersey')} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-text-faint hover:text-text-muted">
                  # <SortIcon col="jersey" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-left">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-text-faint hover:text-text-muted">
                  Athlete <SortIcon col="name" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-text-faint">Flags</th>
              <th className="px-4 py-2.5 text-right">
                <button onClick={() => toggleSort('score')} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-text-faint hover:text-text-muted ml-auto">
                  Score <SortIcon col="score" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-text-faint">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((athlete) => {
              const isSelected = athlete.athlete_id === selectedId
              return (
                <tr
                  key={athlete.id}
                  onClick={() => onSelectAthlete(athlete)}
                  className={cn(
                    'cursor-pointer border-b border-border-1 transition-colors last:border-0',
                    isSelected ? 'bg-lime/5' : 'hover:bg-surface-3'
                  )}
                >
                  <td className="px-4 py-3 text-xs font-mono text-text-muted">
                    {athlete.user?.jersey_number ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-bg"
                        style={{ backgroundColor: athlete.user?.avatar_color ?? '#7a869a' }}
                      >
                        {athlete.user?.initials ?? '?'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-text-primary">{athlete.user?.full_name}</div>
                        <div className="text-[10px] text-text-muted">{athlete.user?.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {athlete.availability_status !== 'full' && (
                        <FlagTag type="injury" />
                      )}
                      {athlete.academic_flag && <FlagTag type="academic" />}
                      {athlete.combined_score < 55 && athlete.availability_status === 'full' && (
                        <FlagTag type="monitor" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ScoreBadge score={athlete.combined_score} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <StatusDot status={(athlete.availability_status ?? 'full') as AvailabilityStatus} showLabel />
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-text-muted">
                  No athletes in this category
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
