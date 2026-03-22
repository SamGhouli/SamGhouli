'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { ReadinessRing } from '@/components/athlete/ReadinessRing'
import { cn } from '@/lib/utils'

const MOODS = [
  { emoji: '😔', label: 'Rough', value: 1 },
  { emoji: '😕', label: 'Low', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😊', label: 'Great', value: 5 },
]

interface CheckinResult {
  mental_score: number
  combined_score: number
}

interface WellnessCheckinProps {
  alreadyCheckedIn?: boolean
  todayResult?: CheckinResult | null
}

function SliderInput({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  lowLabel?: string
  highLabel?: string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-primary">{label}</label>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: value >= 7 ? '#4ade80' : value >= 4 ? '#fbbf24' : '#fb7185' }}
        >
          {value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #d4ff5c ${pct}%, #1e2334 ${pct}%)`,
          }}
        />
      </div>
      {(lowLabel || highLabel) && (
        <div className="flex justify-between">
          <span className="text-[11px] text-text-faint">{lowLabel}</span>
          <span className="text-[11px] text-text-faint">{highLabel}</span>
        </div>
      )}
    </div>
  )
}

export function WellnessCheckin({ alreadyCheckedIn = false, todayResult = null }: WellnessCheckinProps) {
  const [step, setStep] = useState(alreadyCheckedIn ? 5 : 1)
  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState(5)
  const [stress, setStress] = useState(5)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CheckinResult | null>(todayResult)

  const totalSteps = 4

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/athlete/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_score: mood,
          energy_level: energy,
          stress_level: stress,
          notes,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        // Demo fallback: calculate approximate scores
        const mentalScore = Math.round(
          ((mood ?? 3) / 5) * 40 + (energy / 10) * 30 + ((10 - stress) / 10) * 30
        )
        setResult({ mental_score: mentalScore, combined_score: Math.round((mentalScore + 82) / 2) })
      }
    } catch {
      const mentalScore = Math.round(
        ((mood ?? 3) / 5) * 40 + (energy / 10) * 30 + ((10 - stress) / 10) * 30
      )
      setResult({ mental_score: mentalScore, combined_score: Math.round((mentalScore + 82) / 2) })
    } finally {
      setSubmitting(false)
      setStep(5)
    }
  }

  // Completion screen
  if (step === 5) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6 animate-in fade-in duration-500">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
          <CheckCircle2 className="h-8 w-8 text-green" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-1">
            {alreadyCheckedIn ? "Today's Check-In" : 'Check-in Complete!'}
          </h2>
          <p className="text-sm text-text-muted">
            {alreadyCheckedIn
              ? "You've already checked in today. Here's how you're doing:"
              : "Great work. Your scores have been updated."}
          </p>
        </div>

        {result && (
          <>
            <ReadinessRing score={result.combined_score} size={160} />
            <div className="flex gap-4 w-full max-w-[280px]">
              <div className="flex-1 rounded-xl bg-surface-2 border border-border-1 p-4 text-center">
                <p className="text-[11px] text-text-muted mb-1">Mental</p>
                <p className="text-2xl font-bold" style={{ color: '#60a5fa' }}>
                  {result.mental_score}
                </p>
              </div>
              <div className="flex-1 rounded-xl bg-surface-2 border border-border-1 p-4 text-center">
                <p className="text-[11px] text-text-muted mb-1">Combined</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color:
                      result.combined_score >= 75
                        ? '#4ade80'
                        : result.combined_score >= 55
                        ? '#fbbf24'
                        : '#fb7185',
                  }}
                >
                  {result.combined_score}
                </p>
              </div>
            </div>
          </>
        )}

        <p className="text-xs text-text-faint max-w-[260px]">
          Your check-in is private. Coaches only see your availability status.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-text-muted">Step {step} of {totalSteps}</p>
          <p className="text-xs text-text-muted">{Math.round((step / totalSteps) * 100)}%</p>
        </div>
        <div className="h-1 rounded-full bg-surface-3">
          <div
            className="h-1 rounded-full bg-lime transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Mood */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">How are you feeling?</h2>
            <p className="text-sm text-text-muted">Select the emoji that best matches your mood right now.</p>
          </div>
          <div className="flex justify-between gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 rounded-xl py-4 border-2 transition-all duration-200',
                  mood === m.value
                    ? 'border-lime bg-lime/10'
                    : 'border-border-1 bg-surface-2 active:bg-surface-3'
                )}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-text-muted font-medium">{m.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={mood === null}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg disabled:opacity-40 transition-opacity min-h-[48px]"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Energy */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Energy level</h2>
            <p className="text-sm text-text-muted">How energised do you feel right now?</p>
          </div>
          <SliderInput
            label="Energy"
            value={energy}
            onChange={setEnergy}
            lowLabel="Exhausted"
            highLabel="Explosive"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-1 rounded-xl border border-border-1 bg-surface-2 px-4 py-3.5 text-sm text-text-muted min-h-[48px]"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg min-h-[48px]"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Stress */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Stress level</h2>
            <p className="text-sm text-text-muted">How stressed are you feeling? (1 = calm, 10 = very stressed)</p>
          </div>
          <SliderInput
            label="Stress"
            value={stress}
            onChange={setStress}
            lowLabel="Very calm"
            highLabel="Very stressed"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-1 rounded-xl border border-border-1 bg-surface-2 px-4 py-3.5 text-sm text-text-muted min-h-[48px]"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg min-h-[48px]"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Notes */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Anything else?</h2>
            <p className="text-sm text-text-muted">Optional — this is completely private and never shared.</p>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? This is private and never shared."
            rows={5}
            className="w-full rounded-xl bg-surface-2 border border-border-1 p-4 text-sm text-text-primary placeholder:text-text-faint resize-none focus:outline-none focus:border-border-2 transition-colors"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex items-center justify-center gap-1 rounded-xl border border-border-1 bg-surface-2 px-4 py-3.5 text-sm text-text-muted min-h-[48px]"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg disabled:opacity-60 min-h-[48px]"
            >
              {submitting ? (
                <span className="h-4 w-4 rounded-full border-2 border-bg border-t-transparent animate-spin" />
              ) : (
                <>Submit Check-in <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-text-faint">
            Coaches see only your availability — never your scores or notes.
          </p>
        </div>
      )}
    </div>
  )
}
