'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { DEMO_DATA } from '@/lib/demo/data'
import type { MatchStat } from '@/types/database'
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react'

interface MatchGroup {
  matchDate: string
  opponent: string
  stats: (MatchStat & { athlete_name: string; avatar_color: string; initials: string })[]
}

function buildDemoMatches(): MatchGroup[] {
  const statsByMatch = new Map<string, MatchGroup>()

  DEMO_DATA.matchStats.forEach((stat) => {
    const key = `${stat.match_date}__${stat.opponent}`
    const athlete = DEMO_DATA.athletes.find((a) => a.id === stat.athlete_id)
    const enriched = {
      ...stat,
      athlete_name: athlete?.full_name ?? 'Unknown',
      avatar_color: athlete?.avatar_color ?? '#7a869a',
      initials: athlete?.initials ?? '?',
    }
    if (!statsByMatch.has(key)) {
      statsByMatch.set(key, {
        matchDate: stat.match_date,
        opponent: stat.opponent,
        stats: [],
      })
    }
    statsByMatch.get(key)!.stats.push(enriched)
  })

  return Array.from(statsByMatch.values()).sort(
    (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
  )
}

function ratingColor(rating: number) {
  if (rating >= 8) return 'text-green'
  if (rating >= 6.5) return 'text-amber'
  return 'text-rose'
}

export default function MatchesPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const matchGroups: MatchGroup[] = isDemo ? buildDemoMatches() : []
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(
    new Set(matchGroups.map((m) => `${m.matchDate}__${m.opponent}`))
  )

  function toggleMatch(key: string) {
    setExpandedMatches((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Season stats
  const allStats = matchGroups.flatMap((m) => m.stats)
  const totalGoals = allStats.reduce((s, a) => s + a.goals, 0)
  const totalAssists = allStats.reduce((s, a) => s + a.assists, 0)
  const avgRating =
    allStats.length
      ? (allStats.reduce((s, a) => s + a.rating, 0) / allStats.length).toFixed(1)
      : '—'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Match Reports"
        subtitle={`${matchGroups.length} match${matchGroups.length !== 1 ? 'es' : ''} recorded`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Season Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-lime" />
              <span className="text-xs text-text-muted">Total Goals</span>
            </div>
            <div className="text-3xl font-bold text-lime tabular-nums">{totalGoals}</div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-sky" />
              <span className="text-xs text-text-muted">Total Assists</span>
            </div>
            <div className="text-3xl font-bold text-sky tabular-nums">{totalAssists}</div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-green" />
              <span className="text-xs text-text-muted">Avg Rating</span>
            </div>
            <div className={`text-3xl font-bold tabular-nums ${ratingColor(parseFloat(String(avgRating)))}`}>
              {avgRating}
            </div>
          </div>
        </div>

        {matchGroups.length === 0 ? (
          <EmptyState
            icon="⚽"
            title="No match reports"
            description="Match statistics will appear here once they are entered for each fixture."
          />
        ) : (
          <div className="space-y-4">
            {matchGroups.map((group) => {
              const key = `${group.matchDate}__${group.opponent}`
              const isExpanded = expandedMatches.has(key)
              const totalG = group.stats.reduce((s, a) => s + a.goals, 0)
              const totalA = group.stats.reduce((s, a) => s + a.assists, 0)
              const avgR =
                group.stats.length
                  ? (group.stats.reduce((s, a) => s + a.rating, 0) / group.stats.length).toFixed(1)
                  : '—'

              return (
                <div key={key} className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden">
                  {/* Match Header */}
                  <button
                    onClick={() => toggleMatch(key)}
                    className="w-full flex items-center justify-between p-5 hover:bg-surface-3/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime/10">
                        <Trophy className="h-4 w-4 text-lime" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">
                          vs. {group.opponent}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          {new Date(group.matchDate).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span>
                            <span className="font-semibold text-lime">{totalG}</span> goals
                          </span>
                          <span>
                            <span className="font-semibold text-sky">{totalA}</span> assists
                          </span>
                          <span>
                            <span className={`font-semibold ${ratingColor(parseFloat(String(avgR)))}`}>
                              {avgR}
                            </span>{' '}
                            avg rating
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                  </button>

                  {/* Athlete Performance Table */}
                  {isExpanded && (
                    <div className="border-t border-border-1 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-surface-3/50 border-b border-border-1">
                            <th className="px-5 py-2.5 text-left text-xs font-medium text-text-muted">Athlete</th>
                            <th className="px-4 py-2.5 text-center text-xs font-medium text-text-muted">Mins</th>
                            <th className="px-4 py-2.5 text-center text-xs font-medium text-text-muted">Goals</th>
                            <th className="px-4 py-2.5 text-center text-xs font-medium text-text-muted">Assists</th>
                            <th className="px-4 py-2.5 text-center text-xs font-medium text-text-muted">Rating</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-1">
                          {group.stats
                            .slice()
                            .sort((a, b) => b.rating - a.rating)
                            .map((stat) => (
                              <tr key={stat.id} className="hover:bg-surface-3/40 transition-colors">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-bg"
                                      style={{ backgroundColor: stat.avatar_color }}
                                    >
                                      {stat.initials}
                                    </div>
                                    <span className="text-xs font-medium text-text-primary">
                                      {stat.athlete_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center text-xs text-text-muted tabular-nums">
                                  {stat.minutes_played}&apos;
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-sm font-bold tabular-nums ${stat.goals > 0 ? 'text-lime' : 'text-text-muted'}`}>
                                    {stat.goals}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-sm font-bold tabular-nums ${stat.assists > 0 ? 'text-sky' : 'text-text-muted'}`}>
                                    {stat.assists}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`font-mono text-sm font-semibold tabular-nums ${ratingColor(stat.rating)}`}>
                                    {stat.rating.toFixed(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-text-muted max-w-[200px] truncate">
                                  {stat.notes || '—'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
