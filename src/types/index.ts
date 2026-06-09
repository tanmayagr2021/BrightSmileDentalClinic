// Re-exports all project types from a single entry point.
// Import as: import type { AppointmentStatus } from '@/types'

export type { ApiResponse, AppointmentFormInput, ContactFormInput } from './api'

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type AdminRole = 'super_admin' | 'admin'

export type ContentStatus = 'draft' | 'published' | 'archived'

export type TestimonialStatus = 'pending' | 'approved' | 'rejected'

export type LanguageCode = 'en' | 'ne'

// Must match bucket IDs in migration 011_storage_buckets.sql
export type StorageBucket =
  | 'doctor-photos'
  | 'service-images'
  | 'gallery'
  | 'blog-images'
  | 'testimonial-photos'
  | 'branding'
  | 'og-images'
  | 'documents'
  | 'misc'
