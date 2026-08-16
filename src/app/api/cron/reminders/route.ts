import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderEmail } from '@/lib/email'
import { clinicDateStr } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Called by Vercel Cron: daily at 8 AM
// vercel.json: { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 8 * * *" }] }

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Find confirmed appointments tomorrow that haven't had reminders sent
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = clinicDateStr(tomorrow)

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, patient_name, patient_email, patient_phone, appointment_date, appointment_time')
    .eq('appointment_date', tomorrowStr)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)

  if (error) {
    console.error('[Reminders] Query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let failed = 0
  for (const appt of appointments ?? []) {
    if (!appt.patient_email) {
      failed++
      continue
    }

    const result = await sendReminderEmail({
      to: appt.patient_email,
      patientName: appt.patient_name,
      date: appt.appointment_date,
      time: appt.appointment_time,
    })

    if (result.error || result.skipped) {
      if (result.error) console.error(`[Reminders] Failed to send reminder for appointment ${appt.id}:`, result.error)
      failed++
      continue
    }

    // Only mark as sent once Resend has actually accepted the email —
    // reminder_sent is a one-way flag, so a failed send must stay retryable.
    await supabase
      .from('appointments')
      .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
      .eq('id', appt.id)
    sent++
  }

  return NextResponse.json({ success: true, sent, failed, total: appointments?.length ?? 0 })
}
