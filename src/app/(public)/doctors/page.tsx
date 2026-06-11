import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { TEAM_MEMBERS_STATIC, CLINIC_CONTACT } from '@/lib/constants'
import type { DoctorRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Doctors & Care Team',
  description:
    'Meet the complete care team at Bright Smile Dental Clinic — two lead dentists, four visiting specialists, and dedicated hygienists and clinical support staff.',
}

function dColor(d: DoctorRow) { return d.color_hex ?? '#4A9B6F' }
function dInitials(d: DoctorRow) { return d.initials ?? d.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2) }

const SUPPORT_ROLES = [
  { role: 'Reception Team', description: 'Your first point of contact — scheduling, enquiries and a warm welcome.', icon: 'M8 7a4 4 0 100-8 4 4 0 000 8zm0 2a8 8 0 00-8 8h16a8 8 0 00-8-8z' },
  { role: 'Administrative Staff', description: 'Managing appointments, records and clinic operations behind the scenes.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
]

function NmcBadge() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
      <path d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z" fill="#4A9B6F" fillOpacity="0.12" stroke="#4A9B6F" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 8l2 2 3.5-3.5" stroke="#4A9B6F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function DoctorsPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  const allDoctors: DoctorRow[] = data ?? []
  const leadDoctors = allDoctors.filter((d) => d.doctor_type === 'lead')
  const specialists = allDoctors.filter((d) => d.doctor_type === 'specialist')
  const supportTeam = TEAM_MEMBERS_STATIC.filter((m) => m.visible)

  return (
    <div className="bg-white">

      {/* Page hero */}
      <div className="bg-tint border-b border-gray-100 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-4 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Our People
          </span>
          <h1 className="font-display text-5xl text-dark sm:text-6xl tracking-display">
            Our Care Team
          </h1>
          <p className="mt-5 max-w-2xl font-body text-lg text-gray-500 leading-relaxed">
            From your first consultation to specialist treatment and ongoing hygiene care — every person on our team is committed to exceptional dental care delivered with genuine warmth.
          </p>
        </div>
      </div>

      {/* ── SECTION 1: Lead Dentists ── */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-heading text-xs font-semibold uppercase tracking-widest text-dark">
                Lead Dentists
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 font-heading text-[0.62rem] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Accepting New Patients
              </span>
            </div>
            <p className="font-body text-sm text-gray-500">
              Direct appointments available. Our lead dentists are your primary care contact for all treatment planning.
            </p>
          </div>
          <div className="hidden flex-1 lg:block"><div className="h-px bg-gray-100" /></div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {leadDoctors.map((doc) => (
            <div
              key={doc.slug}
              className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300"
            >
              {/* Banner */}
              <div
                className="relative flex items-end justify-between overflow-hidden px-8 pt-12 pb-8"
                style={{ backgroundColor: dColor(doc) }}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/[0.04]" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/[0.04]" aria-hidden="true" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                  <span className="font-display text-3xl font-bold text-white">{dInitials(doc)}</span>
                </div>
                <div className="relative text-right">
                  <span className="rounded-xl bg-white/20 px-3 py-1.5 font-heading text-xs font-semibold text-white backdrop-blur-sm">
                    {doc.qualification}
                  </span>
                  <p className="mt-2 font-heading text-[0.62rem] font-semibold uppercase tracking-wider text-white/55">{doc.nmc_number}</p>
                  <p className="mt-0.5 font-heading text-[0.65rem] text-white/45">{doc.experience_text}</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-dark">{doc.full_name}</h2>
                    <p className="mt-0.5 font-body text-sm font-medium text-primary">{doc.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 flex-shrink-0">
                    <NmcBadge />
                    <span className="font-heading text-[0.6rem] font-semibold text-primary">NMC Verified</span>
                  </div>
                </div>

                <p className="mt-4 font-body text-sm text-gray-500 leading-relaxed">{doc.full_bio ?? doc.short_bio}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(doc.specializations ?? []).map((s) => (
                    <span key={s} className="rounded-lg bg-tint px-2.5 py-1 font-heading text-[0.62rem] font-semibold text-dark/60">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-4 border-t border-gray-50 pt-5 font-body text-xs text-gray-400">
                  <span>{doc.education}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/appointments"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.97]"
                  >
                    Book Appointment
                  </Link>
                  <Link
                    href={`/doctors/${doc.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3.5 font-heading text-xs font-semibold text-dark transition-all hover:border-primary hover:text-primary active:scale-[0.97]"
                  >
                    Full Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: Specialist Network ── */}
      <div className="bg-tint border-y border-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="eyebrow mb-3 inline-flex items-center gap-2">
                <span className="inline-block h-px w-5 bg-primary" />
                Specialist Consultants
              </span>
              <h2 className="font-display text-4xl text-dark tracking-display">
                Where Specialists Join Our Doctors
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
                For treatments that benefit from specialist expertise, our visiting specialists work alongside your lead dentist — providing advanced care as part of a coordinated, seamless treatment plan. Specialist involvement is arranged by your lead dentist based on your clinical needs.
              </p>
            </div>
            <div className="flex items-end">
              <a
                href={`tel:${CLINIC_CONTACT.phone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-dark px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-dark/85 active:scale-[0.98]"
              >
                Ask About Specialists
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specialists.map((doc) => (
              <div
                key={doc.slug}
                className="group overflow-hidden rounded-2xl border border-white bg-white shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
              >
                {/* Compact header */}
                <div
                  className="relative flex h-[7.5rem] items-center justify-center overflow-hidden"
                  style={{ backgroundColor: dColor(doc) }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/15" aria-hidden="true" />
                  <div className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                    <span className="font-display text-2xl font-bold text-white">{dInitials(doc)}</span>
                  </div>
                  <span className="absolute right-3 top-3 rounded-lg bg-white/20 px-2 py-0.5 font-heading text-[0.58rem] font-semibold text-white backdrop-blur-sm">
                    {doc.qualification}
                  </span>
                </div>

                <div className="p-5">
                  <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-widest text-primary">{doc.nmc_number}</p>
                  <h3 className="mt-1 font-heading text-sm font-semibold text-dark leading-snug">{doc.full_name}</h3>
                  <p className="mt-0.5 font-body text-xs text-gray-500">{doc.title}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(doc.specializations ?? []).slice(0, 2).map((s) => (
                      <span key={s} className="rounded bg-tint px-2 py-0.5 font-heading text-[0.58rem] font-medium text-gray-600">
                        {s}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/doctors/${doc.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tint px-4 py-2.5 font-heading text-xs font-semibold text-dark transition-all hover:bg-gray-100 active:scale-[0.97]"
                  >
                    View Profile
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Care Team ── */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <div className="mb-10">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Our People
          </span>
          <h2 className="font-display text-4xl text-dark tracking-display">Our Care Team</h2>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            Your care experience extends beyond the dentist&apos;s chair. Our clinical and administrative team ensures every visit is smooth, comfortable and well-supported from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">

          {/* Clinical staff */}
          <div>
            <p className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-gray-400">
              Clinical & Hygiene
            </p>
            <div className="space-y-3">
              {supportTeam.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-dark">{member.name}</p>
                    <p className="font-body text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}

              {/* Placeholder for additional hygienists / assistants */}
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-gray-400" aria-hidden="true">
                    <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-body text-sm text-gray-400">Additional clinical staff — managed via admin</p>
              </div>
            </div>
          </div>

          {/* Reception & admin roles */}
          <div>
            <p className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-gray-400">
              Reception & Administration
            </p>
            <div className="space-y-3">
              {SUPPORT_ROLES.map((role) => (
                <div key={role.role} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-sm">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                      <path d={role.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-dark">{role.role}</p>
                    <p className="mt-0.5 font-body text-xs text-gray-500 leading-relaxed">{role.description}</p>
                  </div>
                </div>
              ))}

              {/* Placeholder for admin staff */}
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-gray-400" aria-hidden="true">
                    <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-body text-sm text-gray-400">Reception & admin staff — managed via admin dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-2xl border border-gray-100 bg-tint p-7 text-center">
          <p className="font-body text-sm text-gray-500 leading-relaxed">
            Direct appointments are available with <strong className="text-dark font-semibold">Dr. Sachin Agrawal</strong> and <strong className="text-dark font-semibold">Dr. Binita Adhikari</strong>. Specialist and hygienist consultations are coordinated as part of your care plan.
          </p>
          <Link
            href="/appointments"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-[0.97]"
          >
            Book an Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}
