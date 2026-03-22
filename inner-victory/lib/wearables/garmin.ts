// Garmin Connect API integration
// OAuth 1.0a — requires server-side signing; credentials are set via env vars:
//   GARMIN_CONSUMER_KEY, GARMIN_CONSUMER_SECRET

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

const GARMIN_REQUEST_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/request_token'
const GARMIN_ACCESS_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/access_token'
const GARMIN_AUTHORIZE_URL = 'https://connect.garmin.com/oauthConfirm'
const GARMIN_API_BASE = 'https://apis.garmin.com/wellness-api/rest'

/**
 * Build an OAuth 1.0a Authorization header for Garmin API requests.
 * Requires GARMIN_CONSUMER_KEY and GARMIN_CONSUMER_SECRET env vars.
 */
function buildOAuth1Header(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  tokenKey = '',
  tokenSecret = '',
): string {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: tokenKey,
    oauth_version: '1.0',
  }
  if (!tokenKey) delete params.oauth_token

  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')

  const base = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(sorted)].join('&')
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`

  // Note: in Node.js / Edge runtime use crypto.subtle for HMAC-SHA1
  // This is a placeholder — full signing requires the crypto module
  const signature = Buffer.from(`${base}|${signingKey}`).toString('base64') // placeholder

  const headerParams: Record<string, string> = { ...params, oauth_signature: signature }
  const headerStr = Object.keys(headerParams)
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(headerParams[k])}"`)
    .join(', ')

  return `OAuth ${headerStr}`
}

/**
 * Step 1: Get a Garmin request token.
 * Returns { oauthToken, oauthTokenSecret } to store in session before redirecting.
 */
export async function getGarminRequestToken(
  callbackUrl: string,
): Promise<{ oauthToken: string; oauthTokenSecret: string } | null> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET
  if (!consumerKey || !consumerSecret) {
    console.warn('Garmin credentials not configured (GARMIN_CONSUMER_KEY / GARMIN_CONSUMER_SECRET)')
    return null
  }

  try {
    const authHeader = buildOAuth1Header('POST', GARMIN_REQUEST_TOKEN_URL, consumerKey, consumerSecret)
    const res = await fetch(`${GARMIN_REQUEST_TOKEN_URL}?oauth_callback=${encodeURIComponent(callbackUrl)}`, {
      method: 'POST',
      headers: { Authorization: authHeader },
    })
    if (!res.ok) return null
    const body = await res.text()
    const params = Object.fromEntries(new URLSearchParams(body))
    return { oauthToken: params.oauth_token, oauthTokenSecret: params.oauth_token_secret }
  } catch {
    return null
  }
}

/**
 * Step 2: Build the Garmin authorization URL to redirect the user to.
 */
export function buildGarminAuthURL(oauthToken: string): string {
  if (!oauthToken) return '#'
  return `${GARMIN_AUTHORIZE_URL}?oauth_token=${encodeURIComponent(oauthToken)}`
}

/**
 * Step 3: Exchange the verifier for access tokens after the user returns.
 */
export async function exchangeGarminVerifier(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string,
): Promise<{ accessToken: string; accessTokenSecret: string } | null> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET
  if (!consumerKey || !consumerSecret) return null

  try {
    const authHeader = buildOAuth1Header(
      'POST',
      GARMIN_ACCESS_TOKEN_URL,
      consumerKey,
      consumerSecret,
      oauthToken,
      oauthTokenSecret,
    )
    const res = await fetch(`${GARMIN_ACCESS_TOKEN_URL}?oauth_verifier=${encodeURIComponent(oauthVerifier)}`, {
      method: 'POST',
      headers: { Authorization: authHeader },
    })
    if (!res.ok) return null
    const body = await res.text()
    const params = Object.fromEntries(new URLSearchParams(body))
    return { accessToken: params.oauth_token, accessTokenSecret: params.oauth_token_secret }
  } catch {
    return null
  }
}

/**
 * Fetch today's daily stats for the authenticated user.
 */
export async function getGarminDailyStats(
  accessToken: string,
  accessTokenSecret: string,
  date: string,
): Promise<GarminDailyStats | null> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET
  if (!consumerKey || !consumerSecret || !accessToken) return null

  const url = `${GARMIN_API_BASE}/dailies?uploadStartTimeInSeconds=${Math.floor(new Date(date).getTime() / 1000)}&uploadEndTimeInSeconds=${Math.floor(new Date(date).getTime() / 1000) + 86400}`
  try {
    const authHeader = buildOAuth1Header('GET', url, consumerKey, consumerSecret, accessToken, accessTokenSecret)
    const res = await fetch(url, { headers: { Authorization: authHeader } })
    if (!res.ok) return null
    const data = await res.json()
    return (data?.dailies?.[0] as GarminDailyStats) ?? null
  } catch {
    return null
  }
}
