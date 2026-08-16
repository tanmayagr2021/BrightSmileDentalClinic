import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET() {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const supabase = createAdminClient()
  const [{ data: settings }, { data: hours }] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('opening_hours').select('*').order('day_of_week', { ascending: true }),
  ])

  return NextResponse.json({ settings: settings ?? null, hours: hours ?? [] })
}

export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const body = await req.json()
  const { settings, hours } = body as {
    settings: Record<string, unknown>
    hours?: { day_of_week: number; is_open: boolean; open_time: string | null; close_time: string | null }[]
  }

  const supabase = createAdminClient()

  // Get existing settings row id
  const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single()

  const settingsAllowed = [
    'clinic_name', 'tagline', 'phone_primary', 'phone_whatsapp',
    'email_general', 'email_appointments', 'address_line1', 'address_line2',
    'address_city', 'address_country', 'google_maps_url',
    'facebook_url', 'instagram_url', 'youtube_url',
    'booking_form_enabled', 'booking_form_closed_message',
    'stat_patients', 'stat_years', 'stat_treatments', 'stat_team_label',
  ]
  const settingsUpdate: Record<string, unknown> = {}
  for (const key of settingsAllowed) {
    if (key in settings) settingsUpdate[key] = settings[key]
  }

  if (Object.keys(settingsUpdate).length > 0) {
    if (existing) {
      const { error } = await supabase.from('site_settings').update(settingsUpdate).eq('id', existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase.from('site_settings').insert(settingsUpdate)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Update opening hours
  if (hours && Array.isArray(hours)) {
    for (const h of hours) {
      const { error } = await supabase
        .from('opening_hours')
        .upsert({
          day_of_week: h.day_of_week,
          is_open: h.is_open,
          open_time: h.open_time || null,
          close_time: h.close_time || null,
        }, { onConflict: 'day_of_week' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
