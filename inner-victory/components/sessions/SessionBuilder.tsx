'use client'

import { Save, PlayCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockCard } from './BlockCard'
import { BlockEditor } from './BlockEditor'
import { AvailabilitySnapshot } from './AvailabilitySnapshot'
import { AIPreSessionCard } from './AIPreSessionCard'
import type { SessionBlockType, SessionType } from '@/types/database'
import type { useSessionPlanner } from '@/hooks/useSessionPlanner'

type PlannerReturn = ReturnType<typeof useSessionPlanner>

const BLOCK_TYPES: { type: SessionBlockType; label: string; emoji: string }[] = [
  { type: 'warm-up', label: 'Warm-Up', emoji: '🔥' },
  { type: 'technical', label: 'Technical', emoji: '⚙️' },
  { type: 'tactical', label: 'Tactical', emoji: '🎯' },
  { type: 'physical', label: 'Physical', emoji: '💪' },
  { type: 'set-pieces', label: 'Set Pieces', emoji: '🚩' },
  { type: 'cool-down', label: 'Cool-Down', emoji: '❄️' },
]

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'pre-match', label: 'Pre-Match' },
  { value: 'post-match', label: 'Post-Match' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'high-intensity', label: 'High-Intensity' },
  { value: 'technical', label: 'Technical' },
  { value: 'tactical', label: 'Tactical' },
  { value: 'strength', label: 'Strength & Conditioning' },
  { value: 'friendly', label: 'Friendly' },
]

interface SessionBuilderProps {
  planner: PlannerReturn
  daysToMatch: number
}

export function SessionBuilder({ planner, daysToMatch }: SessionBuilderProps) {
  const { draft, selectedBlockId, blockStartTimes, totalDraftMins, actions } = planner

  if (!draft) return null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Builder Top Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border-1 bg-surface-1 px-6 py-3">
        <button
          onClick={actions.cancelBuilder}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Sessions
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={actions.savePlan}
            className="flex items-center gap-1.5 rounded-lg border border-border-1 bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-3"
          >
            <Save className="h-3 w-3" /> Save Plan
          </button>
          <button
            onClick={actions.startSession}
            disabled={draft.blocks.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 text-xs font-bold text-bg transition-opacity disabled:opacity-40"
          >
            <PlayCircle className="h-3.5 w-3.5" /> Start Session
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-5">
          {/* Metadata */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Session Title
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => actions.updateDraft({ title: e.target.value })}
                placeholder="e.g. Pre-Match Tactical — Tuesday"
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Session Type
              </label>
              <select
                value={draft.sessionType}
                onChange={(e) => actions.updateDraft({ sessionType: e.target.value as SessionType })}
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-lime/40 focus:outline-none"
              >
                {SESSION_TYPES.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Date
              </label>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => actions.updateDraft({ date: e.target.value })}
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-lime/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Start Time
              </label>
              <input
                type="time"
                value={draft.startTime}
                onChange={(e) => actions.updateDraft({ startTime: e.target.value })}
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-lime/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Venue
              </label>
              <input
                type="text"
                value={draft.venue}
                onChange={(e) => actions.updateDraft({ venue: e.target.value })}
                placeholder="e.g. Pitch A"
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Stats row */}
          {draft.blocks.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span><span className="font-bold text-text-primary">{draft.blocks.length}</span> blocks</span>
              <span><span className="font-bold text-text-primary">{totalDraftMins}</span> min total</span>
              {daysToMatch > 0 && (
                <span><span className="font-bold text-amber">{daysToMatch}</span> days to next match</span>
              )}
            </div>
          )}

          {/* Main layout: Timeline + Right panel */}
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            {/* Block Timeline */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Session Timeline
              </h2>

              {draft.blocks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-2 py-8 text-center">
                  <p className="text-xs text-text-faint">Add blocks from the library below to build your session.</p>
                </div>
              ) : (
                draft.blocks.map((block, idx) => (
                  <div key={block.id}>
                    <BlockCard
                      block={block}
                      startTime={blockStartTimes[block.id] ?? '--:--'}
                      selected={selectedBlockId === block.id}
                      isFirst={idx === 0}
                      isLast={idx === draft.blocks.length - 1}
                      onClick={() => actions.selectBlock(selectedBlockId === block.id ? null : block.id)}
                      onMoveUp={() => actions.reorderBlock(block.id, 'up')}
                      onMoveDown={() => actions.reorderBlock(block.id, 'down')}
                      onDelete={() => actions.removeBlock(block.id)}
                    />
                    {selectedBlockId === block.id && (
                      <BlockEditor
                        block={block}
                        onChange={(updates) => actions.updateBlock(block.id, updates)}
                      />
                    )}
                  </div>
                ))
              )}

              {/* Block Library */}
              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Add Block
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {BLOCK_TYPES.map((bt) => (
                    <button
                      key={bt.type}
                      onClick={() => actions.addBlock(bt.type)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl border border-border-1 bg-surface-2 p-3 text-center transition-colors hover:border-lime/30 hover:bg-lime/5'
                      )}
                    >
                      <span className="text-base">{bt.emoji}</span>
                      <span className="text-[10px] font-medium text-text-muted leading-tight">{bt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-5">
              <AvailabilitySnapshot blocks={draft.blocks} />
              <AIPreSessionCard draft={draft} daysToMatch={daysToMatch} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
