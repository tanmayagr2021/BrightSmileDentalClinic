// Static allowlist for the six site-content tables introduced in the CMS
// foundation phase. Drives both the generic admin CRUD API routes (as a
// security boundary — resource slugs from the URL are only ever mapped
// through this table, never used to build a dynamic query directly) and
// the generic SiteContentClient admin UI (field schema for rendering
// list/add/edit forms without six near-duplicate components).

export type FieldType = 'text' | 'textarea' | 'number' | 'select'

export type FieldDef = {
  key: string
  label: string
  type: FieldType
  options?: string[]
  required?: boolean
}

export type ResourceConfig = {
  table: string
  label: string
  singularLabel: string
  titleField: string
  fields: FieldDef[]
}

export const SITE_CONTENT_RESOURCE_SLUGS = [
  'trust-indicators',
  'why-choose-reasons',
  'patient-journey-steps',
  'before-after-cases',
  'certifications',
  'team-members',
] as const

export type SiteContentResourceSlug = (typeof SITE_CONTENT_RESOURCE_SLUGS)[number]

export const SITE_CONTENT_RESOURCES: Record<SiteContentResourceSlug, ResourceConfig> = {
  'trust-indicators': {
    table: 'trust_indicators',
    label: 'Trust Indicators',
    singularLabel: 'Trust Indicator',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
  },
  'why-choose-reasons': {
    table: 'why_choose_reasons',
    label: 'Why Choose Reasons',
    singularLabel: 'Reason',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
  },
  'patient-journey-steps': {
    table: 'patient_journey_steps',
    label: 'Patient Journey Steps',
    singularLabel: 'Step',
    titleField: 'title',
    fields: [
      { key: 'step', label: 'Step Number', type: 'number', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
  },
  'before-after-cases': {
    table: 'before_after_cases',
    label: 'Before & After Cases',
    singularLabel: 'Case',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['smile-makeover', 'orthodontics', 'whitening', 'implants'], required: true },
      { key: 'treatment_details', label: 'Treatment Details', type: 'text', required: true },
      { key: 'duration', label: 'Duration', type: 'text', required: true },
    ],
  },
  certifications: {
    table: 'certifications',
    label: 'Certifications',
    singularLabel: 'Certification',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'issuer', label: 'Issuer', type: 'text', required: true },
      { key: 'year', label: 'Year', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['registration', 'award', 'certification'], required: true },
    ],
  },
  'team-members': {
    table: 'team_members',
    label: 'Team Members',
    singularLabel: 'Team Member',
    titleField: 'name',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'department', label: 'Department', type: 'select', options: ['hygienist', 'assistant', 'reception', 'admin'], required: true },
      { key: 'initials', label: 'Initials (fallback avatar)', type: 'text' },
      { key: 'color_hex', label: 'Avatar Color (hex, optional)', type: 'text' },
    ],
  },
}

export function getResourceConfig(slug: string): ResourceConfig | null {
  return (SITE_CONTENT_RESOURCES as Record<string, ResourceConfig>)[slug] ?? null
}
