'use client'

import { useState } from 'react'
import { Plus, X, Minus } from 'lucide-react'
import type { SessionBlockV2, BlockIntensity } from '@/types/database'
import { cn } from '@/lib/utils'

interface BlockEditorProps {
  block: SessionBlockV2
  onChange: (updates: Partial<SessionBlockV2>) => void
}

const INTENSITY_OPTIONS: { value: BlockIntensity; label: string; className: string }[] = [
  { value: 'low', label: 'Low', className: 'border-green/30 bg-green/10 text-green data-[selected=true]:ring-1 data-[selected=true]:ring-green' },
  { value: 'medium', label: 'Medium', className: 'border-amber/30 bg-amber/10 text-amber data-[selected=true]:ring-1 data-[selected=true]:ring-amber' },
  { value: 'high', label: 'High', className: 'border-rose/30 bg-rose/10 text-rose data-[selected=true]:ring-1 data-[selected=true]:ring-rose' },
]

export function BlockEditor({ block, onChange }: BlockEditorProps) {
  const [newDrill, setNewDrill] = useState('')

  function addDrill() {
    if (!newDrill.trim()) return
    onChange({ drills: [...block.drills, newDrill.trim()] })
    setNewDrill('')
  }

  function removeDrill(idx: number) {
    onChange({ drills: block.drills.filter((_, i) => i !== idx) })
  }

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-lime/20 bg-lime/5 p-4">
      {/* Name */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Block Name
        </label>
        <input
          type="text"
          value={block.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-xs text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
          placeholder="e.g. High Press Patterns"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Duration
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange({ durationMins: Math.max(5, block.durationMins - 5) })}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-1 bg-surface-3 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-16 text-center text-sm font-bold tabular-nums text-text-primary">
            {block.durationMins} min
          </span>
          <button
            onClick={() => onChange({ durationMins: Math.min(120, block.durationMins + 5) })}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-1 bg-surface-3 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Intensity */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Intensity
        </label>
        <div className="flex gap-2">
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              data-selected={block.intensity === opt.value}
              onClick={() => onChange({ intensity: opt.value })}
              className={cn(
                'flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all',
                opt.className,
                block.intensity === opt.value ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drills */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Drills
        </label>
        <div className="space-y-1.5">
          {block.drills.map((drill, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg bg-surface-3 px-2.5 py-1.5">
              <span className="flex-1 text-xs text-text-primary">{drill}</span>
              <button
                onClick={() => removeDrill(idx)}
                className="text-text-faint hover:text-rose transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newDrill}
            onChange={(e) => setNewDrill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDrill() } }}
            placeholder="Add drill name…"
            className="flex-1 rounded-lg border border-border-1 bg-surface-3 px-3 py-1.5 text-xs text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
          />
          <button
            onClick={addDrill}
            disabled={!newDrill.trim()}
            className="flex items-center gap-1 rounded-lg border border-lime/30 bg-lime/10 px-2.5 py-1.5 text-xs font-medium text-lime disabled:opacity-40 transition-colors hover:bg-lime/20"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>

      {/* Coach Notes */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Coach Notes
        </label>
        <textarea
          value={block.coachNotes}
          onChange={(e) => onChange({ coachNotes: e.target.value })}
          placeholder="Setup instructions, tactical context, player-specific notes…"
          rows={2}
          className="w-full resize-none rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-xs text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
        />
      </div>
    </div>
  )
}
