'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutList, XCircle } from 'lucide-react'
import { BlockTimer } from './BlockTimer'
import { DrillChecklist } from './DrillChecklist'
import { LiveSidebar } from './LiveSidebar'
import { cn } from '@/lib/utils'
import type { useSessionPlanner } from '@/hooks/useSessionPlanner'

type PlannerReturn = ReturnType<typeof useSessionPlanner>

interface LiveSessionViewProps {
  planner: PlannerReturn
}

const INTENSITY_STYLE: Record<string, string> = {
  low: 'text-green bg-green/10 border-green/20',
  medium: 'text-amber bg-amber/10 border-amber/20',
  high: 'text-rose bg-rose/10 border-rose/20',
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  'warm-up': 'Warm-Up',
  'technical': 'Technical',
  'tactical': 'Tactical',
  'physical': 'Physical',
  'set-pieces': 'Set Pieces',
  'cool-down': 'Cool-Down',
}

export function LiveSessionView({ planner }: LiveSessionViewProps) {
  const { live, currentLivePlan, currentLiveBlock, actions } = planner
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  if (!live || !currentLivePlan || !currentLiveBlock) return null

  const totalBlocks = currentLivePlan.blocks.length
  const overallProgress =
    ((live.currentBlockIndex * currentLiveBlock.durationMins +
      (currentLiveBlock.durationMins - live.secondsRemaining / 60)) /
      currentLivePlan.blocks.reduce((s, b) => s + b.durationMins, 0)) *
    100

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-bg">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border-1 bg-surface-1 px-6 py-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold',
                INTENSITY_STYLE[currentLiveBlock.intensity]
              )}
            >
              {BLOCK_TYPE_LABELS[currentLiveBlock.type] ?? currentLiveBlock.type}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold capitalize',
                INTENSITY_STYLE[currentLiveBlock.intensity]
              )}
            >
              {currentLiveBlock.intensity}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={actions.toggleSidebar}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                live.sidebarOpen
                  ? 'border-lime/30 bg-lime/10 text-lime'
                  : 'border-border-1 bg-surface-2 text-text-muted hover:text-text-primary'
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Sidebar
            </button>
            {showEndConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">End session?</span>
                <button
                  onClick={() => { actions.endSession(); setShowEndConfirm(false) }}
                  className="rounded-lg bg-rose px-3 py-1.5 text-xs font-bold text-white"
                >
                  End
                </button>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="flex items-center gap-1.5 rounded-lg border border-rose/30 bg-rose/10 px-3 py-1.5 text-xs font-medium text-rose transition-colors hover:bg-rose/20"
              >
                <XCircle className="h-3.5 w-3.5" />
                End Session
              </button>
            )}
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="h-1 bg-surface-3">
          <div
            className="h-full bg-lime transition-all duration-1000"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          />
        </div>

        {/* Main live area */}
        <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-6 pt-8 pb-6">
          {/* Block title */}
          <h1 className="text-center text-4xl font-black text-text-primary leading-tight max-w-2xl">
            {currentLiveBlock.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Block {live.currentBlockIndex + 1} of {totalBlocks}
          </p>

          {/* Timer */}
          <div className="mt-6">
            <BlockTimer
              secondsRemaining={live.secondsRemaining}
              blockDurationSecs={currentLiveBlock.durationMins * 60}
              isRunning={live.isRunning}
              onToggle={actions.toggleTimer}
            />
          </div>

          {/* Coach notes */}
          {currentLiveBlock.coachNotes && (
            <div className="mt-4 max-w-lg rounded-xl border border-border-1 bg-surface-2 px-4 py-3">
              <p className="text-xs text-text-muted leading-relaxed">{currentLiveBlock.coachNotes}</p>
            </div>
          )}

          {/* Drill checklist */}
          <div className="mt-6 w-full max-w-lg">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">
              Drills
            </h2>
            <DrillChecklist
              drills={currentLiveBlock.drills}
              blockId={currentLiveBlock.id}
              completedDrills={live.completedDrills}
              onToggle={actions.toggleDrill}
            />
          </div>

          {/* Block navigation */}
          <div className="mt-8 flex w-full max-w-lg items-center justify-between gap-4">
            <button
              onClick={actions.prevBlock}
              disabled={live.currentBlockIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-border-1 bg-surface-2 px-5 py-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-xs text-text-faint">
              {live.currentBlockIndex + 1} / {totalBlocks}
            </span>

            <button
              onClick={actions.nextBlock}
              disabled={live.currentBlockIndex >= totalBlocks - 1}
              className="flex items-center gap-1.5 rounded-xl border border-lime/30 bg-lime/10 px-5 py-3 text-sm font-medium text-lime transition-colors hover:bg-lime/20 disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {live.sidebarOpen && (
        <LiveSidebar
          plan={currentLivePlan}
          live={live}
          onClose={actions.toggleSidebar}
          onSetTab={actions.setSidebarTab}
          onUpdateAthleteStatus={actions.updateLiveAthleteStatus}
          onLogIncident={actions.logIncident}
          onUpdateNotes={actions.updateLiveNotes}
        />
      )}
    </div>
  )
}
