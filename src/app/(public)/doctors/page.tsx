import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLINIC_CONTACT } from '@/lib/constants'
import type { DoctorRow } from '@/types/db'
import { doctorColor, doctorInitials } from '@/lib/doctor-display'
import { buildCanonical } from '@/lib/schema'
import { getTeamMembers, type TeamMemberRow } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/doctors') },
  title: 'Our Doctors & Care Team',
  description:
    'Meet the experts behind every smile at Bright Smile Dental Clinic — two lead dentists, four visiting specialists, and a dedicated clinical and administrative team committed to exceptional dental care.',
}

function NmcBadge() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
      <path d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z" fill="#0C3C2D" fillOpacity="0.15" stroke="#0C3C2D" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 8l2 2 3.5-3.5" stroke="#0C3C2D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRight({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3 flex-shrink-0" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1 7h12M7 1a10 10 0 010 12M7 1a10 10 0 000 12" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  )
}

function GradCap() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3 flex-shrink-0" aria-hidden="true">
      <path d="M7 2L1 5.5l6 3.5 6-3.5L7 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M3 7.5V11c0 1.1 1.8 2 4 2s4-.9 4-2V7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M13 5.5v3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

// Department-level blurb + tag — generic copy, not per-person, so it isn't
// stored in the DB. Keyed by team_members.department for both groups below.
const ROLE_DESCRIPTIONS: Record<string, { icon: string; description: string; strength: string }> = {
  hygienist: {
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    description: 'Provides professional cleaning, gum health assessments, and oral hygiene education.',
    strength: 'Clinical hygiene care',
  },
  assistant: {
    icon: 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h7v2H4v-2z',
    description: 'Assists dentists during procedures, prepares treatment rooms, and supports patient care.',
    strength: 'Chairside support',
  },
  reception: {
    icon: 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h7v2H4v-2z',
    description: 'Your first point of contact. Handles appointments, enquiries, and ensures every patient feels genuinely welcomed.',
    strength: 'Patient experience',
  },
  admin: {
    icon: 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h7v2H4v-2z',
    description: 'Manages clinic operations, patient records, billing coordination and compliance — so the clinical team can focus entirely on you.',
    strength: 'Clinic operations',
  },
}

function tInitials(m: TeamMemberRow) { return m.initials ?? m.name.split(' ').map((w) => w[0]).join('').slice(0, 2) }

export default async function DoctorsPage() {
  const supabase = createAdminClient()
  const [{ data }, { data: settingsData }, teamMembers] = await Promise.all([
    supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
    supabase.from('site_settings').select('phone_primary').limit(1).single(),
    getTeamMembers(),
  ])

  const allDoctors: DoctorRow[] = data ?? []
  const clinicPhone = (settingsData as { phone_primary?: string } | null)?.phone_primary ?? CLINIC_CONTACT.phone
  const leadDoctors = allDoctors.filter((d) => d.doctor_type === 'lead')
  const specialists = allDoctors.filter((d) => d.doctor_type === 'specialist')
  const hygienists = teamMembers.filter((m) => m.department === 'hygienist' || m.department === 'assistant')
  const supportTeam = teamMembers.filter((m) => m.department === 'reception' || m.department === 'admin')

  return (
    <div>

      {/* ── HERO — Dark Premium ── */}
      <section
        className="relative overflow-hidden py-24 lg:py-32"
        style={{ background: '#0E1B2E' }}
      >
        {/* Architectural grid */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.022]" aria-hidden="true">
          <defs>
            <pattern id="doctors-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#doctors-grid)" />
        </svg>

        {/* Glow accents */}
        <div className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-teal/5 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <span className="mb-5 inline-flex items-center gap-3 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold">
            <span className="inline-block h-px w-7 bg-gold/60" />
            Our People
          </span>

          {/* Headline */}
          <h1
            className="font-display leading-[1.04] text-white tracking-display"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)', textShadow: '0 2px 40px rgba(0,0,0,0.4)' }}
          >
            The Experts Behind<br />
            <span className="text-gold">Every Smile</span>
          </h1>

          <p className="mt-6 max-w-2xl font-body text-[1rem] text-white/90 leading-relaxed lg:text-[1.05rem]">
            Six NMC-registered dentists and specialists, supported by a dedicated clinical and administrative team — all committed to exceptional dental care in Kathmandu.
          </p>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              `${allDoctors.length} NMC-Registered Dentists`,
              'Specialist Consultants On-Call',
              'Serving Kathmandu since 2013',
              'Nagpokhari, Naxal',
            ].map((item) => (
              <span key={item} className="flex items-center gap-2.5 font-heading text-[0.68rem] font-medium text-white/90">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAD DENTISTS — Editorial Feature Cards ── */}
      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow mb-3 inline-flex items-center gap-2">
                <span className="inline-block h-px w-5 bg-primary/60" />
                Principal Dentists
              </span>
              <h2 className="font-display text-4xl text-dark sm:text-5xl tracking-display leading-[1.06]">
                Your Primary Care Contacts
              </h2>
              <p className="mt-4 max-w-lg font-body text-base text-gray-500 leading-relaxed">
                All direct appointments are with Dr. Sachin or Dr. Binita — who assess your needs, design your care plan, and coordinate any specialist involvement.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-heading text-xs font-semibold text-primary">Accepting New Patients</span>
              </div>
            </div>
          </div>

          {/* Full-width editorial lead cards */}
          <div className="space-y-8">
            {leadDoctors.map((doc) => (
              <div
                key={doc.slug}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-card transition-all duration-500 hover:shadow-premium"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">

                  {/* Left — colored banner */}
                  <div
                    className="relative flex min-h-[320px] flex-col justify-between overflow-hidden p-10 lg:min-h-[420px]"
                    style={{ backgroundColor: doctorColor(doc) }}
                  >
                    {/* Grid overlay */}
                    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]" aria-hidden="true">
                      <defs>
                        <pattern id={`doc-grid-${doc.slug}`} width="24" height="24" patternUnits="userSpaceOnUse">
                          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#doc-grid-${doc.slug})`} />
                    </svg>

                    {/* Decorative depth circles */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/[0.04]" aria-hidden="true" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/[0.035]" aria-hidden="true" />

                    {/* Large avatar — top */}
                    <div className="relative self-start">
                      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                        {doc.profile_image_url ? (
                          <Image src={doc.profile_image_url} alt={doc.full_name} fill className="object-cover object-top" sizes="112px" />
                        ) : (
                          <span className="font-display text-5xl font-bold text-white">{doctorInitials(doc)}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-green-400 ring-2 ring-white/25">
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      </div>
                    </div>

                    {/* Bottom: name + credentials */}
                    <div className="relative mt-auto">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-xl bg-white/20 px-3 py-1.5 font-heading text-xs font-semibold text-white backdrop-blur-sm">
                          {doc.qualification}
                        </span>
                        <span className="rounded-xl bg-white/10 px-3 py-1.5 font-heading text-[0.6rem] font-semibold tracking-wide text-white/80">
                          NMC {doc.nmc_number}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl text-white sm:text-[1.9rem] leading-tight">
                        {doc.full_name}
                      </h2>
                      <p className="mt-1 font-body text-sm text-white/85">{doc.title}</p>
                      {doc.experience_text && (
                        <p className="mt-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/75">
                          {doc.experience_text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right — rich content */}
                  <div className="flex flex-col justify-between p-10 lg:p-12">
                    <div>
                      {/* Credential badges */}
                      <div className="mb-7 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3.5 py-1.5">
                          <NmcBadge />
                          <span className="font-heading text-[0.65rem] font-semibold text-teal">
                            NMC Verified · {doc.nmc_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3.5 py-1.5">
                          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                          <span className="font-heading text-[0.62rem] font-semibold text-green-700">
                            Accepting Appointments
                          </span>
                        </div>
                      </div>

                      {/* Biography — short, first-glance summary; full bio is one click away via "Full Profile" */}
                      <p className="font-body text-[0.96rem] leading-[1.75] text-gray-600">
                        {doc.short_bio}
                      </p>

                      {/* Specializations */}
                      {(doc.specializations ?? []).length > 0 && (
                        <div className="mt-7">
                          <p className="mb-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-600">
                            Areas of Focus
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(doc.specializations ?? []).slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="rounded-xl border border-gray-100 bg-tint px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-dark/60"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Credentials row */}
                      <div className="mt-7 flex flex-wrap items-center gap-6 border-t border-gray-50 pt-6 font-body text-xs text-gray-600">
                        {(doc.languages ?? []).length > 0 && (
                          <span className="flex items-center gap-2">
                            <GlobeIcon />
                            {(doc.languages ?? []).join(' · ')}
                          </span>
                        )}
                        {doc.education && (
                          <span className="flex items-center gap-2">
                            <GradCap />
                            {doc.education.split(' — ')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <Link
                        href="/appointments"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-heading text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
                      >
                        Book Appointment
                      </Link>
                      <Link
                        href={`/doctors/${doc.slug}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 font-heading text-sm font-semibold text-dark transition-all hover:border-dark hover:bg-dark hover:text-white active:scale-[0.97]"
                      >
                        Full Profile <ArrowRight />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIST CONSULTANTS ── */}
      <section
        className="relative overflow-hidden py-24 lg:py-28"
        style={{ background: '#0E1B2E' }}
      >
        {/* Subtle grid */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.02]" aria-hidden="true">
          <defs>
            <pattern id="spec-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spec-grid)" />
        </svg>
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-teal/10 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="mb-4 inline-flex items-center gap-3 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold">
                <span className="inline-block h-px w-7 bg-gold/60" />
                Specialist Consultants
              </span>
              <h2 className="font-display text-4xl text-white tracking-display leading-[1.06] sm:text-5xl">
                Where Specialists<br />Join Your Care
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-white/85 leading-relaxed">
                For treatments requiring advanced expertise — implants, periodontics, oral surgery — our visiting specialists work within your coordinated care plan, arranged by your lead dentist.
              </p>
            </div>
            <div>
              <a
                href={`tel:${clinicPhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                Ask About Specialists
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Specialist cards — cleaner, prestigious */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specialists.map((doc) => (
              <div
                key={doc.slug}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07]"
              >
                {/* Colored header strip */}
                <div
                  className="relative flex h-[9rem] items-center justify-center overflow-hidden"
                  style={{ backgroundColor: doctorColor(doc) }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" aria-hidden="true" />
                  <div
                    className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-20"
                    style={{ backgroundColor: '#fff' }}
                    aria-hidden="true"
                  />
                  <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-xl bg-white/20 ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                    {doc.profile_image_url ? (
                      <Image src={doc.profile_image_url} alt={doc.full_name} fill className="object-cover object-top" sizes="72px" />
                    ) : (
                      <span className="font-display text-2xl font-bold text-white">{doctorInitials(doc)}</span>
                    )}
                  </div>
                  <span className="absolute right-3 top-3 rounded-lg bg-black/25 px-2 py-0.5 font-heading text-[0.65rem] font-semibold text-white backdrop-blur-sm">
                    {doc.qualification}
                  </span>
                </div>

                <div className="p-5">
                  <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">
                    NMC {doc.nmc_number}
                  </p>
                  <h3 className="mt-1.5 font-heading text-sm font-semibold leading-snug text-white">{doc.full_name}</h3>
                  <p className="mt-0.5 font-body text-xs text-white/90">{doc.title}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(doc.specializations ?? []).slice(0, 2).map((s) => (
                      <span key={s} className="rounded-lg bg-white/10 px-2 py-0.5 font-heading text-[0.65rem] font-semibold text-white/90">
                        {s}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/doctors/${doc.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-heading text-xs font-semibold text-white/85 transition-all hover:bg-white/10 hover:text-white active:scale-[0.97]"
                  >
                    View Profile <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPLETE CARE TEAM ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-16">
            <span className="eyebrow mb-3 inline-flex items-center gap-2">
              <span className="inline-block h-px w-5 bg-primary/60" />
              The Full Picture
            </span>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display text-4xl text-dark tracking-display leading-[1.06] sm:text-5xl">
                  A Complete Organisation
                </h2>
                <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
                  Exceptional dental care extends far beyond the dentist&apos;s chair. Our clinical and administrative team ensures every visit is smooth, comfortable and well-supported from first call to final follow-up.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical & Hygiene Team */}
          <div className="mb-14">
            <div className="mb-6 flex items-center gap-4">
              <p className="font-heading text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gray-600">
                Clinical & Hygiene Staff
              </p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {hygienists.map((member) => {
                const meta = ROLE_DESCRIPTIONS[member.department] ?? ROLE_DESCRIPTIONS['assistant']
                const color = member.color_hex ?? '#4A9B6F'
                return (
                  <div
                    key={member.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                  >
                    {/* Subtle color top border */}
                    <div
                      className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />

                    <div className="flex items-start gap-4">
                      <div
                        className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl font-heading text-sm font-bold text-white transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: color }}
                      >
                        {member.photo_url ? (
                          <Image src={member.photo_url} alt={member.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          tInitials(member)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-sm font-semibold text-dark truncate">{member.name}</h3>
                        <p className="font-body text-xs text-primary font-medium">{member.role}</p>
                      </div>
                    </div>

                    <p className="mt-4 font-body text-xs leading-relaxed text-gray-500">
                      {meta.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal" />
                      <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-teal">
                        {meta.strength}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reception & Admin Team */}
          <div className="mb-14">
            <div className="mb-6 flex items-center gap-4">
              <p className="font-heading text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gray-600">
                Reception & Administration
              </p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {supportTeam.map((member) => {
                const meta = ROLE_DESCRIPTIONS[member.department] ?? ROLE_DESCRIPTIONS['admin']
                const color = member.color_hex ?? '#0C3C2D'
                return (
                  <div
                    key={member.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <div
                      className="absolute left-0 right-0 top-0 h-[3px] rounded-t-2xl"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />

                    <div className="flex items-start gap-4">
                      <div
                        className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl font-heading text-sm font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {member.photo_url ? (
                          <Image src={member.photo_url} alt={member.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          tInitials(member)
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-semibold text-dark">{member.name}</h3>
                        <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-wide text-primary">{member.role}</p>
                      </div>
                    </div>

                    <p className="mt-4 font-body text-sm leading-relaxed text-gray-500">
                      {meta.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Closing CTA strip */}
          <div
            className="overflow-hidden rounded-2xl p-8 text-center lg:p-12"
            style={{ background: '#0E1B2E' }}
          >
            <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold mb-4">
              Direct Bookings Available
            </p>
            <p className="font-display text-2xl text-white tracking-display sm:text-3xl">
              Ready to meet the team?
            </p>
            <p className="mx-auto mt-3 max-w-lg font-body text-sm text-white/85 leading-relaxed">
              Direct appointments are available with Dr. Sachin Agrawal and Dr. Binita Adhikari. Specialist and hygienist sessions are coordinated as part of your personalised care plan.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/appointments"
                className="inline-flex items-center gap-2.5 rounded-xl bg-gold px-8 py-3.5 font-heading text-sm font-semibold text-[#14202E] shadow-button-gold transition-all hover:bg-gold-dark hover:shadow-glow-gold active:scale-[0.97]"
              >
                Book an Appointment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${clinicPhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-8 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-white/15"
              >
                {clinicPhone}
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
