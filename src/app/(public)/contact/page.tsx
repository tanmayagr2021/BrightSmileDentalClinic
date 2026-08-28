import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'
import ContactClient from './ContactClient'
import { buildCanonical } from '@/lib/schema'
import { getContentBlocks } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/contact') },
  title: 'Contact Us',
  description:
    'Get in touch with Bright Smile Dental Clinic — call, WhatsApp, email, or use our contact form. Find us at Nagpokhari, Naxal, Kathmandu.',
}

type DbHour = { day_of_week: number; is_open: boolean; open_time: string | null; close_time: string | null }

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}:00 ${p}` : `${h12}:${String(m).padStart(2, '0')} ${p}`
}

function buildHours(rows: DbHour[]): { days: string; hours: string; open: boolean }[] {
  if (!rows.length) return OPENING_HOURS.map((h) => ({ ...h, open: true }))
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const sorted = [...rows].sort((a, b) => a.day_of_week - b.day_of_week)
  const groups: { days: string[]; hours: string; open: boolean }[] = []
  for (const row of sorted) {
    const hrs = row.is_open && row.open_time && row.close_time
      ? `${fmtTime(row.open_time)} – ${fmtTime(row.close_time)}`
      : 'Closed'
    const last = groups[groups.length - 1]
    if (last && last.hours === hrs && last.open === row.is_open) {
      last.days.push(DAY[row.day_of_week])
    } else {
      groups.push({ days: [DAY[row.day_of_week]], hours: hrs, open: row.is_open })
    }
  }
  return groups.map((g) => ({
    days: g.days.length === 1 ? g.days[0] : `${g.days[0]} – ${g.days[g.days.length - 1]}`,
    hours: g.hours,
    open: g.open,
  }))
}

export default async function ContactPage() {
  const supabase = createAdminClient()
  const [{ data: settingsData }, { data: hoursData }, content] = await Promise.all([
    supabase
      .from('site_settings')
      .select('phone_primary, phone_whatsapp, email_appointments, address_line1, address_line2, address_city, google_maps_url, facebook_url, instagram_url')
      .limit(1)
      .single(),
    supabase
      .from('opening_hours')
      .select('day_of_week, is_open, open_time, close_time')
      .order('day_of_week', { ascending: true }),
    getContentBlocks(),
  ])

  const s = settingsData as {
    phone_primary?: string; phone_whatsapp?: string; email_appointments?: string
    address_line1?: string; address_line2?: string; address_city?: string
    google_maps_url?: string; facebook_url?: string; instagram_url?: string
  } | null

  const addressParts = [s?.address_line1, s?.address_line2, s?.address_city].filter(Boolean)

  return (
    <ContactClient
      phone={s?.phone_primary ?? CLINIC_CONTACT.phone}
      phoneWhatsApp={s?.phone_whatsapp ?? CLINIC_CONTACT.phoneWhatsApp}
      email={s?.email_appointments ?? CLINIC_CONTACT.emailAppointments}
      address={addressParts.length > 0 ? addressParts.join(', ') : CLINIC_CONTACT.addressFull}
      mapsUrl={s?.google_maps_url ?? CLINIC_CONTACT.googleMapsUrl}
      facebook={s?.facebook_url ?? CLINIC_CONTACT.facebook}
      instagram={s?.instagram_url ?? CLINIC_CONTACT.instagram}
      hours={buildHours(hoursData ?? [])}
      content={content}
    />
  )
}
