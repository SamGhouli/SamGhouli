import { format, parseISO, isValid } from "date-fns";

/**
 * Formats a date string or Date object into a human-readable string.
 * Defaults to "MMM d, yyyy" format (e.g., "Mar 21, 2026").
 */
export function formatDate(
  date: string | Date,
  formatStr: string = "MMM d, yyyy"
): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "—";
    return format(d, formatStr);
  } catch {
    return "—";
  }
}

/**
 * Formats a readiness score as a rounded integer string.
 * Returns "—" if the score is null/undefined/NaN.
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return "—";
  return Math.round(score).toString();
}

/**
 * Formats a delta (change) value with a leading + or - sign.
 * e.g., 5 → "+5", -3 → "-3", 0 → "0"
 *
 * Returns "—" if the delta is null/undefined/NaN.
 */
export function formatDelta(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || isNaN(delta)) return "—";
  const rounded = Math.round(delta);
  if (rounded > 0) return `+${rounded}`;
  return `${rounded}`;
}

/**
 * Formats a short date (e.g., "Mar 21").
 */
export function formatShortDate(date: string | Date): string {
  return formatDate(date, "MMM d");
}

/**
 * Formats a time (e.g., "2:30 PM").
 */
export function formatTime(date: string | Date): string {
  return formatDate(date, "h:mm a");
}

/**
 * Formats a date and time together (e.g., "Mar 21, 2:30 PM").
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, "MMM d, h:mm a");
}

/**
 * Formats a relative weekday label (e.g., "Today", "Yesterday", or "Mon").
 */
export function formatDayLabel(date: string | Date): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "—";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffMs = today.getTime() - target.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return format(d, "EEE");
  } catch {
    return "—";
  }
}
