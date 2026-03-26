import Anthropic from '@anthropic-ai/sdk'
import type { Alert } from '@/types/database'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface CoachInsightContext {
  teamReadiness: number
  physicalScore: number
  mentalAggregateScore: number
  sleepScore: number
  trainingLoad: number
  activeAlerts: Alert[]
  daysUntilNextMatch: number
  recentActivity: { type: string; description: string }[]
}

interface AthleteInsightContext {
  combinedScore: number
  physicalScore: number
  mentalScore: number
  sleepScore: number
  hrv: number
  hrvBaseline: number
  sleepHours: number
  trainingLoad: number
}

export async function generateCoachingInsight(context: CoachInsightContext): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `You are a sports science advisor for a collegiate soccer coaching staff.
Generate a single, direct, actionable insight (2-3 sentences max) for today's training session
based on the team data provided. Focus on what the coach should DO today.
Never reference individual athlete mental health data.
Use plain language — coaches, not scientists.`,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(context),
        },
      ],
    })
    const block = response.content[0]
    if (block.type === 'text') return block.text
    return getFallbackCoachInsight(context)
  } catch {
    return getFallbackCoachInsight(context)
  }
}

export async function generateAthleteInsight(context: AthleteInsightContext): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: `You are a personal sports performance advisor. Generate a single,
personalised daily insight (1-2 sentences max) for an athlete based on their readiness data.
Be direct and encouraging. Focus on today's training approach.`,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(context),
        },
      ],
    })
    const block = response.content[0]
    if (block.type === 'text') return block.text
    return getFallbackAthleteInsight(context)
  } catch {
    return getFallbackAthleteInsight(context)
  }
}

function getFallbackCoachInsight(context: CoachInsightContext): string {
  if (context.teamReadiness >= 75) {
    return `Team readiness is strong at ${context.teamReadiness}. Good day to push intensity — focus on tactical work and set pieces. Monitor training load closely heading into match week.`
  } else if (context.teamReadiness >= 55) {
    return `Team readiness is moderate at ${context.teamReadiness}. Consider a technical session with moderate intensity. ${context.activeAlerts.length > 0 ? 'Several alerts need your attention before training.' : ''}`
  } else {
    return `Team readiness is low at ${context.teamReadiness}. Prioritise recovery work today — foam rolling, mobility, and light technical drills. Avoid high-intensity sessions.`
  }
}

function getFallbackAthleteInsight(context: AthleteInsightContext): string {
  if (context.hrv > context.hrvBaseline * 1.05) {
    return 'Your HRV is above your baseline — your body is primed and ready. Good day to push hard in training.'
  } else if (context.hrv < context.hrvBaseline * 0.9) {
    return 'Your HRV is below baseline. Focus on quality over quantity today and make sure you\'re staying hydrated.'
  } else {
    return `Your readiness score is ${context.combinedScore} today. Stay consistent with your effort and listen to your body during training.`
  }
}

// ---------------------------------------------------------------------------
// Session insight (pre-session)
// ---------------------------------------------------------------------------

interface SessionInsightContext {
  sessionType: string
  daysToNextMatch: number
  blocks: { type: string; intensity: string; durationMins: number }[]
  limitedAthletes?: string[]
  weeklyLoadVsBaseline?: string
}

export async function generateSessionInsight(context: SessionInsightContext): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `You are a sports science advisor for a collegiate soccer coaching staff.
Generate a single, direct, actionable pre-session insight (2-4 sentences max) for the assistant coach
building this session plan. Reference session type, days to next match, intensity profile, and availability.
Never generic — be specific to the data. Plain English, no jargon. Under 150 words.
If limited athletes are mentioned, include their names and a specific suggestion.`,
      messages: [{ role: 'user', content: JSON.stringify(context) }],
    })
    const block = response.content[0]
    if (block.type === 'text') return block.text
    return getFallbackSessionInsight(context)
  } catch {
    return getFallbackSessionInsight(context)
  }
}

function getFallbackSessionInsight(context: SessionInsightContext): string {
  const highBlocks = context.blocks.filter((b) => b.intensity === 'high').length
  if (context.daysToNextMatch <= 2) {
    return `Match in ${context.daysToNextMatch} day${context.daysToNextMatch === 1 ? '' : 's'} — keep intensity low and focus on shape and set pieces. Avoid anything that could risk muscle strain.`
  }
  if (highBlocks > 0 && (context.limitedAthletes?.length ?? 0) > 0) {
    return `You have ${context.limitedAthletes?.length} athlete${(context.limitedAthletes?.length ?? 0) > 1 ? 's' : ''} on limited availability and ${highBlocks} high-intensity block${highBlocks > 1 ? 's' : ''} planned. Consider modified loads or substitution scenarios for the high-intensity work.`
  }
  return `${context.sessionType.replace('-', ' ')} session with ${context.blocks.length} blocks totalling ${context.blocks.reduce((s, b) => s + b.durationMins, 0)} minutes. Intensity profile looks appropriate for ${context.daysToNextMatch} days to your next match.`
}

// ---------------------------------------------------------------------------
// Monday Morning Preview
// ---------------------------------------------------------------------------

interface MondayPreviewContext {
  teamName: string
  daysToNextMatch: number
  nextMatchOpponent: string
  lastMatchResult?: string
  lastWeekLoad: string
  baselineLoad: string
  fullCount: number
  limitedCount: number
  outCount: number
  flaggedAthletes: { name: string; reason: string; flag: string }[]
  upcomingSessionTypes: string[]
  injuryPatterns?: string
}

export async function generateMondayPreview(context: MondayPreviewContext): Promise<{
  context: string
  recommendation: string
  watchList: { name: string; flag: string; action: string }[]
}> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are a sports scientist briefing the head coach at the start of the training week.
Generate a Monday morning preview structured as JSON with three keys:
- "context": 3-5 sentence paragraph covering days since last match, days to next match, load vs baseline, availability picture, and any notable patterns.
- "recommendation": 2-3 sentences — ONE specific, actionable recommendation for structuring this week. Name specific days, athletes, and session types. Never generic.
- "watchList": array of up to 3 objects each with "name" (athlete name), "flag" (reason: Accumulated Load / Return From Injury / Declining Availability Trend), and "action" (1 sentence suggested action).
Use plain English. Reference athletes by name. Under 200 words per section. Return valid JSON only.`,
      messages: [{ role: 'user', content: JSON.stringify(context) }],
    })
    const block = response.content[0]
    if (block.type === 'text') {
      try {
        // Strip markdown code blocks if present
        const cleaned = block.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(cleaned)
      } catch {
        return getFallbackMondayPreview(context)
      }
    }
    return getFallbackMondayPreview(context)
  } catch {
    return getFallbackMondayPreview(context)
  }
}

function getFallbackMondayPreview(context: MondayPreviewContext): {
  context: string
  recommendation: string
  watchList: { name: string; flag: string; action: string }[]
} {
  return {
    context: `You have ${context.daysToNextMatch} days until your next match against ${context.nextMatchOpponent}. Squad availability: ${context.fullCount} full, ${context.limitedCount} limited, ${context.outCount} out. Last week's load was ${context.lastWeekLoad} versus a baseline of ${context.baselineLoad}.`,
    recommendation: context.daysToNextMatch <= 4
      ? `With your match approaching in ${context.daysToNextMatch} days, prioritise a tactical session early in the week and taper intensity by Thursday. Protect any athletes currently on limited availability.`
      : `You have a comfortable window before your next match. Consider one high-intensity block mid-week while the match is at a safe distance. Ensure all limited athletes are reviewed before any contact sessions.`,
    watchList: context.flaggedAthletes.slice(0, 3).map((a) => ({
      name: a.name,
      flag: a.flag,
      action: `Review ${a.name}'s status before the next high-intensity session.`,
    })),
  }
}

// ---------------------------------------------------------------------------
// Post-Session Acknowledgement
// ---------------------------------------------------------------------------

interface PostSessionAckContext {
  reflection: string
  sessionType: string
  sessionTitle: string
  recentReflectionThemes?: string
}

export async function generatePostSessionAck(context: PostSessionAckContext): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: `You are an AI coaching assistant responding to a head coach's post-session reflection.
Generate a 1-2 sentence response that:
1. Specifically references the literal content of what the coach wrote (show you read it)
2. Optionally adds a brief pattern note if relevant (introduce with "I've noticed over the past X sessions that...")
3. Ends with a brief forward-looking observation or question.
Never generic. Reference specific words the coach used. Plain English. Under 80 words.`,
      messages: [{ role: 'user', content: JSON.stringify(context) }],
    })
    const block = response.content[0]
    if (block.type === 'text') return block.text
    return getFallbackPostSessionAck(context)
  } catch {
    return getFallbackPostSessionAck(context)
  }
}

function getFallbackPostSessionAck(context: PostSessionAckContext): string {
  const firstFew = context.reflection.split(' ').slice(0, 8).join(' ')
  return `Noted — "${firstFew}…". I'll carry this context into your next session's insight.`
}

// ---------------------------------------------------------------------------
// Pre-Match Brief
// ---------------------------------------------------------------------------

interface PreMatchBriefContext {
  opponent: string
  matchDate: string
  daysUntilMatch: number
  availabilitySnapshot: { full: number; limited: number; out: number }
  loadConcerns: { name: string; percentAbove: number }[]
  rtpAthletes: { name: string; stage: number; cleared: string }[]
  reflectionPatterns?: string
  tacticalNotes?: string
}

export async function generatePreMatchBrief(context: PreMatchBriefContext): Promise<{
  squadAvailability: string
  loadConcerns: string
  rtpStatus: string
  sessionContext: string
  tacticalNote: string
}> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: `You are a sports scientist producing a pre-match brief for the head coach.
Generate a pre-match brief as JSON with five keys:
- "squadAvailability": 2-3 sentences on who is available, limited, or out — name specific athletes for limited/out.
- "loadConcerns": 1-3 sentences on any athletes above their load baseline (only if data exists — empty string if none).
- "rtpStatus": 1-2 sentences on any return-to-play athletes — what they are cleared for and a selection recommendation (empty string if none).
- "sessionContext": 1-2 sentences referencing any patterns from session reflection logs relevant to this match (empty string if no patterns).
- "tacticalNote": 1-2 sentences incorporating any staff tactical notes (empty string if none).
Plain English. Reference athletes by name. Return valid JSON only.`,
      messages: [{ role: 'user', content: JSON.stringify(context) }],
    })
    const block = response.content[0]
    if (block.type === 'text') {
      try {
        const cleaned = block.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(cleaned)
      } catch {
        return getFallbackPreMatchBrief(context)
      }
    }
    return getFallbackPreMatchBrief(context)
  } catch {
    return getFallbackPreMatchBrief(context)
  }
}

function getFallbackPreMatchBrief(context: PreMatchBriefContext): {
  squadAvailability: string
  loadConcerns: string
  rtpStatus: string
  sessionContext: string
  tacticalNote: string
} {
  return {
    squadAvailability: `${context.availabilitySnapshot.full} athletes are fully available for selection. ${context.availabilitySnapshot.limited} are on limited availability and ${context.availabilitySnapshot.out} are out.`,
    loadConcerns: context.loadConcerns.length > 0
      ? context.loadConcerns.map((a) => `${a.name} is ${a.percentAbove}% above their load baseline this week.`).join(' ')
      : '',
    rtpStatus: context.rtpAthletes.length > 0
      ? context.rtpAthletes.map((a) => `${a.name} is in Stage ${a.stage} of return-to-play — cleared for ${a.cleared}.`).join(' ')
      : '',
    sessionContext: context.reflectionPatterns ?? '',
    tacticalNote: context.tacticalNotes ?? '',
  }
}
