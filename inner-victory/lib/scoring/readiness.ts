/**
 * Physical readiness score based on HRV deviation and resting HR deviation,
 * weighted with a training strain penalty.
 *
 * Returns a score from 0–100.
 */
export function calculatePhysicalScore(data: {
  hrv: number;
  hrvBaseline: number;
  restingHr: number;
  restingHrBaseline: number;
  strain: number;
}): number {
  const { hrv, hrvBaseline, restingHr, restingHrBaseline, strain } = data;

  // HRV deviation: positive deviation = better recovery
  const hrvDeviation = hrvBaseline > 0 ? (hrv - hrvBaseline) / hrvBaseline : 0;
  // Clamp to [-1, 1] range, then convert to 0–100 contribution (50 = baseline)
  const hrvScore = 50 + Math.max(-50, Math.min(50, hrvDeviation * 100));

  // Resting HR deviation: lower than baseline = better recovery
  const hrDeviation =
    restingHrBaseline > 0
      ? (restingHrBaseline - restingHr) / restingHrBaseline
      : 0;
  const hrScore = 50 + Math.max(-50, Math.min(50, hrDeviation * 100));

  // Average HRV and HR scores
  const baseScore = (hrvScore + hrScore) / 2;

  // Strain penalty: strain is 0–21 scale (Whoop-style), reduce score proportionally
  const strainPenalty = Math.max(0, (strain / 21) * 20);

  const finalScore = Math.round(
    Math.max(0, Math.min(100, baseScore - strainPenalty))
  );

  return finalScore;
}

/**
 * Sleep quality score based on hours of sleep and subjective sleep quality rating.
 *
 * sleepHours: actual hours slept (target ~8h)
 * sleepQuality: subjective 1–10 scale
 *
 * Returns a score from 0–100.
 */
export function calculateSleepScore(data: {
  sleepHours: number;
  sleepQuality: number;
}): number {
  const { sleepHours, sleepQuality } = data;

  // Target sleep: 8 hours. Score based on how close to target.
  const targetHours = 8;
  const hoursRatio = Math.min(sleepHours / targetHours, 1.2); // Cap at 120%
  // Convert to 0–100: 0h = 0, 8h = 100, 9.6h+ = 100 (clamp)
  const hoursScore = Math.min(100, hoursRatio * 100);

  // Quality score: 1–10 → 0–100
  const qualityScore = Math.max(0, Math.min(100, ((sleepQuality - 1) / 9) * 100));

  // Weighted average: hours 60%, quality 40%
  const finalScore = Math.round(hoursScore * 0.6 + qualityScore * 0.4);

  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Mental readiness score based on mood, energy, and stress check-in values.
 *
 * moodScore: 1–10
 * energyLevel: 1–10
 * stressLevel: 1–10 (higher = more stressed, so inverted)
 *
 * Returns a score from 0–100.
 */
export function calculateMentalScore(checkin: {
  moodScore: number;
  energyLevel: number;
  stressLevel: number;
}): number {
  const { moodScore, energyLevel, stressLevel } = checkin;

  // Normalize each 1–10 value to 0–100
  const moodNorm = Math.max(0, Math.min(100, ((moodScore - 1) / 9) * 100));
  const energyNorm = Math.max(0, Math.min(100, ((energyLevel - 1) / 9) * 100));
  // Stress is inverted: high stress = low score
  const stressNorm = Math.max(
    0,
    Math.min(100, ((10 - stressLevel) / 9) * 100)
  );

  // Weighted average: mood 40%, energy 35%, stress 25%
  const finalScore = Math.round(
    moodNorm * 0.4 + energyNorm * 0.35 + stressNorm * 0.25
  );

  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Combined readiness score from physical, mental, and sleep sub-scores.
 *
 * Each component is 0–100. Weights:
 *   physical: 40%, sleep: 35%, mental: 25%
 *
 * Returns a score from 0–100.
 */
export function calculateCombinedScore(
  physical: number,
  mental: number,
  sleep: number
): number {
  const finalScore = Math.round(
    physical * 0.4 + sleep * 0.35 + mental * 0.25
  );

  return Math.max(0, Math.min(100, finalScore));
}
