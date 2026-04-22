'use client'

import { ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { useSessionPlanner } from '@/hooks/useSessionPlanner'

type PlannerReturn = ReturnType<typeof useSessionPlanner>

interface PostSessionFlowProps {
  planner: PlannerReturn
}

export function PostSessionFlow({ planner }: PostSessionFlowProps) {
  const { postSession, draft, live, actions } = planner

  if (!postSession || !draft) return null

  const totalDrills = draft.blocks.reduce((s, b) => s + b.drills.length, 0)
  const completedCount = live?.completedDrills.size ?? postSession.incidents.length

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Progress header */}
      <div className="border-b border-border-1 bg-surface-1 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm font-bold text-text-primary">Post-Session Reflection</h1>
          <span className="text-xs text-text-muted">Step {postSession.screen} of 4</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                s < postSession.screen ? 'bg-lime' : s === postSession.screen ? 'bg-lime/60' : 'bg-surface-3'
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Screen 1: Summary */}
        {postSession.screen === 1 && (
          <Screen1
            draft={draft}
            totalDrills={totalDrills}
            completedCount={completedCount}
            onNext={actions.advanceReflectionScreen}
          />
        )}

        {/* Screen 2: Coach Reflection */}
        {postSession.screen === 2 && (
          <Screen2
            reflection={postSession.reflection}
            aiAck={postSession.aiAck}
            aiAckLoading={postSession.aiAckLoading}
            onChangeReflection={actions.setReflection}
            onSetAiAck={actions.setAiAck}
            sessionType={draft.sessionType}
            sessionTitle={draft.title}
            onNext={actions.advanceReflectionScreen}
            onBack={actions.backReflectionScreen}
          />
        )}

        {/* Screen 3: RPE */}
        {postSession.screen === 3 && (
          <Screen3
            rpe={postSession.rpe}
            sessionType={draft.sessionType}
            duration={draft.blocks.reduce((s, b) => s + b.durationMins, 0)}
            onSetRPE={actions.setRPE}
            onNext={actions.advanceReflectionScreen}
            onBack={actions.backReflectionScreen}
          />
        )}

        {/* Screen 4: Incidents */}
        {postSession.screen === 4 && (
          <Screen4
            incidents={postSession.incidents}
            onConfirm={actions.confirmIncident}
            onDismiss={actions.dismissIncident}
            onFinalize={actions.finalizeSession}
            onBack={actions.backReflectionScreen}
          />
        )}
      </div>
    </div>
  )
}

// ── Screen 1: Summary ────────────────────────────────────────────────────────

function Screen1({
  draft,
  totalDrills,
  completedCount,
  onNext,
}: {
  draft: ReturnType<typeof useSessionPlanner>['draft']
  totalDrills: number
  completedCount: number
  onNext: () => void
}) {
  if (!draft) return null
  const totalMins = draft.blocks.reduce((s, b) => s + b.durationMins, 0)

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Session Complete</h2>
        <p className="mt-1 text-sm text-text-muted">Review the auto-generated summary before continuing.</p>
      </div>

      <div className="rounded-xl border border-border-1 bg-surface-2 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Session Type" value={draft.sessionType.replace('-', ' ')} capitalize />
          <Stat label="Duration" value={`${totalMins} min`} />
          <Stat label="Blocks" value={String(draft.blocks.length)} />
          <Stat label="Drills Completed" value={`${completedCount} / ${totalDrills}`} />
        </div>

        {draft.blocks.map((block) => (
          <div key={block.id} className="border-t border-border-1 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-primary">{block.name}</span>
              <span className="text-[10px] text-text-muted">{block.durationMins} min · {block.intensity}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg transition-opacity hover:opacity-90"
      >
        Confirm & Continue <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Screen 2: Head Coach Reflection ─────────────────────────────────────────

function Screen2({
  reflection,
  aiAck,
  aiAckLoading,
  onChangeReflection,
  onSetAiAck,
  sessionType,
  sessionTitle,
  onNext,
  onBack,
}: {
  reflection: string
  aiAck: string
  aiAckLoading: boolean
  onChangeReflection: (t: string) => void
  onSetAiAck: (t: string, loading?: boolean) => void
  sessionType: string
  sessionTitle: string
  onNext: () => void
  onBack: () => void
}) {
  function submitReflection() {
    if (!reflection.trim()) { onNext(); return }
    onSetAiAck('', true)
    fetch('/api/coach/post-session-ack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reflection, sessionType, sessionTitle }),
    })
      .then((r) => r.json())
      .then((d) => onSetAiAck(d.ack ?? '', false))
      .catch(() => onSetAiAck('', false))
    onNext()
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Coach, your reflection:</h2>
        <p className="mt-1 text-sm text-text-muted">
          What was the primary objective of today&apos;s session, and did you achieve it?
        </p>
      </div>

      <textarea
        value={reflection}
        onChange={(e) => onChangeReflection(e.target.value)}
        placeholder="Write freely — your words are read and used, not just stored."
        rows={6}
        className="w-full resize-none rounded-xl border border-border-1 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
        autoFocus
      />

      {(aiAckLoading || aiAck) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-violet/20 bg-violet/5 p-4">
          {aiAckLoading ? (
            <>
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-violet" />
              <span className="text-sm text-text-muted">Reading your reflection…</span>
            </>
          ) : (
            <>
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet" />
              <p className="text-sm text-text-primary leading-relaxed">{aiAck}</p>
            </>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-border-1 bg-surface-2 px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={submitReflection}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime py-3 text-sm font-bold text-bg"
        >
          {reflection.trim() ? 'Submit Reflection' : 'Skip'} <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Screen 3: RPE ─────────────────────────────────────────────────────────────

const RPE_LABELS: Record<number, string> = {
  1: 'Very Light', 2: 'Light', 3: 'Moderate', 4: 'Hard', 5: 'Maximum',
}
const RPE_COLORS: Record<number, string> = {
  1: '#3DB87F', 2: '#4ade80', 3: '#fbbf24', 4: '#fb923c', 5: '#f43f5e',
}

function Screen3({
  rpe,
  sessionType,
  duration,
  onSetRPE,
  onNext,
  onBack,
}: {
  rpe: number
  sessionType: string
  duration: number
  onSetRPE: (r: number) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Workload Confirmation</h2>
        <p className="mt-1 text-sm text-text-muted">
          Rate the session intensity. This feeds the workload tracker automatically.
        </p>
        <p className="mt-1 text-xs text-text-faint">
          {sessionType.replace('-', ' ')} · {duration} min planned
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => onSetRPE(r)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border py-4 transition-all',
              rpe === r ? 'border-2 scale-105' : 'border-border-1 bg-surface-2 hover:bg-surface-3'
            )}
            style={rpe === r ? { borderColor: RPE_COLORS[r], backgroundColor: `${RPE_COLORS[r]}15` } : {}}
          >
            <span className="text-2xl font-black" style={{ color: RPE_COLORS[r] }}>{r}</span>
            <span className="text-[10px] text-text-muted text-center leading-tight">{RPE_LABELS[r]}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
        <p className="text-xs text-text-muted">
          Selected RPE: <span className="font-bold text-text-primary">{rpe} — {RPE_LABELS[rpe]}</span>
        </p>
        <p className="mt-1 text-[11px] text-text-faint">
          Adjusted load score: <span className="font-medium text-text-muted">{Math.round(duration * [0.6, 0.8, 1.0, 1.2, 1.4][rpe - 1])} AU</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-xl border border-border-1 bg-surface-2 px-4 py-3 text-sm font-medium text-text-muted">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onNext} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime py-3 text-sm font-bold text-bg">
          Confirm <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Screen 4: Incidents ───────────────────────────────────────────────────────

function Screen4({
  incidents,
  onConfirm,
  onDismiss,
  onFinalize,
  onBack,
}: {
  incidents: ReturnType<typeof useSessionPlanner>['postSession'] extends null ? never : NonNullable<ReturnType<typeof useSessionPlanner>['postSession']>['incidents']
  onConfirm: (id: string) => void
  onDismiss: (id: string) => void
  onFinalize: () => void
  onBack: () => void
}) {
  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Injury & Incident Review</h2>
        <p className="mt-1 text-sm text-text-muted">
          Review incidents logged during the session. Confirmed incidents update athlete availability.
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-xl border border-border-1 bg-surface-2 py-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-lime" />
          <p className="mt-2 text-sm font-medium text-text-primary">No incidents logged</p>
          <p className="mt-1 text-xs text-text-muted">Clean session.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className={cn(
                'rounded-xl border p-4',
                inc.confirmed ? 'border-rose/30 bg-rose/5' : 'border-amber/20 bg-amber/5'
              )}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{inc.description}</p>
                  <p className="mt-0.5 text-[11px] text-text-faint">
                    {new Date(inc.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {!inc.confirmed && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onConfirm(inc.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose/20 py-2 text-xs font-semibold text-rose transition-colors hover:bg-rose/30"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Confirm incident
                  </button>
                  <button
                    onClick={() => onDismiss(inc.id)}
                    className="rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {inc.confirmed && (
                <p className="mt-2 text-[11px] font-medium text-rose">
                  ✓ Confirmed — availability record updated
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-xl border border-border-1 bg-surface-2 px-4 py-3 text-sm font-medium text-text-muted">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onFinalize}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime py-3 text-sm font-bold text-bg"
        >
          <CheckCircle2 className="h-4 w-4" /> Finalise Session
        </button>
      </div>
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function Stat({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className={cn('mt-0.5 text-sm font-bold text-text-primary', capitalize && 'capitalize')}>{value}</p>
    </div>
  )
}
