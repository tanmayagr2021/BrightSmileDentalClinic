// Re-exports all project types from a single entry point.
// Import as: import type { AppointmentStatus } from '@/types'

export type { ApiResponse, AppointmentFormInput, ContactFormInput } from './api'

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type AdminRole = 'super_admin' | 'admin'

export type ContentStatus = 'draft' | 'published' | 'archived'

export type TestimonialStatus = 'pending' | 'approved' | 'rejected'

export type LanguageCode = 'en' | 'ne'

export type StorageBucket =
  | 'clinic-logo'
  | 'hero-images'
  | 'doctor-images'
  | 'service-images'
  | 'gallery-images'
  | 'blog-covers'
  | 'og-images'
