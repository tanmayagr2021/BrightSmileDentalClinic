import Link from 'next/link'
import Image from 'next/image'
import {
  CLINIC_TAGLINE,
  CLINIC_CONTACT,
  OPENING_HOURS,
} from '@/lib/constants'
import { createAdminClient } from '@/lib/supabase/admin'
import Container from '@/components/ui/Container'

type HourRow = { day_of_week: number; is_open: boolean; open_time: string | null; close_time: string | null }

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}:00 ${p}` : `${h12}:${String(m).padStart(2, '0')} ${p}`
}

function buildHours(rows: HourRow[]): { days: string; hours: string }[] {
  if (!rows.length) return OPENING_HOURS.map((h) => ({ days: h.days, hours: h.hours }))
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const sorted = [...rows].sort((a, b) => a.day_of_week - b.day_of_week)
  const groups: { days: string[]; hours: string }[] = []
  for (const row of sorted) {
    const hrs = row.is_open && row.open_time && row.close_time
      ? `${fmtTime(row.open_time)} – ${fmtTime(row.close_time)}`
      : 'Closed'
    const last = groups[groups.length - 1]
    if (last && last.hours === hrs) {
      last.days.push(DAY[row.day_of_week])
    } else {
      groups.push({ days: [DAY[row.day_of_week]], hours: hrs })
    }
  }
  return groups.map((g) => ({
    days: g.days.length === 1 ? g.days[0] : `${g.days[0]} – ${g.days[g.days.length - 1]}`,
    hours: g.hours,
  }))
}

function FooterLogo() {
  return (
    <Link
      href="/"
      aria-label="Bright Smile Dental Clinic — home"
      className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl transition-opacity hover:opacity-85"
    >
      <Image
        src="/images/logo.jpg"
        alt="Bright Smile Dental Clinic"
        width={200}
        height={80}
        className="h-16 w-auto rounded-xl bg-white/10 object-contain"
      />
    </Link>
  )
}

function FooterMap({ address, mapsUrl }: { address: string; mapsUrl: string }) {
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Bright Smile Dental Clinic in Google Maps"
      className="group relative block h-full min-h-[240px] overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Live OpenStreetMap — dark tinted to match footer palette */}
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=85.3135%2C27.7130%2C85.3255%2C27.7200&layer=mapnik&marker=27.7165%2C85.3195"
        title="Bright Smile Dental Clinic map location"
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-[calc(100%+2px)] w-full"
        style={{
          border: 'none',
          filter: 'invert(92%) hue-rotate(210deg) saturate(0.65) brightness(0.82)',
          marginTop: '-1px',
        }}
      />

      {/* Depth vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dark/30 via-transparent to-dark/80" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-dark/25 via-transparent to-dark/25" aria-hidden="true" />

      {/* Live badge — top left */}
      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-dark/55 px-2.5 py-1 backdrop-blur-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
        </span>
        <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/75">Live Map</span>
      </div>

      {/* Centre pin */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <span className="absolute h-14 w-14 animate-ping rounded-full bg-primary/15" style={{ animationDuration: '2.2s' }} />
          {/* Inner ring */}
          <span className="absolute h-9 w-9 rounded-full bg-primary/20" />
          {/* Pin body */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-[0_0_0_3px_rgba(14,165,164,0.22),0_6px_24px_rgba(14,165,164,0.40)] transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="white" className="h-[18px] w-[18px]" aria-hidden="true">
              <path d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7zm0 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
            </svg>
          </div>
          {/* Pin shadow drop */}
          <div className="absolute top-full mt-0.5 h-1 w-4 rounded-full bg-black/30 blur-sm" aria-hidden="true" />
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-heading text-xs font-semibold leading-tight text-white drop-shadow-sm">
            Bright Smile Dental Clinic
          </p>
          <p className="mt-0.5 truncate font-body text-[0.68rem] text-white/75 drop-shadow-sm">
            {address}
          </p>
        </div>
        <div className="ml-4 flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-dark/50 px-3 py-1.5 backdrop-blur-sm transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary/15">
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 flex-shrink-0 text-primary" aria-hidden="true">
            <path d="M8 2a4 4 0 014 4c0 3-4 8-4 8s-4-5-4-8a4 4 0 014-4zm0 2.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="font-heading text-[0.6rem] font-semibold text-white/75 transition-colors group-hover:text-white">
            Get Directions
          </span>
          <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5 text-white/45 transition-all group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </a>
  )
}

function ContactRow({ icon, href, external, children }: {
  icon: React.ReactNode
  href: string
  external?: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-3 font-body text-sm text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
        {icon}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </a>
  )
}

export default async function Footer() {
  const year = new Date().getFullYear()

  const supabase = createAdminClient()
  const [{ data: settingsData }, { data: hoursData }] = await Promise.all([
    supabase.from('site_settings').select('phone_primary, phone_whatsapp, email_appointments, facebook_url, instagram_url, address_line1, address_line2, address_city, google_maps_url').limit(1).single(),
    supabase.from('opening_hours').select('day_of_week, is_open, open_time, close_time').order('day_of_week', { ascending: true }),
  ])

  const settings = settingsData as {
    phone_primary?: string; phone_whatsapp?: string; email_appointments?: string
    facebook_url?: string; instagram_url?: string
    address_line1?: string; address_line2?: string; address_city?: string; google_maps_url?: string
  } | null
  const phone = settings?.phone_primary ?? CLINIC_CONTACT.phone
  const phoneWhatsApp = settings?.phone_whatsapp ?? CLINIC_CONTACT.phoneWhatsApp
  const emailAppointments = settings?.email_appointments ?? CLINIC_CONTACT.emailAppointments
  const facebook = settings?.facebook_url ?? CLINIC_CONTACT.facebook
  const instagram = settings?.instagram_url ?? CLINIC_CONTACT.instagram
  const addressParts = [settings?.address_line1, settings?.address_line2, settings?.address_city].filter(Boolean)
  const clinicAddress = addressParts.length > 0 ? addressParts.join(', ') : CLINIC_CONTACT.addressFull
  const clinicMapsUrl = settings?.google_maps_url || 'https://maps.app.goo.gl/1zc3q43cxKxpcoEM6'
  const hours = buildHours(hoursData ?? [])

  return (
    <footer className="bg-[#0A1128]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      <Container>
        {/* Brand */}
        <div className="pt-16 pb-10 lg:pt-20">
          <FooterLogo />
          <p className="mt-5 font-display text-2xl tracking-tight text-white sm:text-[1.75rem]">
            Bright Smile Dental Clinic
          </p>
          <p className="mt-1.5 font-body text-sm text-white/75">
            {CLINIC_TAGLINE}
          </p>
        </div>

        {/* Two-column: map + contact card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Map embed */}
          <FooterMap address={clinicAddress} mapsUrl={clinicMapsUrl} />

          {/* Contact info card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm lg:p-8">
            <h3 className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
              Visit &amp; Contact
            </h3>

            {/* Hours — compact */}
            <dl className="mt-5 space-y-2">
              {hours.map((item) => (
                <div key={item.days} className="flex items-baseline justify-between gap-4">
                  <dt className="font-body text-sm text-white/75">{item.days}</dt>
                  <dd className="font-heading text-sm font-medium text-white text-right">{item.hours}</dd>
                </div>
              ))}
            </dl>

            <div className="my-6 h-px w-full bg-white/10" />

            {/* Contact list */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                  <LocationIcon />
                </span>
                <p className="font-body text-sm text-white/75 leading-relaxed">{clinicAddress}</p>
              </div>
              <ContactRow icon={<PhoneIcon />} href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</ContactRow>
              <ContactRow icon={<WhatsAppIcon />} href={`https://wa.me/${phoneWhatsApp.replace(/[^0-9]/g, '')}`} external>{phoneWhatsApp}</ContactRow>
              <ContactRow icon={<MailIcon />} href={`mailto:${emailAppointments}`}>{emailAppointments}</ContactRow>
            </div>
          </div>
        </div>

        {/* Gold CTA */}
        <div className="mt-6 flex justify-stretch sm:justify-end">
          <Link
            href="/appointments"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gold px-8 py-4 font-heading text-sm font-semibold text-[#0A1128] shadow-button-gold transition-all hover:bg-gold-dark hover:shadow-glow-gold active:scale-[0.97] sm:w-auto"
          >
            Book an Appointment
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 sm:flex-row">
          <p className="font-body text-xs text-white/60 text-center sm:text-left">
            &copy; {year} Bright Smile Dental Clinic Pvt. Ltd. · All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bright Smile Dental Clinic on Facebook"
                className="text-white/60 transition-colors hover:text-white/70"
              >
                <FacebookIcon />
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bright Smile Dental Clinic on Instagram"
                className="text-white/60 transition-colors hover:text-white/70"
              >
                <InstagramIcon />
              </a>
            )}
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            <Link
              href="/privacy"
              className="font-body text-xs text-white/60 hover:text-white/70 transition-colors"
            >
              Privacy
            </Link>
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            <span className="flex items-center gap-1.5 font-body text-xs text-white/60">
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-primary" aria-hidden="true">
                <path d="M4 8.5l2.5 2.5L12 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              NMC Registered
            </span>
          </div>
        </div>
      </Container>
    </footer>
  )
}

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.95 1.18 2 2 0 012.92 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <path d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}
