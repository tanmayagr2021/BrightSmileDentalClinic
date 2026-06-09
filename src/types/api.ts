export type ApiResponse<T = null> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface AppointmentFormInput {
  patient_name: string
  patient_phone: string
  patient_email: string
  doctor_id: string
  service_id?: string
  appointment_date: string
  appointment_time: string
  notes?: string
  honeypot?: string
  form_loaded_at: number
}

export interface ContactFormInput {
  name: string
  email: string
  phone?: string
  message: string
  honeypot?: string
  form_loaded_at: number
}
