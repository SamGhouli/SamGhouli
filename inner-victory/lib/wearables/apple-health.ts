// Apple HealthKit — web bridge stub
// In production, this uses a native iOS companion app or Shortcuts
// to export HealthKit data to the web app via a secure API endpoint

export interface AppleHealthData {
  date: string
  heartRateVariability: number // ms RMSSD
  restingHeartRate: number
  sleepHours: number
  sleepQuality: number // 0-100 derived from stages
  activeEnergyBurned: number
  steps: number
  vo2Max?: number
}

export async function getAppleHealthData(_athleteId: string, _date: string): Promise<AppleHealthData | null> {
  // Apple HealthKit cannot be queried directly from a web browser
  // Data must be pushed from the native iOS app via our API endpoint
  // POST /api/athlete/health-sync with signed JWT
  console.warn('Apple Health data must be synced from the iOS app')
  return null
}

export function isAppleHealthSupported(): boolean {
  if (typeof window === 'undefined') return false
  // Check if running on iOS Safari (PWA mode)
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}
