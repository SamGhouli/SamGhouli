'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  SessionPlanV2,
  SessionBlockV2,
  SessionBlockType,
  BlockIntensity,
  SessionType,
  Incident,
} from '@/types/database'
import { DEMO_SESSION_PLANS } from '@/lib/demo/data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionPhase = 'list' | 'builder' | 'live' | 'reflection'

export type SidebarTab = 'overview' | 'roster' | 'notes'

export interface LiveState {
  currentBlockIndex: number
  isRunning: boolean
  secondsRemaining: number
  completedDrills: Set<string>
  statusOverrides: Record<string, string>
  incidents: Incident[]
  notes: string
  sidebarTab: SidebarTab
  sidebarOpen: boolean
}

export interface PostSessionState {
  summaryConfirmed: boolean
  reflection: string
  aiAck: string
  aiAckLoading: boolean
  rpe: number
  incidents: Incident[]
  screen: 1 | 2 | 3 | 4
}

export interface SessionPlannerActions {
  newSession: () => void
  editSession: (sessionId: string) => void
  updateDraft: (updates: Partial<SessionPlanV2>) => void
  addBlock: (type: SessionBlockType) => void
  updateBlock: (id: string, updates: Partial<SessionBlockV2>) => void
  removeBlock: (id: string) => void
  reorderBlock: (id: string, direction: 'up' | 'down') => void
  selectBlock: (id: string | null) => void
  savePlan: () => void
  startSession: () => void
  toggleTimer: () => void
  nextBlock: () => void
  prevBlock: () => void
  toggleDrill: (drillKey: string) => void
  updateLiveAthleteStatus: (athleteId: string, status: string) => void
  logIncident: (description: string) => void
  updateLiveNotes: (notes: string) => void
  setSidebarTab: (tab: SidebarTab) => void
  toggleSidebar: () => void
  endSession: () => void
  advanceReflectionScreen: () => void
  backReflectionScreen: () => void
  setReflection: (text: string) => void
  setAiAck: (text: string, loading?: boolean) => void
  setRPE: (rpe: number) => void
  confirmIncident: (id: string) => void
  dismissIncident: (id: string) => void
  finalizeSession: () => void
  cancelBuilder: () => void
}

// ---------------------------------------------------------------------------
// Block library defaults
// ---------------------------------------------------------------------------

const BLOCK_DEFAULTS: Record<SessionBlockType, { name: string; durationMins: number; intensity: BlockIntensity }> = {
  'warm-up': { name: 'Warm-Up', durationMins: 15, intensity: 'low' },
  'technical': { name: 'Technical', durationMins: 20, intensity: 'medium' },
  'tactical': { name: 'Tactical', durationMins: 25, intensity: 'medium' },
  'physical': { name: 'Physical / Conditioning', durationMins: 20, intensity: 'high' },
  'set-pieces': { name: 'Set Pieces', durationMins: 15, intensity: 'low' },
  'cool-down': { name: 'Cool-Down', durationMins: 10, intensity: 'low' },
}

function newBlockId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function newSessionId(): string {
  return `spv2-${Date.now()}`
}

function newIncidentId(): string {
  return `inc-${Date.now()}`
}

const EMPTY_DRAFT: SessionPlanV2 = {
  id: '',
  title: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  venue: '',
  sessionType: 'tactical',
  blocks: [],
  status: 'planned',
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSessionPlanner() {
  const [phase, setPhase] = useState<SessionPhase>('list')
  const [sessions, setSessions] = useState<SessionPlanV2[]>(DEMO_SESSION_PLANS)
  const [draft, setDraft] = useState<SessionPlanV2 | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [live, setLive] = useState<LiveState | null>(null)
  const [postSession, setPostSession] = useState<PostSessionState | null>(null)

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!live?.isRunning) return
    const id = setInterval(() => {
      setLive((prev) => {
        if (!prev) return prev
        if (prev.secondsRemaining <= 1) {
          clearInterval(id)
          // Auto-advance to next block if available
          const plan = sessions.find(() => true) // current session
          const hasNext = prev.currentBlockIndex < (plan?.blocks.length ?? 0) - 1
          if (hasNext) {
            const nextIndex = prev.currentBlockIndex + 1
            const planForLive = sessions.find((s) => s.status === 'live') ?? sessions[0]
            const nextBlock = planForLive?.blocks[nextIndex]
            return {
              ...prev,
              currentBlockIndex: nextIndex,
              isRunning: false,
              secondsRemaining: (nextBlock?.durationMins ?? 10) * 60,
            }
          }
          return { ...prev, secondsRemaining: 0, isRunning: false }
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [live?.isRunning, live?.currentBlockIndex, sessions])

  // ── Actions ────────────────────────────────────────────────────────────────

  const actions: SessionPlannerActions = {
    newSession: useCallback(() => {
      setDraft({ ...EMPTY_DRAFT, id: newSessionId() })
      setSelectedBlockId(null)
      setPhase('builder')
    }, []),

    editSession: useCallback((sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) return
      setDraft({ ...session })
      setSelectedBlockId(null)
      setPhase('builder')
    }, [sessions]),

    updateDraft: useCallback((updates: Partial<SessionPlanV2>) => {
      setDraft((prev) => prev ? { ...prev, ...updates } : prev)
    }, []),

    addBlock: useCallback((type: SessionBlockType) => {
      const defaults = BLOCK_DEFAULTS[type]
      const newBlock: SessionBlockV2 = {
        id: newBlockId(),
        type,
        name: defaults.name,
        durationMins: defaults.durationMins,
        intensity: defaults.intensity,
        drills: [],
        coachNotes: '',
      }
      setDraft((prev) => {
        if (!prev) return prev
        return { ...prev, blocks: [...prev.blocks, newBlock] }
      })
      setSelectedBlockId(newBlock.id)
    }, []),

    updateBlock: useCallback((id: string, updates: Partial<SessionBlockV2>) => {
      setDraft((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }
      })
    }, []),

    removeBlock: useCallback((id: string) => {
      setDraft((prev) => {
        if (!prev) return prev
        return { ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }
      })
      setSelectedBlockId((prev) => (prev === id ? null : prev))
    }, []),

    reorderBlock: useCallback((id: string, direction: 'up' | 'down') => {
      setDraft((prev) => {
        if (!prev) return prev
        const idx = prev.blocks.findIndex((b) => b.id === id)
        if (idx === -1) return prev
        const newBlocks = [...prev.blocks]
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= newBlocks.length) return prev
        ;[newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]]
        return { ...prev, blocks: newBlocks }
      })
    }, []),

    selectBlock: useCallback((id: string | null) => {
      setSelectedBlockId(id)
    }, []),

    savePlan: useCallback(() => {
      if (!draft) return
      setSessions((prev) => {
        const exists = prev.find((s) => s.id === draft.id)
        if (exists) return prev.map((s) => (s.id === draft.id ? draft : s))
        return [...prev, draft]
      })
      setPhase('list')
      setDraft(null)
    }, [draft]),

    startSession: useCallback(() => {
      if (!draft) return
      const saved = { ...draft, status: 'live' as const }
      setSessions((prev) => {
        const exists = prev.find((s) => s.id === saved.id)
        if (exists) return prev.map((s) => (s.id === saved.id ? saved : s))
        return [...prev, saved]
      })
      const firstBlock = saved.blocks[0]
      setLive({
        currentBlockIndex: 0,
        isRunning: false,
        secondsRemaining: (firstBlock?.durationMins ?? 10) * 60,
        completedDrills: new Set(),
        statusOverrides: {},
        incidents: [],
        notes: '',
        sidebarTab: 'overview',
        sidebarOpen: false,
      })
      setDraft(saved)
      setPhase('live')
    }, [draft]),

    toggleTimer: useCallback(() => {
      setLive((prev) => prev ? { ...prev, isRunning: !prev.isRunning } : prev)
    }, []),

    nextBlock: useCallback(() => {
      setLive((prev) => {
        if (!prev) return prev
        const plan = sessions.find((s) => s.status === 'live') ?? sessions[0]
        const total = plan?.blocks.length ?? 0
        if (prev.currentBlockIndex >= total - 1) return prev
        const nextIndex = prev.currentBlockIndex + 1
        const nextBlock = plan?.blocks[nextIndex]
        return {
          ...prev,
          currentBlockIndex: nextIndex,
          isRunning: false,
          secondsRemaining: (nextBlock?.durationMins ?? 10) * 60,
        }
      })
    }, [sessions]),

    prevBlock: useCallback(() => {
      setLive((prev) => {
        if (!prev || prev.currentBlockIndex === 0) return prev
        const plan = sessions.find((s) => s.status === 'live') ?? sessions[0]
        const prevIndex = prev.currentBlockIndex - 1
        const prevBlock = plan?.blocks[prevIndex]
        return {
          ...prev,
          currentBlockIndex: prevIndex,
          isRunning: false,
          secondsRemaining: (prevBlock?.durationMins ?? 10) * 60,
        }
      })
    }, [sessions]),

    toggleDrill: useCallback((drillKey: string) => {
      setLive((prev) => {
        if (!prev) return prev
        const next = new Set(prev.completedDrills)
        if (next.has(drillKey)) next.delete(drillKey)
        else next.add(drillKey)
        return { ...prev, completedDrills: next }
      })
    }, []),

    updateLiveAthleteStatus: useCallback((athleteId: string, status: string) => {
      setLive((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          statusOverrides: { ...prev.statusOverrides, [athleteId]: status },
        }
      })
    }, []),

    logIncident: useCallback((description: string) => {
      const incident: Incident = {
        id: newIncidentId(),
        timestamp: new Date().toISOString(),
        description,
        confirmed: false,
      }
      setLive((prev) => {
        if (!prev) return prev
        return { ...prev, incidents: [...prev.incidents, incident] }
      })
    }, []),

    updateLiveNotes: useCallback((notes: string) => {
      setLive((prev) => prev ? { ...prev, notes } : prev)
    }, []),

    setSidebarTab: useCallback((tab: SidebarTab) => {
      setLive((prev) => prev ? { ...prev, sidebarTab: tab } : prev)
    }, []),

    toggleSidebar: useCallback(() => {
      setLive((prev) => prev ? { ...prev, sidebarOpen: !prev.sidebarOpen } : prev)
    }, []),

    endSession: useCallback(() => {
      if (!live || !draft) return
      const plan = sessions.find((s) => s.status === 'live') ?? draft
      const totalDrills = plan.blocks.reduce((sum, b) => sum + b.drills.length, 0)
      const completedCount = live.completedDrills.size
      void totalDrills
      void completedCount
      setPostSession({
        summaryConfirmed: false,
        reflection: '',
        aiAck: '',
        aiAckLoading: false,
        rpe: 3,
        incidents: live.incidents,
        screen: 1,
      })
      setPhase('reflection')
    }, [live, draft, sessions]),

    advanceReflectionScreen: useCallback(() => {
      setPostSession((prev) => {
        if (!prev) return prev
        if (prev.screen < 4) return { ...prev, screen: (prev.screen + 1) as 1 | 2 | 3 | 4 }
        return prev
      })
    }, []),

    backReflectionScreen: useCallback(() => {
      setPostSession((prev) => {
        if (!prev) return prev
        if (prev.screen > 1) return { ...prev, screen: (prev.screen - 1) as 1 | 2 | 3 | 4 }
        return prev
      })
    }, []),

    setReflection: useCallback((text: string) => {
      setPostSession((prev) => prev ? { ...prev, reflection: text } : prev)
    }, []),

    setAiAck: useCallback((text: string, loading = false) => {
      setPostSession((prev) => prev ? { ...prev, aiAck: text, aiAckLoading: loading } : prev)
    }, []),

    setRPE: useCallback((rpe: number) => {
      setPostSession((prev) => prev ? { ...prev, rpe } : prev)
    }, []),

    confirmIncident: useCallback((id: string) => {
      setPostSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          incidents: prev.incidents.map((inc) =>
            inc.id === id ? { ...inc, confirmed: true } : inc
          ),
        }
      })
    }, []),

    dismissIncident: useCallback((id: string) => {
      setPostSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          incidents: prev.incidents.filter((inc) => inc.id !== id),
        }
      })
    }, []),

    finalizeSession: useCallback(() => {
      if (!draft || !postSession) return
      const completed: SessionPlanV2 = {
        ...draft,
        status: 'completed',
        rpe: postSession.rpe,
        coachReflection: postSession.reflection,
      }
      setSessions((prev) => prev.map((s) => (s.id === completed.id ? completed : s)))
      setDraft(null)
      setLive(null)
      setPostSession(null)
      setPhase('list')
    }, [draft, postSession]),

    cancelBuilder: useCallback(() => {
      setDraft(null)
      setSelectedBlockId(null)
      setPhase('list')
    }, []),
  }

  // Compute block start times for the draft
  const blockStartTimes = (() => {
    if (!draft) return {}
    const result: Record<string, string> = {}
    let [h, m] = draft.startTime.split(':').map(Number)
    for (const block of draft.blocks) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      result[block.id] = `${hh}:${mm}`
      m += block.durationMins
      while (m >= 60) { m -= 60; h++ }
    }
    return result
  })()

  const totalDraftMins = draft?.blocks.reduce((sum, b) => sum + b.durationMins, 0) ?? 0

  const currentLivePlan = live !== null
    ? (sessions.find((s) => s.status === 'live') ?? draft ?? null)
    : null

  const currentLiveBlock =
    currentLivePlan && live !== null
      ? currentLivePlan.blocks[live.currentBlockIndex] ?? null
      : null

  return {
    phase,
    sessions,
    draft,
    selectedBlockId,
    live,
    postSession,
    blockStartTimes,
    totalDraftMins,
    currentLivePlan,
    currentLiveBlock,
    actions,
  }
}
