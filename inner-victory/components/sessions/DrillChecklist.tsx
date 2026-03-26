'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrillChecklistProps {
  drills: string[]
  blockId: string
  completedDrills: Set<string>
  onToggle: (key: string) => void
}

export function DrillChecklist({ drills, blockId, completedDrills, onToggle }: DrillChecklistProps) {
  if (drills.length === 0) {
    return (
      <p className="text-center text-sm text-text-faint py-4">
        No drills planned for this block.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {drills.map((drill, idx) => {
        const key = `${blockId}-${idx}`
        const done = completedDrills.has(key)
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all active:scale-[0.98]',
              done
                ? 'border-border-1 bg-surface-2 opacity-50'
                : 'border-border-1 bg-surface-2 hover:border-lime/30 hover:bg-lime/5'
            )}
          >
            {done ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-lime" />
            ) : (
              <Circle className="h-6 w-6 shrink-0 text-text-faint" />
            )}
            <span
              className={cn(
                'text-base font-medium',
                done ? 'line-through text-text-faint' : 'text-text-primary'
              )}
            >
              {drill}
            </span>
          </button>
        )
      })}
    </div>
  )
}
