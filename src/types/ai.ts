// Bright AI — shared types for chat, medical history, and admin

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: number
  /** Parsed quick-reply options extracted from assistant response */
  quickReplies?: string[]
  /** Parsed navigation path extracted from assistant response */
  navigateTo?: string
  /** Whether this is a medical-history initiation trigger */
  isMedicalHistoryTrigger?: boolean
}

export type ChatState = 'idle' | 'streaming' | 'error'

export type PanelView = 'chat' | 'medical-history'

// ── Medical History ───────────────────────────────────────────

export type MedicalHistoryStep =
  | 'personal'
  | 'complaint'
  | 'medical'
  | 'dental'
  | 'medications'
  | 'review'

export type MedicalHistoryData = {
  patientName: string
  patientAge: string
  patientGender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | ''
  patientPhone: string
  patientEmail: string
  chiefComplaint: string
  medicalConditions: string[]
  allergies: string[]
  currentMedications: string
  lastDentalVisit: string
  previousTreatments: string
  dentalAnxietyLevel: 'none' | 'mild' | 'moderate' | 'severe' | ''
}

export const EMPTY_MEDICAL_HISTORY: MedicalHistoryData = {
  patientName: '',
  patientAge: '',
  patientGender: '',
  patientPhone: '',
  patientEmail: '',
  chiefComplaint: '',
  medicalConditions: [],
  allergies: [],
  currentMedications: '',
  lastDentalVisit: '',
  previousTreatments: '',
  dentalAnxietyLevel: '',
}

export const MEDICAL_HISTORY_STEPS: { key: MedicalHistoryStep; label: string }[] = [
  { key: 'personal', label: 'Personal' },
  { key: 'complaint', label: 'Concern' },
  { key: 'medical', label: 'Medical' },
  { key: 'dental', label: 'Dental' },
  { key: 'medications', label: 'Medications' },
  { key: 'review', label: 'Review' },
]

// ── API payloads ──────────────────────────────────────────────

export type ChatRequest = {
  messages: { role: ChatRole; content: string }[]
  sessionId: string
}

export type MedicalHistorySubmitPayload = {
  sessionId: string
  data: MedicalHistoryData
}
