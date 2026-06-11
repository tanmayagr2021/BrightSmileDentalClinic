// Database row types — exact column names from Supabase schema

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

export type ServiceCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  icon_name: string | null
  sort_order: number
  is_visible: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}
