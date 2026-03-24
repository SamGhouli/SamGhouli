'use client'

import { X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type FormationKey = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2' | '4-1-4-1'
type PositionType = 'gk' | 'def' | 'mid' | 'fwd'

interface PositionSlot {
  label: string
  type: PositionType
}

interface SlotRow {
  slots: PositionSlot[]
  yFrac: number // 0 = attacking end (top), 1 = defending end (GK)
}

export interface PitchAthlete {
  id: string
  full_name: string
  initials?: string
  avatar_color?: string
  position: string
}

interface FormationPitchProps {
  formation: FormationKey
  startingAthletes: PitchAthlete[]
  /** Compact embedded view vs full presentation  */
  presentation?: boolean
  /** Callback for close button in presentation mode */
  onClose?: () => void
  matchTitle?: string
  teamName?: string
}

// ── Formation layouts ──────────────────────────────────────────────────────────
// yFrac: 0 = top (attacking), 1 = bottom (GK/defending)

const LAYOUTS: Record<FormationKey, SlotRow[]> = {
  '4-3-3': [
    { yFrac: 0.90, slots: [{ label: 'GK', type: 'gk' }] },
    { yFrac: 0.74, slots: [{ label: 'LB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'RB', type: 'def' }] },
    { yFrac: 0.50, slots: [{ label: 'CM', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'CM', type: 'mid' }] },
    { yFrac: 0.21, slots: [{ label: 'LW', type: 'fwd' }, { label: 'ST', type: 'fwd' }, { label: 'RW', type: 'fwd' }] },
  ],
  '4-2-3-1': [
    { yFrac: 0.90, slots: [{ label: 'GK', type: 'gk' }] },
    { yFrac: 0.74, slots: [{ label: 'LB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'RB', type: 'def' }] },
    { yFrac: 0.57, slots: [{ label: 'DM', type: 'mid' }, { label: 'DM', type: 'mid' }] },
    { yFrac: 0.37, slots: [{ label: 'LW', type: 'mid' }, { label: 'CAM', type: 'mid' }, { label: 'RW', type: 'mid' }] },
    { yFrac: 0.16, slots: [{ label: 'ST', type: 'fwd' }] },
  ],
  '3-5-2': [
    { yFrac: 0.90, slots: [{ label: 'GK', type: 'gk' }] },
    { yFrac: 0.74, slots: [{ label: 'CB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'CB', type: 'def' }] },
    { yFrac: 0.50, slots: [{ label: 'LWB', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'RWB', type: 'mid' }] },
    { yFrac: 0.21, slots: [{ label: 'ST', type: 'fwd' }, { label: 'ST', type: 'fwd' }] },
  ],
  '4-4-2': [
    { yFrac: 0.90, slots: [{ label: 'GK', type: 'gk' }] },
    { yFrac: 0.74, slots: [{ label: 'LB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'RB', type: 'def' }] },
    { yFrac: 0.50, slots: [{ label: 'LM', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'RM', type: 'mid' }] },
    { yFrac: 0.21, slots: [{ label: 'ST', type: 'fwd' }, { label: 'ST', type: 'fwd' }] },
  ],
  '4-1-4-1': [
    { yFrac: 0.90, slots: [{ label: 'GK', type: 'gk' }] },
    { yFrac: 0.76, slots: [{ label: 'LB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'CB', type: 'def' }, { label: 'RB', type: 'def' }] },
    { yFrac: 0.61, slots: [{ label: 'DM', type: 'mid' }] },
    { yFrac: 0.40, slots: [{ label: 'LM', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'CM', type: 'mid' }, { label: 'RM', type: 'mid' }] },
    { yFrac: 0.16, slots: [{ label: 'ST', type: 'fwd' }] },
  ],
}

// ── Auto-assign athletes to slots ─────────────────────────────────────────────

function getPositionType(pos: string): PositionType {
  const p = pos.toLowerCase()
  if (p.includes('goal')) return 'gk'
  if (p.includes('defend') || p === 'back') return 'def'
  if (p.includes('mid') || p.includes('wing')) return 'mid'
  return 'fwd'
}

function assignAthletes(
  athletes: PitchAthlete[],
  layout: SlotRow[]
): (PitchAthlete | null)[] {
  // Group athletes by position type
  const pools: Record<PositionType, PitchAthlete[]> = { gk: [], def: [], mid: [], fwd: [] }
  for (const a of athletes) {
    pools[getPositionType(a.position)].push(a)
  }
  const cursors: Record<PositionType, number> = { gk: 0, def: 0, mid: 0, fwd: 0 }

  const result: (PitchAthlete | null)[] = []
  for (const row of layout) {
    for (const slot of row.slots) {
      const t = slot.type
      const pool = pools[t]
      if (cursors[t] < pool.length) {
        result.push(pool[cursors[t]++])
      } else {
        result.push(null)
      }
    }
  }
  return result
}

// ── SVG Pitch constants ────────────────────────────────────────────────────────
// ViewBox: 360 × 520
const VW = 360
const VH = 520
const PL = 22   // pitch left
const PT = 18   // pitch top
const PR = 338  // pitch right (PL + 316)
const PB = 502  // pitch bottom (PT + 484)
const PW = PR - PL  // 316
const PH = PB - PT  // 484

const gx = (frac: number) => PL + frac * PW
const gy = (frac: number) => PT + frac * PH

// Row x positions: evenly space N nodes across the pitch width
function rowXFracs(n: number): number[] {
  return Array.from({ length: n }, (_, i) => (i + 1) / (n + 1))
}

// Truncate last name for display
function surname(fullName: string) {
  const parts = fullName.trim().split(' ')
  return parts[parts.length - 1]
}

// ── Pitch SVG ─────────────────────────────────────────────────────────────────

function PitchMarkings() {
  const lineProps = { fill: 'none', stroke: 'rgba(255,255,255,0.30)', strokeWidth: 1.5 }
  const halfY = PT + PH / 2  // 260

  return (
    <g>
      {/* Grass stripes */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x={PL} y={PT + i * (PH / 6)}
          width={PW} height={PH / 6}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent'}
        />
      ))}

      {/* Pitch outline */}
      <rect x={PL} y={PT} width={PW} height={PH} {...lineProps} />

      {/* Halfway line */}
      <line x1={PL} y1={halfY} x2={PR} y2={halfY} {...lineProps} />

      {/* Centre circle */}
      <circle cx={gx(0.5)} cy={halfY} r={52} {...lineProps} />
      <circle cx={gx(0.5)} cy={halfY} r={2.5} fill="rgba(255,255,255,0.4)" />

      {/* Top penalty box (opponent's) */}
      <rect x={gx(0.24)} y={PT} width={PW * 0.52} height={PH * 0.17} {...lineProps} />
      {/* Top 6-yard box */}
      <rect x={gx(0.34)} y={PT} width={PW * 0.32} height={PH * 0.07} {...lineProps} />
      {/* Top penalty spot */}
      <circle cx={gx(0.5)} cy={PT + PH * 0.135} r={2.5} fill="rgba(255,255,255,0.4)" />

      {/* Bottom penalty box (defending) */}
      <rect x={gx(0.24)} y={PB - PH * 0.17} width={PW * 0.52} height={PH * 0.17} {...lineProps} />
      {/* Bottom 6-yard box */}
      <rect x={gx(0.34)} y={PB - PH * 0.07} width={PW * 0.32} height={PH * 0.07} {...lineProps} />
      {/* Bottom penalty spot */}
      <circle cx={gx(0.5)} cy={PB - PH * 0.135} r={2.5} fill="rgba(255,255,255,0.4)" />

      {/* Goals */}
      <rect x={gx(0.40)} y={PT - 10} width={PW * 0.20} height={10} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
      <rect x={gx(0.40)} y={PB} width={PW * 0.20} height={10} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
    </g>
  )
}

// ── Player node ────────────────────────────────────────────────────────────────

function PlayerNode({
  cx, cy, athlete, posLabel, r,
}: {
  cx: number
  cy: number
  athlete: PitchAthlete | null
  posLabel: string
  r: number
}) {
  const fs = r * 0.5     // initials font size
  const labelFs = r * 0.38
  const nameFs = r * 0.40
  const nameY = cy + r + nameFs + 2

  if (!athlete) {
    return (
      <g>
        <circle
          cx={cx} cy={cy} r={r}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text
          x={cx} y={cy + labelFs * 0.4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.30)"
          fontSize={labelFs + 1}
          fontWeight={700}
          fontFamily="system-ui, sans-serif"
        >
          {posLabel}
        </text>
      </g>
    )
  }

  const color = athlete.avatar_color ?? '#7a869a'
  // Hex → rgba with opacity
  const r_ = parseInt(color.slice(1, 3), 16)
  const g_ = parseInt(color.slice(3, 5), 16)
  const b_ = parseInt(color.slice(5, 7), 16)
  const bgFill = `rgba(${r_},${g_},${b_},0.85)`
  const shadowFill = `rgba(${r_},${g_},${b_},0.25)`
  const sn = surname(athlete.full_name)
  const displayName = sn.length > 9 ? sn.slice(0, 8) + '.' : sn

  return (
    <g>
      {/* Drop shadow ring */}
      <circle cx={cx} cy={cy + 1.5} r={r + 1} fill={shadowFill} />
      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r} fill={bgFill} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
      {/* Position label (small, top of circle) */}
      <text
        x={cx} y={cy - fs * 0.35}
        textAnchor="middle"
        fill="rgba(255,255,255,0.70)"
        fontSize={labelFs}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        {posLabel}
      </text>
      {/* Initials */}
      <text
        x={cx} y={cy + fs * 0.65}
        textAnchor="middle"
        fill="white"
        fontSize={fs}
        fontWeight={800}
        fontFamily="system-ui, sans-serif"
      >
        {athlete.initials ?? athlete.full_name.slice(0, 2).toUpperCase()}
      </text>
      {/* Surname below circle */}
      <text
        x={cx} y={nameY}
        textAnchor="middle"
        fill="rgba(255,255,255,0.88)"
        fontSize={nameFs}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
      >
        {displayName}
      </text>
    </g>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FormationPitch({
  formation,
  startingAthletes,
  presentation = false,
  onClose,
  matchTitle,
  teamName,
}: FormationPitchProps) {
  const layout = LAYOUTS[formation]
  const assigned = assignAthletes(startingAthletes, layout)

  // Node radius: slightly larger in presentation mode
  const nodeR = presentation ? 24 : 19

  // Build flat list of (cx, cy, athlete, posLabel) tuples
  let slotIdx = 0
  const nodes: { cx: number; cy: number; athlete: PitchAthlete | null; posLabel: string }[] = []

  for (const row of layout) {
    const xFracs = rowXFracs(row.slots.length)
    row.slots.forEach((slot, si) => {
      nodes.push({
        cx: gx(xFracs[si]),
        cy: gy(row.yFrac),
        athlete: assigned[slotIdx] ?? null,
        posLabel: slot.label,
      })
      slotIdx++
    })
  }

  return (
    <div className="relative w-full">
      {/* Present / close button */}
      {onClose ? (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {/* Header (presentation mode only) */}
      {presentation && (matchTitle || teamName) && (
        <div className="text-center pt-4 pb-2 px-4">
          {teamName && (
            <p className="text-xs font-bold uppercase tracking-widest text-lime mb-0.5">{teamName}</p>
          )}
          {matchTitle && (
            <h2 className="text-lg font-black text-white leading-tight">{matchTitle}</h2>
          )}
          <p className="mt-1 inline-block rounded-full border border-lime/40 bg-lime/10 px-3 py-0.5 text-sm font-bold text-lime">
            {formation}
          </p>
        </div>
      )}

      {/* SVG Pitch */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ maxHeight: presentation ? '80vh' : '480px' }}
        aria-label={`Formation: ${formation}`}
      >
        {/* Pitch background */}
        <rect x={0} y={0} width={VW} height={VH} fill="#1a3a1c" rx={presentation ? 0 : 12} />

        <PitchMarkings />

        {/* Formation label (embedded mode) */}
        {!presentation && (
          <text
            x={VW / 2} y={VH - 6}
            textAnchor="middle"
            fill="rgba(255,255,255,0.30)"
            fontSize={11}
            fontWeight={700}
            fontFamily="system-ui, sans-serif"
            letterSpacing="2"
          >
            {formation}
          </text>
        )}

        {/* Direction arrows */}
        <text x={PL + 4} y={PT + 14} fill="rgba(255,255,255,0.22)" fontSize={9} fontFamily="system-ui">▲ ATT</text>
        <text x={PL + 4} y={PB - 4} fill="rgba(255,255,255,0.22)" fontSize={9} fontFamily="system-ui">▼ DEF</text>

        {/* Player nodes */}
        {nodes.map((n, i) => (
          <PlayerNode key={i} {...n} r={nodeR} />
        ))}
      </svg>
    </div>
  )
}

// ── Fullscreen presentation overlay ───────────────────────────────────────────

interface PresentationOverlayProps {
  formation: FormationKey
  startingAthletes: PitchAthlete[]
  matchTitle?: string
  teamName?: string
  onClose: () => void
}

export function PresentationOverlay({
  formation,
  startingAthletes,
  matchTitle,
  teamName,
  onClose,
}: PresentationOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md px-4">
        <FormationPitch
          formation={formation}
          startingAthletes={startingAthletes}
          presentation
          onClose={onClose}
          matchTitle={matchTitle}
          teamName={teamName}
        />
      </div>

      {/* Footer hint */}
      <p className="mt-4 text-xs text-white/30">Tap outside or press Esc to close</p>
    </div>
  )
}
