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
