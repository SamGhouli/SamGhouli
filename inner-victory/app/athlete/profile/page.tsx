'use client'

import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  Activity,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_ATHLETE = {
  full_name: 'Samir Ghouli',
  jersey_number: 4,
  position: 'Attacking Mid',
  year_of_study: '2nd Year',
  initials: 'SG',
  avatar_color: '#d4ff5c',
  team: 'McMaster Marauders',
  sport: 'Soccer',
}

const DEMO_WEARABLES = [
  { name: 'WHOOP', connected: true, lastSync: '2 minutes ago', color: '#000000' },
  { name: 'Oura Ring', connected: false, color: '#6c5ce7' },
  { name: 'Garmin', connected: false, color: '#007cc3' },
]

interface NotificationPref {
  id: string
  label: string
  description: string
  enabled: boolean
}

const INITIAL_NOTIF_PREFS: NotificationPref[] = [
  {
    id: 'daily_checkin',
    label: 'Daily check-in reminder',
    description: 'Remind me to check in each morning',
    enabled: true,
  },
  {
    id: 'low_readiness',
    label: 'Low readiness alert',
    description: 'Notify me when readiness drops below 55',
    enabled: true,
  },
  {
    id: 'wearable_sync',
    label: 'Wearable sync issues',
    description: 'Alert me if my device stops syncing',
    enabled: false,
  },
  {
    id: 'therapist_msgs',
    label: 'Therapist messages',
    description: 'Notifications from your support team',
    enabled: true,
  },
]

function SettingsRow({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: React.ElementType
  label: string
  description?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface-3 transition-colors min-h-[56px]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-3">
        <Icon className="h-4 w-4 text-text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 text-text-faint shrink-0" />
    </button>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
        enabled ? 'bg-lime' : 'bg-surface-3'
      )}
    >
      <span
        className={cn(
          'inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-1'
        )}
        style={{ width: 18, height: 18 }}
      />
    </button>
  )
}

export default function ProfilePage() {
  const [notifPrefs, setNotifPrefs] = useState(INITIAL_NOTIF_PREFS)
  const [passwordChanged, setPasswordChanged] = useState(false)

  function toggleNotif(id: string) {
    setNotifPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Hero / Avatar area */}
      <div className="flex flex-col items-center px-4 pt-8 pb-6">
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3"
          style={{
            backgroundColor: `${DEMO_ATHLETE.avatar_color}20`,
            color: DEMO_ATHLETE.avatar_color,
            border: `2px solid ${DEMO_ATHLETE.avatar_color}40`,
          }}
        >
          {DEMO_ATHLETE.initials}
        </div>
        <h1 className="text-lg font-bold text-text-primary">{DEMO_ATHLETE.full_name}</h1>
        <p className="text-sm text-text-muted">
          #{DEMO_ATHLETE.jersey_number} · {DEMO_ATHLETE.position}
        </p>
        <p className="text-xs text-text-faint mt-0.5">
          {DEMO_ATHLETE.team} · {DEMO_ATHLETE.sport}
        </p>
      </div>

      {/* Athlete info card */}
      <div className="mx-4 mb-5 rounded-xl border border-border-1 bg-surface-2 divide-y divide-border-1">
        {[
          { label: 'Year of study', value: DEMO_ATHLETE.year_of_study },
          { label: 'Position', value: DEMO_ATHLETE.position },
          { label: 'Jersey number', value: `#${DEMO_ATHLETE.jersey_number}` },
          { label: 'Team', value: DEMO_ATHLETE.team },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-text-muted">{label}</span>
            <span className="text-sm font-medium text-text-primary">{value}</span>
          </div>
        ))}
      </div>

      {/* Wearables summary */}
      <div className="mx-4 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
          Connected devices
        </p>
        <div className="rounded-xl border border-border-1 bg-surface-2 divide-y divide-border-1">
          {DEMO_WEARABLES.map((w) => (
            <div key={w.name} className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-text-primary"
                style={{
                  backgroundColor: `${w.color}20`,
                  border: `1px solid ${w.color}30`,
                  color: w.color,
                }}
              >
                {w.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{w.name}</p>
                {w.connected && w.lastSync && (
                  <p className="text-[11px] text-text-faint">Last sync: {w.lastSync}</p>
                )}
              </div>
              {w.connected ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-green">
                  <Activity className="h-3 w-3" />
                  Active
                </span>
              ) : (
                <span className="text-[11px] text-text-faint">Not connected</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notification preferences */}
      <div className="mx-4 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
          Notifications
        </p>
        <div className="rounded-xl border border-border-1 bg-surface-2 divide-y divide-border-1">
          {notifPrefs.map((pref) => (
            <div key={pref.id} className="flex items-center gap-3 px-4 py-3.5 min-h-[60px]">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{pref.label}</p>
                <p className="text-xs text-text-muted">{pref.description}</p>
              </div>
              <Toggle enabled={pref.enabled} onChange={() => toggleNotif(pref.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Account settings */}
      <div className="mx-4 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
          Account
        </p>
        <div className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden divide-y divide-border-1">
          <SettingsRow
            icon={User}
            label="Change password"
            description="Update your account password"
            onClick={() => setPasswordChanged(true)}
          />
          <SettingsRow
            icon={Bell}
            label="Email preferences"
            description="Manage email notifications"
          />
        </div>
        {passwordChanged && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-green/10 border border-green/20 px-3 py-2">
            <Check className="h-3.5 w-3.5 text-green" />
            <p className="text-xs text-green">Password reset email sent.</p>
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="mx-4 mb-5 rounded-xl border border-border-1 bg-surface-2 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet/10">
            <Shield className="h-4 w-4 text-violet" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary mb-1">Your data, your rights</p>
            <p className="text-xs text-text-muted leading-relaxed">
              You own your data. Your personal scores, check-in responses and wearable data are encrypted and private. Coaches only see your availability status — never your raw numbers, notes or wellness scores. You can delete your data at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="mx-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose/20 bg-rose/5 py-3.5 text-sm font-semibold text-rose min-h-[48px] active:bg-rose/10 transition-colors">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
