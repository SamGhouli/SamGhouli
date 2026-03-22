'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { DEMO_DATA } from '@/lib/demo/data'
import type { Alert, User } from '@/types/database'
import { AlertTriangle, Info, ShieldAlert, CheckCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertRow extends Alert {
  athlete?: User
}

function buildDemoRows(): AlertRow[] {
  return DEMO_DATA.alerts.map((alert) => ({
    ...alert,
    athlete: alert.athlete_id
      ? DEMO_DATA.athletes.find((a) => a.id === alert.athlete_id)
      : undefined,
  }))
}

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    icon: ShieldAlert,
    className: 'bg-rose/10 border-rose/30 text-rose',
    dot: 'bg-rose',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    className: 'bg-amber/10 border-amber/30 text-amber',
    dot: 'bg-amber',
  },
  info: {
    label: 'Info',
    icon: Info,
    className: 'bg-sky/10 border-sky/30 text-sky',
    dot: 'bg-sky',
  },
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  low_readiness: 'Low Readiness',
  academic_flag: 'Academic Flag',
  injury_flag: 'Injury Flag',
  mental_health: 'Mental Health',
  compliance: 'Compliance',
  wearable: 'Wearable',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AlertsPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const initial: AlertRow[] = isDemo ? buildDemoRows() : []
  const [rows, setRows] = useState<AlertRow[]>(initial)
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')

  const unreadCount = rows.filter((r) => !r.is_read).length
  const criticalCount = rows.filter((r) => r.severity === 'critical' && !r.is_read).length
  const warningCount = rows.filter((r) => r.severity === 'warning' && !r.is_read).length

  const displayed = filter === 'unread' ? rows.filter((r) => !r.is_read) : rows

  function dismiss(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_read: true } : r)))
  }

  function dismissAll() {
    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })))
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Alerts"
        subtitle={`${unreadCount} unread · ${rows.length} total`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { key: 'critical', count: criticalCount },
              { key: 'warning', count: warningCount },
              { key: 'all', count: unreadCount },
            ] as const
          ).map(({ key, count }) => {
            if (key === 'all') {
              return (
                <div
                  key="all"
                  className="rounded-xl border border-border-1 bg-surface-2 p-4 flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-lime/10 border-lime/20 text-lime">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tabular-nums text-lime">{count}</div>
                    <div className="text-[10px] text-text-muted">Unread Total</div>
                  </div>
                </div>
              )
            }
            const cfg = SEVERITY_CONFIG[key]
            const Icon = cfg.icon
            return (
              <div
                key={key}
                className="rounded-xl border border-border-1 bg-surface-2 p-4 flex items-center gap-3"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${cfg.className}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className={`text-2xl font-bold tabular-nums ${cfg.className.split(' ').find((c) => c.startsWith('text-'))}`}>
                    {count}
                  </div>
                  <div className="text-[10px] text-text-muted">{cfg.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border-1 bg-surface-2 p-0.5">
            {(['unread', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === f
                    ? 'bg-lime/10 text-lime'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {f === 'unread' ? 'Unread' : 'All'}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={dismissAll}
              className="flex items-center gap-1.5 rounded-lg border border-border-1 bg-surface-2 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Alert list */}
        {displayed.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No alerts"
            description={
              filter === 'unread'
                ? 'All alerts have been reviewed. Switch to All to see history.'
                : 'No alerts have been generated for your team yet.'
            }
          />
        ) : (
          <div className="space-y-3">
            {displayed
              .slice()
              .sort((a, b) => {
                const sev = { critical: 0, warning: 1, info: 2 }
                return sev[a.severity] - sev[b.severity]
              })
              .map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity]
                const Icon = cfg.icon
                const typeLabel = ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'rounded-xl border bg-surface-2 p-4 flex items-start gap-4 transition-opacity',
                      alert.is_read ? 'opacity-50' : '',
                      `border-l-2 border-l-${cfg.dot.replace('bg-', '')} border-border-1`
                    )}
                    style={{
                      borderLeftColor: alert.severity === 'critical'
                        ? '#fb7185'
                        : alert.severity === 'warning'
                        ? '#fbbf24'
                        : '#60a5fa',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cfg.className}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-text-faint border border-border-1 rounded px-1.5 py-0.5">
                          {typeLabel}
                        </span>
                        {alert.athlete && (
                          <div className="flex items-center gap-1 ml-auto">
                            <div
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-bg"
                              style={{ backgroundColor: alert.athlete.avatar_color ?? '#7a869a' }}
                            >
                              {alert.athlete.initials ?? '?'}
                            </div>
                            <span className="text-[10px] text-text-muted">{alert.athlete.full_name}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-primary leading-snug">{alert.message}</p>
                      <p className="mt-1 text-[10px] text-text-faint">{formatTime(alert.created_at)}</p>
                    </div>

                    {/* Dismiss */}
                    {!alert.is_read && (
                      <button
                        onClick={() => dismiss(alert.id)}
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-3 hover:text-text-primary transition-colors"
                        title="Mark as read"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
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
