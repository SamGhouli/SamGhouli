'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import {
  CalendarDays,
  Dumbbell,
  Trophy,
  Film,
  Heart,
  Plane,
  ClipboardList,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Target,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_DATA } from '@/lib/demo/data'
import type { AvailabilityStatus } from '@/types/database'

interface EventAvailability {
  status: AvailabilityStatus
  reason: string
}

const EVENT_TYPE_CONFIG = {
  training: { icon: Dumbbell, label: 'Training', color: '#4ade80', bg: '#4ade8015' },
  match: { icon: Trophy, label: 'Match', color: '#d4ff5c', bg: '#d4ff5c15' },
  film: { icon: Film, label: 'Film', color: '#60a5fa', bg: '#60a5fa15' },
  recovery: { icon: Heart, label: 'Recovery', color: '#a78bfa', bg: '#a78bfa15' },
  travel: { icon: Plane, label: 'Travel', color: '#fb923c', bg: '#fb923c15' },
  admin: { icon: ClipboardList, label: 'Admin', color: '#94a3b8', bg: '#94a3b815' },
}

const STATUS_CONFIG = {
  full: { label: 'Full', icon: CheckCircle2, color: '#4ade80', desc: "I'll be there, ready to go" },
  limited: { label: 'Limited', icon: AlertCircle, color: '#fbbf24', desc: 'I can attend but have restrictions' },
  out: { label: 'Out', icon: XCircle, color: '#fb7185', desc: "I can't make this session" },
}

const PRESET_REASONS = [
  'Class conflict',
  'Academic exam / midterm',
  'Lab / tutorial session',
  'Work placement',
  'Illness',
  'Injury — please contact coach',
  'Family commitment',
  'Travel',
]

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

// ── Match Brief card shown to athletes ────────────────────────────────────────

const DEMO_TEAM_MESSAGE =
  "Let's bring our best to London. We've prepared well this week — trust the shape, press hard in the first 20, and play without fear. Every minute counts. — Coach Mitchell"

const DEMO_MATCH_BRIEF = {
  formation: '4-2-3-1',
  role: 'Starting XI',
  keyInstruction: 'Press high on their GK distribution. Trust the shape — find Priya or Devonte after winning the ball.',
  setpiece: 'Corners: Priya Sharma takes. Near post run: Marcus. Far post: Noah.',
}

function MatchBriefCard() {
  const [open, setOpen] = useState(false)
  const nextMatch = DEMO_DATA.upcomingEvents.find((e) => e.event_type === 'match')
  if (!nextMatch) return null

  return (
    <div className="rounded-xl border border-lime/30 bg-lime/5 overflow-hidden mb-4">
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <Target className="h-4 w-4 text-lime shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-lime">Match Brief Available</p>
          <p className="text-[11px] text-text-muted truncate">{nextMatch.title}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-lime" /> : <ChevronDown className="h-4 w-4 text-lime" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-lime/20">
          {/* Role + Formation */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-lg bg-surface-2 border border-border-1 p-3">
              <p className="text-[10px] text-text-faint mb-0.5">Your Role</p>
              <p className="text-sm font-bold text-lime">{DEMO_MATCH_BRIEF.role}</p>
            </div>
            <div className="flex-1 rounded-lg bg-surface-2 border border-border-1 p-3">
              <p className="text-[10px] text-text-faint mb-0.5">Formation</p>
              <p className="text-sm font-bold text-text-primary">{DEMO_MATCH_BRIEF.formation}</p>
            </div>
          </div>

          {/* Key instruction */}
          <div className="rounded-lg bg-surface-2 border border-border-1 p-3">
            <p className="text-[10px] font-semibold text-text-faint mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Key Instruction
            </p>
            <p className="text-xs text-text-primary leading-relaxed">{DEMO_MATCH_BRIEF.keyInstruction}</p>
          </div>

          {/* Set piece */}
          <div className="rounded-lg bg-surface-2 border border-border-1 p-3">
            <p className="text-[10px] font-semibold text-text-faint mb-1">Set Pieces</p>
            <p className="text-xs text-text-primary leading-relaxed">{DEMO_MATCH_BRIEF.setpiece}</p>
          </div>

          {/* Team message */}
          <div className="rounded-lg bg-surface-2 border border-border-1 p-3">
            <p className="text-[10px] font-semibold text-text-faint mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Coach&apos;s Message
            </p>
            <p className="text-xs text-text-primary leading-relaxed italic">&ldquo;{DEMO_TEAM_MESSAGE}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleContent() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  // Per-event availability state
  const [availability, setAvailability] = useState<Record<string, EventAvailability>>(() => {
    const init: Record<string, EventAvailability> = {}
    for (const ev of DEMO_DATA.upcomingEvents) {
      init[ev.id] = { status: 'full', reason: '' }
    }
    return init
  })

  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const events = isDemo ? DEMO_DATA.upcomingEvents : []

  function handleStatusChange(eventId: string, status: AvailabilityStatus) {
    setAvailability((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], status, reason: status === 'full' ? '' : prev[eventId].reason },
    }))
    setSaved((prev) => ({ ...prev, [eventId]: false }))
  }

  function handleReasonChange(eventId: string, reason: string) {
    setAvailability((prev) => ({ ...prev, [eventId]: { ...prev[eventId], reason } }))
    setSaved((prev) => ({ ...prev, [eventId]: false }))
  }

  function handleSave(eventId: string) {
    // In live mode: upsert to athlete_availability table
    // In demo mode: just mark as saved
    setSaved((prev) => ({ ...prev, [eventId]: true }))
    setExpanded((prev) => ({ ...prev, [eventId]: false }))
  }

  function toggleExpanded(eventId: string) {
    setExpanded((prev) => ({ ...prev, [eventId]: !prev[eventId] }))
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="h-5 w-5 text-lime" />
          <h1 className="text-xl font-bold text-text-primary">Schedule</h1>
        </div>
        <p className="text-xs text-text-muted">
          Set your availability for upcoming sessions — your coach sees a summary, never your personal details.
        </p>
      </div>

      {/* Availability key */}
      <div className="flex gap-3 mb-6">
        {(Object.entries(STATUS_CONFIG) as [AvailabilityStatus, typeof STATUS_CONFIG['full']][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <cfg.icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
            <span className="text-[11px] text-text-muted">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Match Brief card — shown when there's an upcoming match */}
      {events.some((e) => e.event_type === 'match') && (
        <MatchBriefCard />
      )}

      {/* Events list */}
      <div className="space-y-3">
        {events.length === 0 && (
          <div className="rounded-xl border border-border-1 bg-surface-2 p-8 text-center">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-text-faint" />
            <p className="text-sm text-text-muted">No upcoming sessions scheduled.</p>
          </div>
        )}

        {events.map((ev) => {
          const typeConfig = EVENT_TYPE_CONFIG[ev.event_type as keyof typeof EVENT_TYPE_CONFIG] ?? EVENT_TYPE_CONFIG.admin
          const Icon = typeConfig.icon
          const avail = availability[ev.id] ?? { status: 'full' as AvailabilityStatus, reason: '' }
          const statusCfg = STATUS_CONFIG[avail.status]
          const StatusIcon = statusCfg.icon
          const isOpen = expanded[ev.id] ?? false
          const isSaved = saved[ev.id] ?? false

          return (
            <div
              key={ev.id}
              className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden"
            >
              {/* Event header — always visible */}
              <button
                className="w-full text-left p-4"
                onClick={() => toggleExpanded(ev.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Date + type pill */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold" style={{ color: typeConfig.color }}>
                        {formatEventDate(ev.event_date)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
                      >
                        {typeConfig.label}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-text-primary leading-tight truncate">{ev.title}</p>

                    {/* Time + location */}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-text-muted">
                        <Clock className="h-3 w-3" />
                        {formatTime(ev.start_time)} · {ev.duration_mins}m
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1 text-[11px] text-text-muted truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge + chevron */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1">
                      <StatusIcon className="h-4 w-4" style={{ color: statusCfg.color }} />
                      {isSaved && (
                        <span className="text-[10px] text-text-faint">saved</span>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-text-faint" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-faint" />
                    )}
                  </div>
                </div>

                {/* Coach notes */}
                {ev.notes && (
                  <p className="mt-2 text-[11px] text-text-faint italic pl-12">{ev.notes}</p>
                )}
              </button>

              {/* Availability editor — shown when expanded */}
              {isOpen && (
                <div className="border-t border-border-1 px-4 pb-4 pt-3">
                  {/* Status selector */}
                  <p className="text-xs font-semibold text-text-muted mb-2">Your availability</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(Object.entries(STATUS_CONFIG) as [AvailabilityStatus, typeof STATUS_CONFIG['full']][]).map(([key, cfg]) => {
                      const SIcon = cfg.icon
                      const isSelected = avail.status === key
                      return (
                        <button
                          key={key}
                          onClick={() => handleStatusChange(ev.id, key)}
                          className={cn(
                            'flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-colors',
                            isSelected
                              ? 'border-current'
                              : 'border-border-1 text-text-faint hover:border-border-2'
                          )}
                          style={isSelected ? { borderColor: cfg.color, color: cfg.color, backgroundColor: `${cfg.color}10` } : {}}
                        >
                          <SIcon className="h-4 w-4" />
                          <span className="text-[11px] font-semibold">{cfg.label}</span>
                          <span className="text-[10px] leading-tight opacity-75">{cfg.desc}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Reason — only for limited or out */}
                  {avail.status !== 'full' && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-text-muted mb-2">Reason (optional)</p>

                      {/* Preset chips */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {PRESET_REASONS.map((r) => (
                          <button
                            key={r}
                            onClick={() => handleReasonChange(ev.id, r)}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-[11px] transition-colors',
                              avail.reason === r
                                ? 'border-lime bg-lime-dim text-lime'
                                : 'border-border-1 text-text-muted hover:border-border-2'
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>

                      {/* Free text */}
                      <textarea
                        value={avail.reason}
                        onChange={(e) => handleReasonChange(ev.id, e.target.value)}
                        placeholder="Or type your own reason…"
                        rows={2}
                        className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-xs text-text-primary placeholder:text-text-faint focus:outline-none focus:border-lime resize-none"
                      />
                    </div>
                  )}

                  {/* Save */}
                  <button
                    onClick={() => handleSave(ev.id)}
                    className="w-full rounded-lg bg-lime py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 active:opacity-75"
                  >
                    {isSaved ? 'Saved ✓' : 'Save Availability'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-center text-[11px] text-text-faint leading-relaxed">
        Coaches see only your availability status — never your personal reasons or notes.
        Update anytime up to 1 hour before a session.
      </p>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="h-8 w-8 rounded-full border-2 border-lime border-t-transparent animate-spin" /></div>}>
      <ScheduleContent />
    </Suspense>
  )
}
