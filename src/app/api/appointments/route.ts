import { createAdminClient } from '@/lib/supabase/admin'
import { sendAppointmentConfirmation, sendAppointmentNotification } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'

export const runtime = 'nodejs'

const Schema = z.object({
  patientName: z.string().min(2).max(100),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(7).max(20),
  doctorName: z.string().min(2).max(100),
  doctorSlug: z.string(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  appointmentTime: z.string().min(4).max(10), // "10:30 AM"
  notes: z.string().max(500).optional(),
})

function timeToPostgres(time12: string): string {
  const [timePart, period] = time12.split(' ')
  const [h, m] = timePart.split(':').map(Number)
  let hours = h
  if (period === 'PM' && h !== 12) hours = h + 12
  if (period === 'AM' && h === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const { success } = await rateLimit(`appt:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 })
  }

  // Parse + validate
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { patientName, patientEmail, patientPhone, doctorName, appointmentDate, appointmentTime, notes } = parsed.data

  const supabase = createAdminClient()

  // Insert appointment (service role bypasses RLS)
  const { data: appt, error: apptErr } = await supabase
    .from('appointments')
    .insert({
      patient_name: patientName,
      patient_email: patientEmail,
      patient_phone: patientPhone,
      appointment_date: appointmentDate,
      appointment_time: timeToPostgres(appointmentTime),
      duration_minutes: 30,
      status: 'pending',
      notes: notes ? `Doctor: ${doctorName}\n\n${notes}` : `Doctor: ${doctorName}`,
      is_new_patient: true,
      source: 'website',
    })
    .select('id')
    .single()

  if (apptErr || !appt) {
    console.error('[Appointments] Insert error:', apptErr)
    return NextResponse.json({ error: 'Failed to save appointment. Please call us directly.' }, { status: 500 })
  }

  // Create cancellation token
  const token = randomBytes(32).toString('hex')
  const { error: tokenErr } = await supabase
    .from('appointment_tokens')
    .insert({
      appointment_id: appt.id,
      token,
      token_type: 'cancellation',
    })

  if (tokenErr) {
    console.error('[Appointments] Token insert error:', tokenErr)
    // Non-fatal — appointment is saved, token is optional
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const cancellationUrl = `${siteUrl}/appointments/cancel?token=${token}`
  const dateDisplay = formatDateDisplay(appointmentDate)

  // Send emails (non-blocking — failures don't affect response)
  await Promise.allSettled([
    sendAppointmentConfirmation({
      to: patientEmail,
      patientName,
      doctorName,
      date: dateDisplay,
      time: appointmentTime,
      cancellationUrl,
    }),
    sendAppointmentNotification({
      patientName,
      patientPhone,
      patientEmail,
      doctorName,
      date: dateDisplay,
      time: appointmentTime,
      notes: notes ?? undefined,
    }),
  ])

  return NextResponse.json({ success: true, appointmentId: appt.id })
}
