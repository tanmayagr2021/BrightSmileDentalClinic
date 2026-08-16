import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('doctor_id', id)
    .order('day_of_week', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected array of day rows' }, { status: 400 })
  }

  const rows = (body as Array<{
    day_of_week: number
    is_available: boolean
    start_time: string | null
    end_time: string | null
    slot_duration_minutes: number
    max_appointments_per_day: number | null
  }>).map((row) => ({
    doctor_id: id,
    day_of_week: row.day_of_week,
    is_available: row.is_available,
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
    slot_duration_minutes: row.slot_duration_minutes ?? 30,
    max_appointments_per_day: row.max_appointments_per_day ?? null,
  }))

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('doctor_availability')
    .upsert(rows, { onConflict: 'doctor_id,day_of_week' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
