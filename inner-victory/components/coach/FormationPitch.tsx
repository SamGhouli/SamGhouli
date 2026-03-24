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
  yFrac: number
}

export interface PitchAthlete {
  id: string
  full_name: string
  initials?: string
  avatar_color?: string
  position: string
  readiness?: number
}

export interface MatchBriefData {
  formation: FormationKey
  startingAthletes: PitchAthlete[]
  benchAthletes: PitchAthlete[]
  tactics: { id: string; title: string; content: string }[]
  corners: { taker: string; nearPost: string; farPost: string; edge: string; clearance: string }
  freekicks: { taker: string; wall: string; runner: string }
  oppositionThreats: string[]
  oppositionWeaknesses: string[]
  matchTitle?: string
  matchDate?: string
  matchTime?: string
  matchLocation?: string
  teamName?: string
  onClose: () => void
}

// ── Formation layouts ──────────────────────────────────────────────────────────

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

// ── Athlete → slot assignment ──────────────────────────────────────────────────

function getPositionType(pos: string): PositionType {
  const p = pos.toLowerCase()
  if (p.includes('goal')) return 'gk'
  if (p.includes('defend') || p === 'back') return 'def'
  if (p.includes('mid') || p.includes('wing')) return 'mid'
  return 'fwd'
}

function assignAthletes(athletes: PitchAthlete[], layout: SlotRow[]) {
  const pools: Record<PositionType, PitchAthlete[]> = { gk: [], def: [], mid: [], fwd: [] }
  for (const a of athletes) pools[getPositionType(a.position)].push(a)
  const cursors: Record<PositionType, number> = { gk: 0, def: 0, mid: 0, fwd: 0 }

  const result: (PitchAthlete | null)[] = []
  for (const row of layout) {
    for (const slot of row.slots) {
      const t = slot.type
      result.push(cursors[t] < pools[t].length ? pools[t][cursors[t]++] : null)
    }
  }
  return result
}

/** Returns starting lineup as ordered { athlete | null, slotLabel } pairs */
function buildLineup(athletes: PitchAthlete[], formation: FormationKey) {
  const layout = LAYOUTS[formation]
  const assigned = assignAthletes(athletes, layout)
  let idx = 0
  const rows: { athlete: PitchAthlete | null; slotLabel: string }[][] = []
  for (const row of layout) {
    const cells = row.slots.map((slot) => ({ athlete: assigned[idx++] ?? null, slotLabel: slot.label }))
    rows.push(cells)
  }
  return rows
}

// ── SVG pitch constants ────────────────────────────────────────────────────────

const VW = 360
const VH = 520
const PL = 22
const PT = 18
const PR = 338
const PB = 502
const PW = PR - PL
const PH = PB - PT

const gx = (f: number) => PL + f * PW
const gy = (f: number) => PT + f * PH
const rowXFracs = (n: number) => Array.from({ length: n }, (_, i) => (i + 1) / (n + 1))
const surname = (name: string) => { const p = name.trim().split(' '); return p[p.length - 1] }

// ── SVG sub-components ────────────────────────────────────────────────────────

function PitchMarkings() {
  const line = { fill: 'none', stroke: 'rgba(255,255,255,0.28)', strokeWidth: 1.5 }
  const halfY = PT + PH / 2
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={PL} y={PT + i * (PH / 6)} width={PW} height={PH / 6}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'transparent'} />
      ))}
      <rect x={PL} y={PT} width={PW} height={PH} {...line} />
      <line x1={PL} y1={halfY} x2={PR} y2={halfY} {...line} />
      <circle cx={gx(0.5)} cy={halfY} r={52} {...line} />
      <circle cx={gx(0.5)} cy={halfY} r={2.5} fill="rgba(255,255,255,0.4)" />
      <rect x={gx(0.24)} y={PT} width={PW * 0.52} height={PH * 0.17} {...line} />
      <rect x={gx(0.34)} y={PT} width={PW * 0.32} height={PH * 0.07} {...line} />
      <circle cx={gx(0.5)} cy={PT + PH * 0.135} r={2.5} fill="rgba(255,255,255,0.4)" />
      <rect x={gx(0.24)} y={PB - PH * 0.17} width={PW * 0.52} height={PH * 0.17} {...line} />
      <rect x={gx(0.34)} y={PB - PH * 0.07} width={PW * 0.32} height={PH * 0.07} {...line} />
      <circle cx={gx(0.5)} cy={PB - PH * 0.135} r={2.5} fill="rgba(255,255,255,0.4)" />
      <rect x={gx(0.40)} y={PT - 10} width={PW * 0.20} height={10}
        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
      <rect x={gx(0.40)} y={PB} width={PW * 0.20} height={10}
        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
    </g>
  )
}

function PlayerNode({ cx, cy, athlete, posLabel, r }: {
  cx: number; cy: number; athlete: PitchAthlete | null; posLabel: string; r: number
}) {
  const fs = r * 0.5
  const labelFs = r * 0.36
  const nameFs = r * 0.38

  if (!athlete) return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={cx} y={cy + labelFs * 0.4} textAnchor="middle"
        fill="rgba(255,255,255,0.28)" fontSize={labelFs + 1} fontWeight={700}
        fontFamily="system-ui, sans-serif">{posLabel}</text>
    </g>
  )

  const color = athlete.avatar_color ?? '#7a869a'
  const [r_, g_, b_] = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)]
  const sn = surname(athlete.full_name)

  return (
    <g>
      <circle cx={cx} cy={cy + 1.5} r={r + 1} fill={`rgba(${r_},${g_},${b_},0.22)`} />
      <circle cx={cx} cy={cy} r={r} fill={`rgba(${r_},${g_},${b_},0.88)`}
        stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
      <text x={cx} y={cy - fs * 0.35} textAnchor="middle"
        fill="rgba(255,255,255,0.65)" fontSize={labelFs} fontWeight={600}
        fontFamily="system-ui, sans-serif" letterSpacing="0.5">{posLabel}</text>
      <text x={cx} y={cy + fs * 0.65} textAnchor="middle"
        fill="white" fontSize={fs} fontWeight={800}
        fontFamily="system-ui, sans-serif">
        {athlete.initials ?? athlete.full_name.slice(0, 2).toUpperCase()}
      </text>
      <text x={cx} y={cy + r + nameFs + 2} textAnchor="middle"
        fill="rgba(255,255,255,0.85)" fontSize={nameFs} fontWeight={600}
        fontFamily="system-ui, sans-serif">
        {(sn.length > 9 ? sn.slice(0, 8) + '.' : sn)}
      </text>
    </g>
  )
}

// ── Core SVG pitch (shared between embedded and overlay) ──────────────────────

function PitchSvg({ formation, startingAthletes, nodeR = 19, style }: {
  formation: FormationKey
  startingAthletes: PitchAthlete[]
  nodeR?: number
  style?: React.CSSProperties
}) {
  const layout = LAYOUTS[formation]
  const assigned = assignAthletes(startingAthletes, layout)
  let slotIdx = 0
  const nodes: { cx: number; cy: number; athlete: PitchAthlete | null; posLabel: string }[] = []

  for (const row of layout) {
    const xFracs = rowXFracs(row.slots.length)
    row.slots.forEach((slot, si) => {
      nodes.push({ cx: gx(xFracs[si]), cy: gy(row.yFrac), athlete: assigned[slotIdx] ?? null, posLabel: slot.label })
      slotIdx++
    })
  }

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={style} aria-label={`Formation ${formation}`}>
      <rect x={0} y={0} width={VW} height={VH} fill="#182e1a" rx={6} />
      <PitchMarkings />
      <text x={VW / 2} y={VH - 6} textAnchor="middle"
        fill="rgba(255,255,255,0.25)" fontSize={10} fontWeight={700}
        fontFamily="system-ui" letterSpacing="2">{formation}</text>
      <text x={PL + 3} y={PT + 13} fill="rgba(255,255,255,0.20)" fontSize={8} fontFamily="system-ui">▲ ATT</text>
      <text x={PL + 3} y={PB - 3} fill="rgba(255,255,255,0.20)" fontSize={8} fontFamily="system-ui">▼ DEF</text>
      {nodes.map((n, i) => <PlayerNode key={i} {...n} r={nodeR} />)}
    </svg>
  )
}

// ── Embedded component (used inline in the page) ──────────────────────────────

export function FormationPitch({ formation, startingAthletes }: {
  formation: FormationKey
  startingAthletes: PitchAthlete[]
}) {
  return (
    <div className="w-full bg-[#182e1a] rounded-xl overflow-hidden">
      <PitchSvg formation={formation} startingAthletes={startingAthletes}
        style={{ width: '100%', display: 'block' }} />
    </div>
  )
}

// ── Helpers for the right panel ────────────────────────────────────────────────

function rdColor(s?: number) {
  if (!s) return '#94a3b8'
  if (s >= 75) return '#4ade80'
  if (s >= 55) return '#fbbf24'
  return '#fb7185'
}

function Section({ title, color = '#d4ff5c', children }: {
  title: string; color?: string; children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color }}>{title}</p>
      {children}
    </div>
  )
}

// ── Full match brief presentation overlay ─────────────────────────────────────

export function PresentationOverlay({
  formation, startingAthletes, benchAthletes,
  tactics, corners, freekicks,
  oppositionThreats, oppositionWeaknesses,
  matchTitle, matchDate, matchTime, matchLocation, teamName,
  onClose,
}: MatchBriefData) {
  const lineup = buildLineup(startingAthletes, formation).flat()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070f08] text-white overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-none flex items-center justify-between gap-6 border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-4 min-w-0">
          {teamName && (
            <span className="shrink-0 rounded bg-lime/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-lime">
              {teamName}
            </span>
          )}
          <h1 className="truncate text-base font-black text-white">{matchTitle ?? 'Match Preparation'}</h1>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          {(matchDate || matchTime) && (
            <div className="text-right">
              {matchDate && <p className="text-xs text-white/50">{matchDate}</p>}
              {matchTime && <p className="text-xs font-semibold text-white/70">{matchTime}{matchLocation ? ` · ${matchLocation}` : ''}</p>}
            </div>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Body: pitch left + notes right ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT — Formation pitch */}
        <div className="flex-none flex flex-col items-center justify-center border-r border-white/10 bg-[#0d1f0e] px-4 py-4"
          style={{ width: 'clamp(280px, 38vw, 440px)' }}>
          <PitchSvg
            formation={formation}
            startingAthletes={startingAthletes}
            nodeR={20}
            style={{
              height: 'min(calc(100vh - 130px), 560px)',
              width: 'auto',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <p className="mt-2 text-[11px] font-black tracking-[0.2em] text-lime/70">{formation}</p>
        </div>

        {/* RIGHT — Match notes panel */}
        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5 space-y-0">

          {/* ── Squad ── */}
          <Section title="Squad">
            <div className="grid grid-cols-2 gap-x-6 gap-y-0">
              {/* Starting XI */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wide">
                  Starting XI ({startingAthletes.length})
                </p>
                {lineup.map((entry, i) => {
                  if (!entry.athlete) return null
                  const a = entry.athlete
                  return (
                    <div key={i} className="flex items-center gap-2 py-[3px]">
                      <span className="w-7 shrink-0 rounded px-1 py-0.5 text-center text-[10px] font-black"
                        style={{ backgroundColor: `${a.avatar_color ?? '#7a869a'}20`, color: a.avatar_color ?? '#7a869a' }}>
                        {entry.slotLabel}
                      </span>
                      <span className="flex-1 truncate text-xs font-medium text-white/90">{a.full_name}</span>
                      {a.readiness !== undefined && (
                        <span className="shrink-0 text-[11px] font-bold tabular-nums"
                          style={{ color: rdColor(a.readiness) }}>{a.readiness}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bench + Out */}
              <div>
                {benchAthletes.length > 0 && (
                  <>
                    <p className="mb-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wide">
                      Bench ({benchAthletes.length})
                    </p>
                    {benchAthletes.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 py-[3px]">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: '#fbbf24' }} />
                        <span className="flex-1 truncate text-xs text-white/70">{a.full_name}</span>
                        {a.readiness !== undefined && (
                          <span className="shrink-0 text-[11px] font-bold tabular-nums"
                            style={{ color: rdColor(a.readiness) }}>{a.readiness}</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </Section>

          <div className="border-t border-white/8 mb-5" />

          {/* ── Tactical notes ── */}
          <Section title="Key Tactical Notes" color="#60a5fa">
            <div className="space-y-2">
              {tactics.map((t) => (
                <div key={t.id} className="flex gap-2">
                  <span className="mt-px shrink-0 text-[10px] font-black text-blue-400/70 uppercase w-[52px]">
                    {t.title.split(' ')[0]}
                  </span>
                  <p className="flex-1 text-xs leading-relaxed text-white/75">{t.content}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="border-t border-white/8 mb-5" />

          {/* ── Set pieces + Opposition side by side ── */}
          <div className="grid grid-cols-2 gap-6">

            {/* Set Pieces */}
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-400">
                Set Pieces
              </p>
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] text-white/40 mb-0.5">Corners</p>
                  <p className="text-xs text-white/80">
                    <span className="font-semibold text-white">{corners.taker}</span> takes
                  </p>
                  <p className="text-[11px] text-white/55">
                    Near post: {corners.nearPost} · Far post: {corners.farPost}
                  </p>
                  <p className="text-[11px] text-white/55">Edge: {corners.edge}</p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] text-white/40 mb-0.5">Free Kicks</p>
                  <p className="text-xs text-white/80">
                    <span className="font-semibold text-white">{freekicks.taker}</span> takes
                  </p>
                  <p className="text-[11px] text-white/55">Runner: {freekicks.runner}</p>
                </div>
              </div>
            </div>

            {/* Opposition */}
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-rose-400">
                Opposition
              </p>
              <div className="space-y-1">
                {oppositionThreats.map((t, i) => (
                  <div key={i} className="flex gap-1.5 text-[11px] text-white/75">
                    <span className="shrink-0 text-rose-400/80">⚠</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              {oppositionWeaknesses.length > 0 && (
                <div className="mt-2 space-y-1">
                  {oppositionWeaknesses.map((w, i) => (
                    <div key={i} className="flex gap-1.5 text-[11px] text-white/60">
                      <span className="shrink-0 text-green-400/70">✓</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
