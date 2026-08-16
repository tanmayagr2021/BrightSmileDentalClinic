/**
 * Converts a string to a URL-safe slug.
 * e.g. "Dental Implants" → "dental-implants"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Formats a Date or ISO string to a readable date.
 * e.g. "2026-06-09" → "9 June 2026"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formats a time string (HH:MM:SS) to 12-hour format.
 * e.g. "14:30:00" → "2:30 PM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Returns the clinic's local calendar date (Asia/Kathmandu, UTC+5:45) as
 * YYYY-MM-DD, for a given instant (defaults to now).
 *
 * Do not use `date.toISOString().split('T')[0]` for "today"/"tomorrow" —
 * that converts to UTC first, which silently shifts the date by a day for
 * roughly 6 hours of every Nepal day (the clinic's server and patients are
 * both in Nepal, but a UTC-based server clock disagrees with them near
 * midnight). This uses the same wall-clock calendar date the clinic and its
 * patients actually see.
 */
export function clinicDateStr(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

/**
 * Constructs a Supabase Storage public URL.
 * All storage paths are stored in the DB; URLs are constructed at render time.
 */
export function storageUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base || !path) return ''
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Merges class names, filtering out falsy values.
 * For complex Tailwind class merging, consider adding tailwind-merge.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
