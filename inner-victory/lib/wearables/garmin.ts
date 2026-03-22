// Garmin Connect API — stub implementation
// Full OAuth1a flow required for production

export interface GarminDailyStats {
  userProfileId: number
  totalSteps: number
  totalDistanceMeters: number
  activeKilocalories: number
  bmrKilocalories: number
  averageStressLevel: number
  maxStressLevel: number
  restingHeartRate: number
  averageMonitoringHeartRate: number
  maxHeartRate: number
  minHeartRate: number
  sleepingSeconds: number
  averageSpo2: number
  averageRespirationRate: number
}

export async function getGarminDailyStats(_token: string, _date: string): Promise<GarminDailyStats | null> {
  // TODO: Implement Garmin Connect API
  // Requires OAuth1a signing
  console.warn('Garmin integration not yet implemented')
  return null
}

export function buildGarminAuthURL(_redirectUri: string, _state: string): string {
  // TODO: Implement Garmin OAuth1a flow
  console.warn('Garmin auth not yet implemented')
  return '#'
}
