// Database row types — exact column names from Supabase schema

export type DoctorRow = {
  id: string
  full_name: string
  slug: string
  title: string | null
  nmc_number: string | null
  short_bio: string | null
  full_bio: string | null
  profile_image_url: string | null
  is_active: boolean
  sort_order: number
  qualification: string | null
  short_name: string | null
  doctor_type: 'lead' | 'specialist'
  is_bookable: boolean
  specializations: string[]
  languages: string[]
  experience_text: string | null
  education: string | null
  color_hex: string | null
  initials: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}


export type TestimonialRow = {
  id: string
  patient_name: string
  patient_initials: string | null
  rating: number
  review_text: string
  treatment_type: string | null
  source: 'manual' | 'google' | 'facebook'
  source_url: string | null
  is_featured: boolean
  sort_order: number
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type FaqRow = {
  id: string
  question: string
  answer: string
  category: string | null
  sort_order: number
  is_visible: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type HomepageSectionRow = {
  id: string
  section_key: string
  is_visible: boolean
  sort_order: number
  custom_heading: string | null
  custom_subheading: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type ServiceItemRow = {
  id: string
  category_id: string
  name: string
  description: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type ServiceCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  long_description: string | null
  icon_name: string | null
  icon_svg: string | null
  sort_order: number
  is_visible: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type BlogPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  author_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  read_time_minutes: number | null
  is_featured: boolean
  sort_order: number
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type BlogCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type DoctorAvailabilityRow = {
  id: string
  doctor_id: string
  day_of_week: number
  is_available: boolean
  start_time: string | null
  end_time: string | null
  slot_duration_minutes: number
  max_appointments_per_day: number | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type BlockedDateRow = {
  id: string
  doctor_id: string
  blocked_date: string
  reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type MedicalHistoryRow = {
  id: string
  session_id: string
  patient_name: string
  patient_age: string | null
  patient_gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  patient_phone: string | null
  patient_email: string | null
  chief_complaint: string | null
  medical_conditions: string[]
  allergies: string[]
  current_medications: string | null
  last_dental_visit: string | null
  previous_treatments: string | null
  dental_anxiety_level: 'none' | 'mild' | 'moderate' | 'severe' | null
  appointment_id: string | null
  status: 'pending' | 'reviewed' | 'attached'
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type RoleName = 'super_admin' | 'admin'

export type RoleRow = {
  id: string
  name: RoleName
  description: string | null
  created_at: string
  updated_at: string
}

export type AdminUserRow = {
  id: string
  email: string
  full_name: string
  phone_number: string | null
  role_id: string
  is_active: boolean
  invited_by: string | null
  created_by: string | null
  updated_by: string | null
  last_sign_in_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type AdminUserWithRole = AdminUserRow & { role: RoleName }

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'reset_password' | 'disable' | 'enable'

export type AuditLogRow = {
  id: string
  actor_id: string | null
  action: AuditAction
  resource: string
  resource_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  success: boolean
  created_at: string
}

export type AuditLogWithActor = AuditLogRow & {
  actor_name: string | null
  actor_email: string | null
  actor_role: RoleName | null
}

export type MediaLibraryRow = {
  id: string
  bucket: string
  file_path: string
  file_name: string
  file_size: number | null
  mime_type: string | null
  alt_text: string | null
  caption: string | null
  width: number | null
  height: number | null
  folder: string | null
  tags: string[]
  is_deleted: boolean
  uploaded_by: string | null
  created_at: string
  updated_at: string
  usage_count: number
}

export type ContentBlockRow = {
  id: string
  key: string
  value: string
  content_type: 'text' | 'richtext'
  page: string | null
  section: string | null
  description: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

// Generic row shape for the six site-content resources (trust_indicators,
// why_choose_reasons, patient_journey_steps, before_after_cases,
// certifications, team_members) — each has its own extra fields beyond
// this common shape, accessed dynamically via the resource's field config.
export type SiteContentRow = {
  id: string
  sort_order: number
  is_visible: boolean
  [key: string]: unknown
}
