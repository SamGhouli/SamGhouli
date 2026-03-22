'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { TherapistCard } from '@/components/athlete/TherapistCard'
import { cn } from '@/lib/utils'

// Mock therapist data
const MOCK_THERAPISTS = [
  {
    id: 't1',
    name: 'Dr. Yael Rosen',
    bio: 'Sport psychologist specialising in athlete mental performance, competition anxiety and return-to-play psychological readiness. 12+ years working with university and professional athletes.',
    specialisations: ['Performance anxiety', 'Competition prep', 'Injury return', 'Confidence'],
    avatarColor: '#a78bfa',
    bookingUrl: '',
  },
  {
    id: 't2',
    name: 'Marcus Webb, MSc',
    bio: 'Registered therapist with deep experience in stress management, team dynamics and career transition support for student-athletes balancing academic and sporting pressures.',
    specialisations: ['Team stress', 'Academic pressure', 'Career transition', 'General wellbeing'],
    avatarColor: '#60a5fa',
    bookingUrl: '',
  },
  {
    id: 't3',
    name: 'Dr. Fatima Al-Hassan',
    bio: 'Counselling psychologist focused on holistic athlete wellbeing. Expertise in burnout prevention, identity and wellbeing for multi-sport athletes transitioning between levels.',
    specialisations: ['Burnout', 'Identity', 'Career transition', 'General wellbeing'],
    avatarColor: '#4ade80',
    bookingUrl: '',
  },
]

const TOPICS = [
  'Performance anxiety',
  'Injury return',
  'Team stress',
  'General wellbeing',
  'Career transition',
  'Burnout',
  'Academic pressure',
  'Confidence',
]

// Demo: already matched
const DEMO_MATCHED = false // set to true to show matched state

type Step = 'matched' | 'topics' | 'choose' | 'confirm'

function getRelevantTherapists(topics: string[]) {
  if (!topics.length) return MOCK_THERAPISTS.slice(0, 3)
  return MOCK_THERAPISTS.filter((t) =>
    t.specialisations.some((s) =>
      topics.some((topic) => s.toLowerCase().includes(topic.toLowerCase()))
    )
  ).slice(0, 3)
}

export default function SupportPage() {
  const [step, setStep] = useState<Step>(DEMO_MATCHED ? 'matched' : 'topics')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [chosenId, setChosenId] = useState<string | null>(null)
  const [matchedId, setMatchedId] = useState<string | null>(null)

  const candidates = getRelevantTherapists(selectedTopics)
  const matchedTherapist = MOCK_THERAPISTS.find((t) => t.id === (matchedId ?? 't1'))

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  function confirmMatch() {
    setMatchedId(chosenId)
    setStep('matched')
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Your Support</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Confidential access to sport psychology support
        </p>
      </div>

      {/* Matched state */}
      {step === 'matched' && matchedTherapist && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Your therapist</p>
          <TherapistCard
            name={matchedTherapist.name}
            bio={matchedTherapist.bio}
            specialisations={matchedTherapist.specialisations}
            avatarColor={matchedTherapist.avatarColor}
            isMatched={true}
          />
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4 text-center space-y-2">
            <p className="text-xs text-text-muted">
              Next available session: <span className="text-text-primary font-medium">Wednesday 25 March, 2:00 PM</span>
            </p>
            <button
              onClick={() => setStep('topics')}
              className="text-xs text-text-muted underline"
            >
              Find a different therapist
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Topics */}
      {step === 'topics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">What are you looking for?</h2>
            <p className="text-sm text-text-muted">Select all that apply — this helps us match you with the right support.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => {
              const selected = selectedTopics.includes(topic)
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
                    selected
                      ? 'border-lime bg-lime/10 text-lime'
                      : 'border-border-1 bg-surface-2 text-text-muted'
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                  {topic}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setStep('choose')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg min-h-[48px]"
          >
            See matches <ChevronRight className="h-4 w-4" />
          </button>
          <p className="text-center text-xs text-text-faint">
            This information is confidential and not shared with your coaching staff.
          </p>
        </div>
      )}

      {/* Step 2: Choose */}
      {step === 'choose' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('topics')}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-border-1 bg-surface-2"
            >
              <ChevronLeft className="h-4 w-4 text-text-muted" />
            </button>
            <div>
              <h2 className="text-base font-bold text-text-primary">Your matches</h2>
              <p className="text-xs text-text-muted">Tap a card then confirm your choice</p>
            </div>
          </div>
          <div className="space-y-3">
            {candidates.map((t) => (
              <div
                key={t.id}
                onClick={() => setChosenId(t.id)}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  chosenId === t.id ? 'ring-2 ring-lime rounded-xl' : ''
                )}
              >
                <TherapistCard
                  name={t.name}
                  bio={t.bio}
                  specialisations={t.specialisations}
                  avatarColor={t.avatarColor}
                  isMatched={false}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => chosenId && setStep('confirm')}
            disabled={!chosenId}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg disabled:opacity-40 min-h-[48px]"
          >
            Continue with selected <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('choose')}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-border-1 bg-surface-2"
            >
              <ChevronLeft className="h-4 w-4 text-text-muted" />
            </button>
            <h2 className="text-base font-bold text-text-primary">Confirm your match</h2>
          </div>
          {chosenId && (() => {
            const t = MOCK_THERAPISTS.find((x) => x.id === chosenId)!
            return (
              <TherapistCard
                name={t.name}
                bio={t.bio}
                specialisations={t.specialisations}
                avatarColor={t.avatarColor}
                isMatched={false}
              />
            )
          })()}
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4 space-y-2">
            <p className="text-sm text-text-primary font-semibold">What happens next?</p>
            <ul className="space-y-1.5 text-sm text-text-muted list-disc list-inside">
              <li>You&apos;ll receive a confirmation email within 24 hours</li>
              <li>Your therapist will reach out to schedule a first session</li>
              <li>All sessions are completely confidential</li>
            </ul>
          </div>
          <button
            onClick={confirmMatch}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-bg min-h-[48px]"
          >
            <Check className="h-4 w-4" /> Confirm match
          </button>
        </div>
      )}
    </div>
  )
}
