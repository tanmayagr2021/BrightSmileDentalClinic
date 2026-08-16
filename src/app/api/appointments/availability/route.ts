import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Public — returns which of a doctor's slots are already booked on a given
// date, so the booking calendar can grey them out instead of relying on the
// hardcoded placeholder set. Only exposes time-of-day, no patient data.
export async function GET(req: NextRequest) {
  const doctorSlug = req.nextUrl.searchParams.get('doctorSlug')
  const date = req.nextUrl.searchParams.get('date')

  if (!doctorSlug || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'doctorSlug and date (YYYY-MM-DD) are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('slug', doctorSlug)
    .is('deleted_at', null)
    .single()

  if (!doctor) {
    return NextResponse.json({ bookedTimes: [] })
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('doctor_id', doctor.id)
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])

  const bookedTimes = (appointments ?? []).map((a) => a.appointment_time)
  return NextResponse.json({ bookedTimes })
}
