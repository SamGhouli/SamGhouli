// WHOOP API integration
// OAuth2 flow → store refresh token in users table
// Scopes: read:recovery, read:sleep, read:workout, read:profile

export interface WHOOPRecovery {
  score: {
    recovery_score: number
    hrv_rmssd_milli: number
    resting_heart_rate: number
    spo2_percentage: number
    skin_temp_celsius: number
  }
  user_calibrating: boolean
}

export interface WHOOPSleep {
  score: {
    sleep_performance_percentage: number
    sleep_consistency_percentage: number
    sleep_efficiency_percentage: number
  }
  start: string
  end: string
  nap: boolean
  total_in_bed_time_milli: number
  total_awake_time_milli: number
  total_light_sleep_time_milli: number
  total_slow_wave_sleep_time_milli: number
  total_rem_sleep_time_milli: number
}

export interface WHOOPWorkout {
  score: {
    strain: number
    average_heart_rate: number
    max_heart_rate: number
    kilojoule: number
    zone_duration: { zone_zero_milli: number; zone_one_milli: number; zone_two_milli: number; zone_three_milli: number; zone_four_milli: number; zone_five_milli: number }
  }
  start: string
  end: string
  sport_id: number
}

const WHOOP_BASE_URL = 'https://api.prod.whoop.com/developer'

export async function refreshWHOOPToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const response = await fetch('https://api.prod.whoop.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })
  if (!response.ok) throw new Error('Failed to refresh WHOOP token')
  return response.json()
}

export async function getWHOOPRecovery(accessToken: string, date: string): Promise<WHOOPRecovery | null> {
  const response = await fetch(`${WHOOP_BASE_URL}/v1/recovery?start=${date}T00:00:00Z&end=${date}T23:59:59Z`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) return null
  const data = await response.json()
  return data.records?.[0] ?? null
}

export async function getWHOOPSleep(accessToken: string, date: string): Promise<WHOOPSleep | null> {
  const response = await fetch(`${WHOOP_BASE_URL}/v1/sleep?start=${date}T00:00:00Z&end=${date}T23:59:59Z`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) return null
  const data = await response.json()
  return data.records?.[0] ?? null
}

export async function getWHOOPWorkout(accessToken: string, date: string): Promise<WHOOPWorkout | null> {
  const response = await fetch(`${WHOOP_BASE_URL}/v1/workout?start=${date}T00:00:00Z&end=${date}T23:59:59Z`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) return null
  const data = await response.json()
  return data.records?.[0] ?? null
}

export function buildWHOOPAuthURL(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'offline read:recovery read:sleep read:workout read:profile',
    state,
  })
  return `https://api.prod.whoop.com/oauth/authorize?${params}`
}
