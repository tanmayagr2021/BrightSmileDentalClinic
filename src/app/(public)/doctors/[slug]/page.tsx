import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLINIC_CONTACT, RESIDENT_DENTIST_SLUG } from '@/lib/constants'
import { buildPhysicianSchema, buildCanonical } from '@/lib/schema'
import TrackOnMount from '@/components/analytics/TrackOnMount'
import TrackedLink from '@/components/analytics/TrackedLink'
import type { DoctorRow } from '@/types/db'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

function dColor(d: DoctorRow) { return d.color_hex ?? '#4A9B6F' }
function dInitials(d: DoctorRow) { return d.initials ?? d.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2) }
function dShortName(d: DoctorRow) { return d.short_name ?? d.full_name }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data: doctor } = await supabase
    .from('doctors')
    .select('full_name, title, nmc_number')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()
  if (!doctor) return {}
  const title = `${doctor.full_name} — ${doctor.title}`
  const description = `${doctor.full_name} is ${doctor.title} at Bright Smile Dental Clinic, Kathmandu. ${doctor.nmc_number}.`
  const canonical = buildCanonical(`/doctors/${slug}`)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'profile' },
    twitter: { title, description },
  }
}

export default async function DoctorProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = createAdminClient()

  const [{ data: doctor }, { data: othersData }, { data: settingsData }] = await Promise.all([
    supabase
      .from('doctors')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .neq('slug', slug)
      .order('sort_order', { ascending: true }),
    supabase.from('site_settings').select('phone_primary').limit(1).single(),
  ])

  if (!doctor) notFound()

  // The resident general practitioner is a salaried in-house dentist, not a
  // bookable provider — her profile never shows a booking CTA.
  const isBookable = doctor.is_bookable && doctor.slug !== RESIDENT_DENTIST_SLUG

  const otherDoctors: DoctorRow[] = othersData ?? []
  const clinicPhone = (settingsData as { phone_primary?: string } | null)?.phone_primary ?? CLINIC_CONTACT.phone
  const physicianSchema = buildPhysicianSchema({
    full_name: doctor.full_name,
    title: doctor.title,
    slug: doctor.slug,
    profile_image_url: doctor.profile_image_url,
    qualification: doctor.qualification,
  })

  return (
    <div className="bg-white">
      <TrackOnMount event="Doctor Profile Viewed" data={{ doctor: doctor.slug }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianSchema) }}
      />
      {/* Hero */}
      <div className="border-b border-gray-100 py-20 lg:py-28" style={{ backgroundColor: `${dColor(doctor)}12` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link href="/doctors" className="font-body text-sm text-gray-600 hover:text-primary transition-colors">
              Our Doctors
            </Link>
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-gray-300" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-body text-sm text-gray-600">{doctor.full_name}</span>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div
              className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold text-white shadow-lg sm:h-32 sm:w-32 sm:text-3xl"
              style={{ backgroundColor: dColor(doctor) }}
            >
              {doctor.profile_image_url ? (
                <Image src={doctor.profile_image_url} alt={doctor.full_name} fill className="object-cover object-top" sizes="(max-width: 640px) 96px, 128px" />
              ) : (
                dInitials(doctor)
              )}
            </div>

            <div>
              <span className="eyebrow mb-3 inline-flex items-center gap-2">
                <span className="inline-block h-px w-5 bg-primary" />
                {doctor.nmc_number}
              </span>
              <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
                {doctor.full_name}
              </h1>
              <p className="mt-2 font-heading text-base font-semibold text-gray-500">{doctor.title}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {doctor.qualification && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold text-primary">
                    {doctor.qualification}
                  </span>
                )}
                {doctor.experience_text && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-heading text-xs font-semibold text-gray-600">
                    {doctor.experience_text}
                  </span>
                )}
                {isBookable && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-heading text-xs font-semibold text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Accepting Patients
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr]">

          {/* Main content */}
          <div className="space-y-12">

            {/* Bio */}
            <section>
              <h2 className="font-display text-3xl text-dark tracking-display mb-5">About {dShortName(doctor)}</h2>
              <p className="font-body text-base text-gray-600 leading-relaxed">{doctor.full_bio ?? doctor.short_bio}</p>
            </section>

            {/* Specializations */}
            {(doctor.specializations ?? []).length > 0 && (
              <section>
                <h2 className="font-display text-3xl text-dark tracking-display mb-6">Areas of Expertise</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(doctor.specializations ?? []).map((spec: string, i: number) => (
                    <div key={spec} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <span className="font-heading text-xs font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <span className="font-heading text-sm font-semibold text-dark">{spec}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education & Languages */}
            {(doctor.education || (doctor.languages ?? []).length > 0) && (
              <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {doctor.education && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">Education</h3>
                    <p className="font-body text-sm text-dark leading-relaxed">{doctor.education}</p>
                  </div>
                )}
                {(doctor.languages ?? []).length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang: string) => (
                        <span key={lang} className="rounded-lg bg-tint px-3 py-1.5 font-heading text-xs font-semibold text-gray-600">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Book card */}
            <div className="rounded-2xl bg-dark p-7 text-white">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-white/75 mb-3">
                Book a Visit
              </h3>
              <p className="font-display text-xl text-white leading-snug">
                Consult with<br />
                <span className="text-primary">{dShortName(doctor)}</span>
              </p>
              {isBookable ? (
                <>
                  <p className="mt-3 font-body text-sm text-white/50">
                    {dShortName(doctor)} is currently accepting new patients.
                  </p>
                  <TrackedLink
                    href="/appointments"
                    event="Book Doctor Clicked"
                    data={{ doctor: doctor.slug }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
                  >
                    Book Appointment
                  </TrackedLink>
                </>
              ) : doctor.slug === RESIDENT_DENTIST_SLUG ? (
                <p className="mt-3 font-body text-sm text-white/50">
                  {dShortName(doctor)} is our full-time in-house dentist. Call the clinic to arrange a visit.
                </p>
              ) : (
                <p className="mt-3 font-body text-sm text-white/50">
                  {dShortName(doctor)} sees patients by referral. Call us to discuss your needs.
                </p>
              )}
              <a
                href={`tel:${clinicPhone}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-heading text-sm font-semibold text-white/70 transition-all hover:border-white/25 hover:text-white active:scale-[0.98]"
              >
                Call {clinicPhone}
              </a>
            </div>

            {/* Other doctors */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
                Rest of the Team
              </h3>
              <div className="space-y-3">
                {otherDoctors.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/doctors/${d.slug}`}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-tint"
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: dColor(d) }}
                    >
                      {dInitials(d)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-dark group-hover:text-primary transition-colors leading-tight">{d.full_name}</p>
                      <p className="font-body text-xs text-gray-600 leading-tight truncate">{d.title}</p>
                    </div>
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary transition-colors" aria-hidden="true">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
              <Link
                href="/doctors"
                className="mt-4 block text-center font-heading text-xs font-semibold text-primary hover:underline underline-offset-2"
              >
                View Full Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
