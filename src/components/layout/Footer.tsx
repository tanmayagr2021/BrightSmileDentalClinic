import Link from 'next/link'
import Image from 'next/image'
import {
  CLINIC_TAGLINE,
  CLINIC_CONTACT,
  FOOTER_QUICK_LINKS,
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

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-white/40 mb-4">
      {children}
    </h3>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="font-body text-sm text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

export default async function Footer() {
  const year = new Date().getFullYear()

  const supabase = createAdminClient()
  const [{ data: settingsData }, { data: hoursData }] = await Promise.all([
    supabase.from('site_settings').select('phone_primary, phone_whatsapp, email_appointments, facebook_url, instagram_url').limit(1).single(),
    supabase.from('opening_hours').select('day_of_week, is_open, open_time, close_time').order('day_of_week', { ascending: true }),
  ])

  const settings = settingsData as { phone_primary?: string; phone_whatsapp?: string; email_appointments?: string; facebook_url?: string; instagram_url?: string } | null
  const phone = settings?.phone_primary ?? CLINIC_CONTACT.phone
  const phoneWhatsApp = settings?.phone_whatsapp ?? CLINIC_CONTACT.phoneWhatsApp
  const emailAppointments = settings?.email_appointments ?? CLINIC_CONTACT.emailAppointments
  const facebook = settings?.facebook_url ?? CLINIC_CONTACT.facebook
  const instagram = settings?.instagram_url ?? CLINIC_CONTACT.instagram
  const hours = buildHours(hoursData ?? [])

  return (
    <footer className="bg-dark" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Pre-footer brand strip */}
      <div style={{ background: 'linear-gradient(135deg, #0A1F14 0%, #1A3D2B 100%)' }} className="border-b border-white/[0.06]">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 py-12 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-display text-2xl tracking-tight text-white sm:text-3xl">
                {CLINIC_TAGLINE}
              </p>
              <p className="mt-1.5 font-body text-sm text-white/40">
                Est. 2013 &nbsp;·&nbsp; Nagpokhari, Naxal, Kathmandu
              </p>
            </div>
            <Link
              href="/appointments"
              className="inline-flex flex-shrink-0 items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-primary/35 active:scale-[0.97]"
            >
              Book an Appointment
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterLogo />
            <p className="mt-4 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/28">
              Est. 2013 &nbsp;·&nbsp; Nagpokhari, Naxal, Kathmandu
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-2.5">
              {FOOTER_QUICK_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <address className="not-italic space-y-3">
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 font-body text-sm text-white/55 transition-colors hover:text-white"
              >
                <PhoneIcon />
                {phone}
              </a>
              <a
                href={`https://wa.me/${phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-body text-sm text-white/55 transition-colors hover:text-white"
              >
                <WhatsAppIcon />
                {phoneWhatsApp}
              </a>
              <a
                href={`mailto:${emailAppointments}`}
                className="flex items-center gap-2 font-body text-sm text-white/55 transition-colors hover:text-white"
              >
                <MailIcon />
                {emailAppointments}
              </a>
            </address>
          </div>

          {/* Col 4 — Hours */}
          <div>
            <FooterHeading>Opening Hours</FooterHeading>
            <ul className="space-y-3">
              {hours.map((item) => (
                <li key={item.days} className="flex items-start justify-between gap-4">
                  <p className="font-body text-sm text-white/55">{item.days}</p>
                  <p className="font-body text-sm font-medium text-white/80 text-right">{item.hours}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="font-body text-xs text-white/25 text-center sm:text-left">
            &copy; {year} Bright Smile Dental Clinic Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bright Smile Dental Clinic on Facebook"
                className="text-white/25 transition-colors hover:text-white/55"
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
                className="text-white/25 transition-colors hover:text-white/55"
              >
                <InstagramIcon />
              </a>
            )}
            <span className="h-3 w-px bg-white/12" aria-hidden="true" />
            <Link
              href="/privacy"
              className="font-body text-xs text-white/25 hover:text-white/55 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="h-3 w-px bg-white/12" aria-hidden="true" />
            <p className="font-body text-xs text-white/25">NMC Registered</p>
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 text-white/30">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.95 1.18 2 2 0 012.92 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0 text-white/30">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 text-white/30">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
