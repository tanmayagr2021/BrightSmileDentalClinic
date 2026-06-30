import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const Schema = z.object({
  sessionId: z.string().min(1).max(64),
  data: z.object({
    patientName: z.string().min(2).max(100),
    patientAge: z.string().max(10).optional(),
    patientGender: z.enum(['male', 'female', 'other', 'prefer_not_to_say', '']).optional(),
    patientPhone: z.string().max(20).optional(),
    patientEmail: z.string().email().optional().or(z.literal('')),
    chiefComplaint: z.string().max(1000).optional(),
    medicalConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    currentMedications: z.string().max(500).optional(),
    lastDentalVisit: z.string().max(100).optional(),
    previousTreatments: z.string().max(500).optional(),
    dentalAnxietyLevel: z.enum(['none', 'mild', 'moderate', 'severe', '']).optional(),
  }),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { success } = await rateLimit(`mh:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const { sessionId, data } = parsed.data

  const supabase = createAdminClient()

  const { data: row, error } = await supabase
    .from('medical_histories')
    .insert({
      session_id: sessionId,
      patient_name: data.patientName,
      patient_age: data.patientAge || null,
      patient_gender: data.patientGender || null,
      patient_phone: data.patientPhone || null,
      patient_email: data.patientEmail || null,
      chief_complaint: data.chiefComplaint || null,
      medical_conditions: data.medicalConditions ?? [],
      allergies: data.allergies ?? [],
      current_medications: data.currentMedications || null,
      last_dental_visit: data.lastDentalVisit || null,
      previous_treatments: data.previousTreatments || null,
      dental_anxiety_level: data.dentalAnxietyLevel || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[medical-history] insert error:', error)
    return NextResponse.json({ error: 'Failed to save medical history.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: row.id }, { status: 201 })
}
