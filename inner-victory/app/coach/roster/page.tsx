'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { RosterTable } from '@/components/coach/RosterTable'
import { AthleteDetailPanel } from '@/components/coach/AthleteDetailPanel'
import { useTeamReadiness, type AthleteReadinessRow } from '@/hooks/useTeamReadiness'
import { useTeam } from '@/hooks/useTeam'
import { DEMO_DATA } from '@/lib/demo/data'

// Build demo AthleteReadinessRow array from DEMO_DATA
function buildDemoRows(): AthleteReadinessRow[] {
  return DEMO_DATA.readinessScores.map((score) => {
    const user = DEMO_DATA.athletes.find((a) => a.id === score.athlete_id)!
    const avail = DEMO_DATA.availability.find((a) => a.athlete_id === score.athlete_id)
    const academic = DEMO_DATA.academicRecords.find((r) => r.athlete_id === score.athlete_id)
    const wellness = DEMO_DATA.wellnessCheckins.find((w) => w.athlete_id === score.athlete_id)
    return {
      ...score,
      user,
      availability_status: avail?.status ?? 'full',
      availability_reason: avail?.reason ?? '',
      academic_flag: academic?.eligibility_status !== 'ok',
      mental_score: wellness?.mental_score,
    }
  })
}

export default function RosterPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteReadinessRow | null>(null)

  const { team } = useTeam()
  const liveData = useTeamReadiness(isDemo ? undefined : (team?.id ?? undefined))

  const athletes: AthleteReadinessRow[] = isDemo ? buildDemoRows() : liveData.athletes
  const loading = isDemo ? false : liveData.loading

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Roster"
        subtitle={`${athletes.length} athlete${athletes.length !== 1 ? 's' : ''}`}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <LoadingState message="Loading roster..." />
        ) : athletes.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No athletes found"
            description="Athletes will appear here once they have joined your team and submitted readiness data."
          />
        ) : (
          <>
            {selectedAthlete && (
              <AthleteDetailPanel
                athlete={selectedAthlete}
                onClose={() => setSelectedAthlete(null)}
              />
            )}
            <RosterTable
              athletes={athletes}
              onSelectAthlete={(a) =>
                setSelectedAthlete((prev) => (prev?.id === a.id ? null : a))
              }
              selectedId={selectedAthlete?.athlete_id}
            />
          </>
        )}
      </div>
    </div>
  )
}
