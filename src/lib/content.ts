import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'

// ── content_blocks ──────────────────────────────────────────
// Generic chrome-copy store (headings, CTA labels, intros, banners).
// cache() gives request-scoped memoization — one Supabase round trip
// per render even if a dozen Server Components each call getContent().

export const getContentBlocks = cache(async (): Promise<Record<string, string>> => {
  const { data } = await createAdminClient().from('content_blocks').select('key, value')
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
})

// `fallback` is mandatory — every call site passes the current
// hardcoded string, so behavior is byte-identical if a migration
// hasn't run, a key is mistyped, or content_blocks is unreachable.
export async function getContent(key: string, fallback: string): Promise<string> {
  const map = await getContentBlocks()
  return map[key] ?? fallback
}

// Simple {token} interpolation for content_blocks values that need a
// dynamic value spliced in (e.g. a live count or a submitted name).
export function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (acc, [token, value]) => acc.replaceAll(`{${token}}`, String(value)),
    template
  )
}

// ── Media resolution ─────────────────────────────────────────

function publicMediaUrl(media: { bucket: string; file_path: string } | null): string | null {
  if (!media) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${media.bucket}/${media.file_path}`
}

// ── trust_indicators ─────────────────────────────────────────

export type TrustIndicatorRow = { id: string; title: string; description: string }

export const getTrustIndicators = cache(async (): Promise<TrustIndicatorRow[]> => {
  const { data } = await createAdminClient()
    .from('trust_indicators')
    .select('id, title, description')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
  return data ?? []
})

// ── why_choose_reasons ───────────────────────────────────────

export type WhyChooseReasonRow = { id: string; title: string; description: string }

export const getWhyChooseReasons = cache(async (): Promise<WhyChooseReasonRow[]> => {
  const { data } = await createAdminClient()
    .from('why_choose_reasons')
    .select('id, title, description')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
  return data ?? []
})

// ── patient_journey_steps ────────────────────────────────────

export type PatientJourneyStepRow = { id: string; step: number; title: string; subtitle: string; description: string }

export const getPatientJourneySteps = cache(async (): Promise<PatientJourneyStepRow[]> => {
  const { data } = await createAdminClient()
    .from('patient_journey_steps')
    .select('id, step, title, subtitle, description')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
  return data ?? []
})

// ── before_after_cases ───────────────────────────────────────

export type BeforeAfterCaseRow = {
  id: string
  title: string
  category: 'smile-makeover' | 'orthodontics' | 'whitening' | 'implants'
  treatment_details: string
  duration: string
  before_gradient: string | null
  after_gradient: string | null
  before_image_url: string | null
  after_image_url: string | null
}

export const getBeforeAfterCases = cache(async (): Promise<BeforeAfterCaseRow[]> => {
  const { data } = await createAdminClient()
    .from('before_after_cases')
    .select(
      'id, title, category, treatment_details, duration, before_gradient, after_gradient, before_media:media_library!before_media_id(bucket, file_path), after_media:media_library!after_media_id(bucket, file_path)'
    )
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  type Raw = Omit<BeforeAfterCaseRow, 'before_image_url' | 'after_image_url'> & {
    before_media: { bucket: string; file_path: string } | null
    after_media: { bucket: string; file_path: string } | null
  }

  return ((data ?? []) as unknown as Raw[]).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    treatment_details: row.treatment_details,
    duration: row.duration,
    before_gradient: row.before_gradient,
    after_gradient: row.after_gradient,
    before_image_url: publicMediaUrl(row.before_media),
    after_image_url: publicMediaUrl(row.after_media),
  }))
})

// ── certifications ────────────────────────────────────────────

export type CertificationRow = {
  id: string
  title: string
  issuer: string
  year: string
  type: 'registration' | 'award' | 'certification'
  image_url: string | null
}

export const getCertifications = cache(async (): Promise<CertificationRow[]> => {
  const { data } = await createAdminClient()
    .from('certifications')
    .select('id, title, issuer, year, type, image:media_library!image_id(bucket, file_path)')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  type Raw = Omit<CertificationRow, 'image_url'> & { image: { bucket: string; file_path: string } | null }

  return ((data ?? []) as unknown as Raw[]).map((row) => ({
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    year: row.year,
    type: row.type,
    image_url: publicMediaUrl(row.image),
  }))
})

// ── team_members ───────────────────────────────────────────────

export type TeamMemberRow = {
  id: string
  name: string
  role: string
  department: 'hygienist' | 'assistant' | 'reception' | 'admin'
  initials: string | null
  color_hex: string | null
  photo_url: string | null
}

export const getTeamMembers = cache(async (): Promise<TeamMemberRow[]> => {
  const { data } = await createAdminClient()
    .from('team_members')
    .select('id, name, role, department, initials, color_hex, photo:media_library!photo_id(bucket, file_path)')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  type Raw = Omit<TeamMemberRow, 'photo_url'> & { photo: { bucket: string; file_path: string } | null }

  return ((data ?? []) as unknown as Raw[]).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    initials: row.initials,
    color_hex: row.color_hex,
    photo_url: publicMediaUrl(row.photo),
  }))
})
