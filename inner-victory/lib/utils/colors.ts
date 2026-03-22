/**
 * Returns a Tailwind color class name for a given readiness score.
 *
 * Thresholds:
 *   >= 75 → green  (optimal)
 *   55–74 → amber  (moderate)
 *   < 55  → rose   (low)
 */
export function getScoreColor(score: number): string {
  if (score >= 75) return "green";
  if (score >= 55) return "amber";
  return "rose";
}

/**
 * Returns a CSS hex/color value for a given score, suitable for inline styles.
 */
export function getScoreColorHex(score: number): string {
  if (score >= 75) return "#4ade80";
  if (score >= 55) return "#fbbf24";
  return "#fb7185";
}

/**
 * Returns a human-readable label for a given readiness score.
 *
 * Thresholds:
 *   >= 75 → "Optimal"
 *   55–74 → "Moderate"
 *   < 55  → "Low"
 */
export function getScoreLabel(score: number): string {
  if (score >= 75) return "Optimal";
  if (score >= 55) return "Moderate";
  return "Low";
}

/**
 * Returns Tailwind CSS class strings for text color based on score.
 */
export function getScoreTextClass(score: number): string {
  if (score >= 75) return "text-green";
  if (score >= 55) return "text-amber";
  return "text-rose";
}

/**
 * Returns Tailwind CSS class strings for background (dim variant) based on score.
 */
export function getScoreBgClass(score: number): string {
  if (score >= 75) return "bg-green-dim";
  if (score >= 55) return "bg-amber-dim";
  return "bg-rose-dim";
}
