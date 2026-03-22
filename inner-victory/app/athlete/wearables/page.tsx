'use client'

import { useState } from 'react'
import { Wifi, WifiOff, RefreshCw, Plus, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Wearable {
  id: string
  name: string
  description: string
  color: string
  connected: boolean
  lastSync?: string
  batteryPct?: number
}

const INITIAL_WEARABLES: Wearable[] = [
  {
    id: 'whoop',
    name: 'WHOOP',
    description: 'Recovery, strain & sleep tracking',
    color: '#000000',
    connected: true,
    lastSync: '2 minutes ago',
    batteryPct: 84,
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    description: 'Sleep stages, HRV & readiness',
    color: '#6c5ce7',
    connected: false,
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'GPS, training load & health metrics',
    color: '#007cc3',
    connected: false,
  },
  {
    id: 'apple',
    name: 'Apple Health',
    description: 'Steps, workouts & heart rate',
    color: '#ff2d55',
    connected: false,
  },
]

function WearableInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return <span className="text-xs font-bold text-text-primary">{initials}</span>
}

function WearableCard({
  wearable,
  onToggle,
  onSync,
  syncing,
}: {
  wearable: Wearable
  onToggle: (id: string) => void
  onSync: (id: string) => void
  syncing: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200',
        wearable.connected ? 'border-green/30 bg-surface-2' : 'border-border-1 bg-surface-2'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon/Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${wearable.color}20`, border: `1px solid ${wearable.color}30` }}
        >
          <WearableInitials name={wearable.name} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-text-primary">{wearable.name}</p>
            {wearable.connected && (
              <span className="flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-medium text-green">
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                Connected
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">{wearable.description}</p>
          {wearable.connected && wearable.lastSync && (
            <p className="mt-1 text-[11px] text-text-faint">Last sync: {wearable.lastSync}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {wearable.connected ? (
          <>
            <button
              onClick={() => onSync(wearable.id)}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-xs text-text-muted min-h-[36px] transition-colors active:bg-surface-2"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} />
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
            <button
              onClick={() => onToggle(wearable.id)}
              className="flex items-center gap-1.5 rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-xs text-rose min-h-[36px] transition-colors active:bg-rose/20"
            >
              <WifiOff className="h-3.5 w-3.5" />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => onToggle(wearable.id)}
            className="flex items-center gap-1.5 rounded-lg bg-lime px-4 py-2 text-xs font-bold text-bg min-h-[36px] transition-opacity active:opacity-80"
          >
            <Wifi className="h-3.5 w-3.5" />
            Connect
          </button>
        )}
      </div>
    </div>
  )
}

export default function WearablesPage() {
  const [wearables, setWearables] = useState(INITIAL_WEARABLES)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  function handleToggle(id: string) {
    setWearables((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              connected: !w.connected,
              lastSync: !w.connected ? 'Just now' : undefined,
            }
          : w
      )
    )
  }

  async function handleSync(id: string) {
    setSyncingId(id)
    // Simulate sync delay
    await new Promise((r) => setTimeout(r, 1500))
    setWearables((prev) =>
      prev.map((w) => (w.id === id ? { ...w, lastSync: 'Just now' } : w))
    )
    setSyncingId(null)
  }

  const connectedCount = wearables.filter((w) => w.connected).length

  return (
    <div className="min-h-screen px-4 pt-6 pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Wearables</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {connectedCount > 0
            ? `${connectedCount} device${connectedCount > 1 ? 's' : ''} connected`
            : 'Connect a device to unlock physical insights'}
        </p>
      </div>

      {/* Status summary */}
      {connectedCount > 0 && (
        <div className="rounded-xl border border-green/20 bg-green/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green/10">
              <Activity className="h-4.5 w-4.5 text-green" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Data syncing</p>
              <p className="text-xs text-text-muted">Physical metrics update every 5 minutes</p>
            </div>
          </div>
        </div>
      )}

      {/* Wearable cards */}
      <div className="space-y-3">
        {wearables.map((w) => (
          <WearableCard
            key={w.id}
            wearable={w}
            onToggle={handleToggle}
            onSync={handleSync}
            syncing={syncingId === w.id}
          />
        ))}
      </div>

      {/* Manual entry option */}
      {connectedCount === 0 && (
        <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3">
              <Plus className="h-4 w-4 text-text-muted" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary mb-0.5">Manual Entry</p>
              <p className="text-xs text-text-muted mb-3">
                No wearable? Enter your metrics manually each day and we&apos;ll still generate your physical score.
              </p>
              <button className="rounded-lg border border-border-1 bg-surface-3 px-4 py-2 text-xs font-medium text-text-primary min-h-[36px]">
                Enter today&apos;s metrics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-center text-[11px] text-text-faint leading-relaxed">
        Wearable data is end-to-end encrypted. Only aggregated scores are visible to your coaching staff — never raw device data.
      </p>
    </div>
  )
}
