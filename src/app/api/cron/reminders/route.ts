import { createAdminClient } from '@/lib/supabase/admin'
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
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

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
  // Reminder email sending would go here (Resend not yet configured)
  // For each appointment, send reminder and mark reminder_sent = true
  for (const appt of appointments ?? []) {
    console.log(`[Reminders] Would send reminder for appointment ${appt.id} to ${appt.patient_email}`)
    // await sendReminderEmail(appt)
    await supabase
      .from('appointments')
      .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
      .eq('id', appt.id)
    sent++
  }

  return NextResponse.json({ success: true, sent, total: appointments?.length ?? 0 })
}
