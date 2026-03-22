'use client'
import { AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Alert } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface AlertStripProps {
  alerts: Alert[]
  onDismiss?: (id: string) => void
}

const SEVERITY_CONFIG = {
  critical: { bg: 'bg-rose/10 border-rose/20', text: 'text-rose', icon: AlertTriangle },
  warning: { bg: 'bg-amber/10 border-amber/20', text: 'text-amber', icon: AlertTriangle },
  info: { bg: 'bg-sky/10 border-sky/20', text: 'text-sky', icon: Info },
}

export function AlertStrip({ alerts, onDismiss }: AlertStripProps) {
  if (!alerts.length) {
    return (
      <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Active Alerts</h2>
        <p className="text-xs text-text-muted">No active alerts. Team is looking good.</p>
      </div>
    )
  }

  async function dismissAlert(id: string) {
    const supabase = createClient()
    await supabase.from('alerts').update({ is_read: true }).eq('id', id)
    onDismiss?.(id)
  }

  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
      <h2 className="mb-3 text-sm font-semibold text-text-primary">
        Active Alerts
        <span className="ml-2 rounded-full bg-rose/20 px-1.5 py-0.5 text-[10px] font-bold text-rose">
          {alerts.length}
        </span>
      </h2>
      <div className="space-y-2">
        {alerts.slice(0, 5).map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info
          const Icon = config.icon
          return (
            <div
              key={alert.id}
              className={cn('flex items-start gap-2.5 rounded-lg border p-3', config.bg)}
            >
              <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', config.text)} />
              <p className={cn('flex-1 text-xs', config.text)}>{alert.message}</p>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-text-faint transition-colors hover:text-text-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
