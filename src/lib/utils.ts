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
