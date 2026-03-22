// Oura Ring API integration
// Personal Access Token flow

const OURA_BASE_URL = 'https://api.ouraring.com/v2/usercollection'

export interface OuraReadiness {
  id: string
  day: string
  score: number
  temperature_deviation: number
  temperature_trend_deviation: number
  contributors: {
    activity_balance: number
    body_temperature: number
    hrv_balance: number
    previous_day_activity: number
    previous_night: number
    recovery_index: number
    resting_heart_rate: number
    sleep_balance: number
  }
}

export interface OuraSleep {
  id: string
  day: string
  score: number
  total_sleep_duration: number // seconds
  rem_sleep_duration: number
  deep_sleep_duration: number
  light_sleep_duration: number
  average_hrv: number
  lowest_heart_rate: number
  average_heart_rate: number
  efficiency: number
  contributors: {
    deep_sleep: number
    efficiency: number
    latency: number
    rem_sleep: number
    restfulness: number
    timing: number
    total_sleep: number
  }
}

export interface OuraActivity {
  id: string
  day: string
  score: number
  active_calories: number
  total_calories: number
  steps: number
  daily_movement: number
  average_met_minutes: number
}

async function ouraFetch(endpoint: string, token: string, params?: Record<string, string>) {
  const url = new URL(`${OURA_BASE_URL}/${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return null
  return response.json()
}

export async function getOuraReadiness(token: string, date: string): Promise<OuraReadiness | null> {
  const data = await ouraFetch('daily_readiness', token, { start_date: date, end_date: date })
  return data?.data?.[0] ?? null
}

export async function getOuraSleep(token: string, date: string): Promise<OuraSleep | null> {
  const data = await ouraFetch('daily_sleep', token, { start_date: date, end_date: date })
  return data?.data?.[0] ?? null
}

export async function getOuraActivity(token: string, date: string): Promise<OuraActivity | null> {
  const data = await ouraFetch('daily_activity', token, { start_date: date, end_date: date })
  return data?.data?.[0] ?? null
}

export function buildOuraAuthURL(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.OURA_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'daily heartrate workout tag session',
    state,
  })
  return `https://cloud.ouraring.com/oauth/authorize?${params}`
}
