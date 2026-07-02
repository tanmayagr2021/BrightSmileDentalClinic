import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'
import AppointmentFlow from '@/components/sections/AppointmentFlow'
import { buildCanonical } from '@/lib/schema'

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

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/appointments') },
  title: 'Book an Appointment',
  description:
    'Book a dental appointment with Dr. Sachin Agrawal or Dr. Binita Adhikari at Bright Smile Dental Clinic, Nagpokhari, Naxal, Kathmandu. Quick and easy online request.',
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string; cancel_error?: string }>
}) {
  const params = await searchParams
  const cancelled = params.cancelled === 'true'
  const cancelError = params.cancel_error

  const supabase = createAdminClient()
  const [{ data: doctorData }, { data: settingsData }, { data: hoursData }] = await Promise.all([
    supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
    supabase
      .from('site_settings')
      .select('phone_primary, phone_whatsapp, address_line1, address_line2, address_city')
      .limit(1)
      .single(),
    supabase
      .from('opening_hours')
      .select('day_of_week, is_open, open_time, close_time')
      .order('day_of_week', { ascending: true }),
  ])
  const doctors = doctorData ?? []
  const s = settingsData as {
    phone_primary?: string; phone_whatsapp?: string
    address_line1?: string; address_line2?: string; address_city?: string
  } | null
  const addressParts = [s?.address_line1, s?.address_line2, s?.address_city].filter(Boolean)
  const clinicPhone = s?.phone_primary ?? CLINIC_CONTACT.phone
  const clinicPhoneWhatsApp = s?.phone_whatsapp ?? CLINIC_CONTACT.phoneWhatsApp
  const clinicAddress = addressParts.length > 0 ? addressParts.join(', ') : CLINIC_CONTACT.addressFull
  const openingHours = buildHours(hoursData ?? [])

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Get Started
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Book an Appointment
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            Request a time with our lead dentists in a few simple steps. We&apos;ll call to confirm your slot — usually within 2 hours.
          </p>
        </div>
      </div>

      {/* Cancellation banners */}
      {cancelled && (
        <div className="border-b border-green-100 bg-green-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 8l2.5 2.5L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-body text-sm text-green-800">
              Your appointment has been cancelled successfully. You may book a new appointment below.
            </p>
          </div>
        </div>
      )}
      {cancelError && (
        <div className="border-b border-red-100 bg-red-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 5v3.5M8 10.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="font-body text-sm text-red-800">{cancelError}</p>
          </div>
        </div>
      )}

      {/* Multi-step flow */}
      <AppointmentFlow
        doctors={doctors}
        phone={clinicPhone}
        phoneWhatsApp={clinicPhoneWhatsApp}
        address={clinicAddress}
        openingHours={openingHours}
      />
    </div>
  )
}
