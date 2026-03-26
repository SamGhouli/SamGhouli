'use client'

import { ChevronUp, ChevronDown, Trash2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SessionBlockV2 } from '@/types/database'

const BLOCK_TYPE_LABELS: Record<string, string> = {
  'warm-up': 'Warm-Up',
  'technical': 'Technical',
  'tactical': 'Tactical',
  'physical': 'Physical',
  'set-pieces': 'Set Pieces',
  'cool-down': 'Cool-Down',
}

const INTENSITY_STYLE: Record<string, string> = {
  low: 'text-green bg-green/10 border-green/20',
  medium: 'text-amber bg-amber/10 border-amber/20',
  high: 'text-rose bg-rose/10 border-rose/20',
}

interface BlockCardProps {
  block: SessionBlockV2
  startTime: string
  selected: boolean
  isFirst: boolean
  isLast: boolean
  onClick: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

export function BlockCard({
  block,
  startTime,
  selected,
  isFirst,
  isLast,
  onClick,
  onMoveUp,
  onMoveDown,
  onDelete,
}: BlockCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border p-3.5 cursor-pointer transition-colors',
        selected
          ? 'border-lime bg-lime/5'
          : 'border-border-1 bg-surface-2 hover:bg-surface-3/50'
      )}
      onClick={onClick}
    >
      {/* Time label on left */}
      <div className="flex items-start gap-3">
        <div className="w-10 shrink-0 text-right">
          <span className="text-[10px] font-mono text-text-faint">{startTime}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              {BLOCK_TYPE_LABELS[block.type] ?? block.type}
            </span>
            <span className={cn('shrink-0 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold', INTENSITY_STYLE[block.intensity])}>
              {block.intensity}
            </span>
          </div>
          <div className="mt-0.5 text-xs font-medium text-text-primary truncate">{block.name}</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-text-muted">
            <Clock className="h-2.5 w-2.5" />
            {block.durationMins} min
            {block.drills.length > 0 && (
              <span className="ml-1">· {block.drills.length} drills</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            disabled={isFirst}
            onClick={onMoveUp}
            className="p-0.5 rounded text-text-faint hover:text-text-primary disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={isLast}
            onClick={onMoveDown}
            className="p-0.5 rounded text-text-faint hover:text-text-primary disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-0.5 rounded text-text-faint hover:text-rose transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
