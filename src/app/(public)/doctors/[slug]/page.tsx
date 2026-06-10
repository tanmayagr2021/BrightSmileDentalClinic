import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DOCTORS_STATIC, CLINIC_CONTACT } from '@/lib/constants'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return DOCTORS_STATIC.filter((d) => d.visible).map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doctor = DOCTORS_STATIC.find((d) => d.slug === slug)
  if (!doctor) return {}
  return {
    title: `${doctor.name} — ${doctor.role}`,
    description: `${doctor.name} is ${doctor.role} at Bright Smile Dental Clinic, Kathmandu. ${doctor.nmc}.`,
  }
}

export default async function DoctorProfilePage({ params }: Props) {
  const { slug } = await params
  const doctor = DOCTORS_STATIC.find((d) => d.slug === slug && d.visible)
  if (!doctor) notFound()

  const otherDoctors = DOCTORS_STATIC.filter((d) => d.slug !== slug && d.visible)

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="border-b border-gray-100 py-20 lg:py-28" style={{ backgroundColor: `${doctor.color}12` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link href="/doctors" className="font-body text-sm text-gray-400 hover:text-primary transition-colors">
              Our Doctors
            </Link>
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-gray-300" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-body text-sm text-gray-600">{doctor.name}</span>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div
              className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg sm:h-32 sm:w-32 sm:text-3xl"
              style={{ backgroundColor: doctor.color }}
            >
              {doctor.initials}
            </div>

            <div>
              <span className="eyebrow mb-3 inline-flex items-center gap-2">
                <span className="inline-block h-px w-5 bg-primary" />
                {doctor.nmc}
              </span>
              <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
                {doctor.name}
              </h1>
              <p className="mt-2 font-heading text-base font-semibold text-gray-500">{doctor.role}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold text-primary">
                  {doctor.qualification}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-heading text-xs font-semibold text-gray-600">
                  {doctor.experience} Experience
                </span>
                {doctor.bookable && (
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
              <h2 className="font-display text-3xl text-dark tracking-display mb-5">About {doctor.shortName}</h2>
              <p className="font-body text-base text-gray-600 leading-relaxed">{doctor.bio}</p>
            </section>

            {/* Specializations */}
            <section>
              <h2 className="font-display text-3xl text-dark tracking-display mb-6">Areas of Expertise</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {doctor.specializations.map((spec, i) => (
                  <div key={spec} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <span className="font-heading text-xs font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="font-heading text-sm font-semibold text-dark">{spec}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Education & Languages */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                <p className="font-body text-sm text-dark leading-relaxed">{doctor.education}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <span key={lang} className="rounded-lg bg-tint px-3 py-1.5 font-heading text-xs font-semibold text-gray-600">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Book card */}
            <div className="rounded-2xl bg-dark p-7 text-white">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                Book a Visit
              </h3>
              <p className="font-display text-xl text-white leading-snug">
                Consult with<br />
                <span className="text-primary">{doctor.shortName}</span>
              </p>
              {doctor.bookable ? (
                <>
                  <p className="mt-3 font-body text-sm text-white/50">
                    {doctor.shortName} is currently accepting new patients.
                  </p>
                  <Link
                    href="/appointments"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
                  >
                    Book Appointment
                  </Link>
                </>
              ) : (
                <p className="mt-3 font-body text-sm text-white/50">
                  {doctor.shortName} sees patients by referral. Call us to discuss your needs.
                </p>
              )}
              <a
                href={`tel:${CLINIC_CONTACT.phone}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-heading text-sm font-semibold text-white/70 transition-all hover:border-white/25 hover:text-white active:scale-[0.98]"
              >
                Call {CLINIC_CONTACT.phone}
              </a>
            </div>

            {/* Other doctors */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
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
                      style={{ backgroundColor: d.color }}
                    >
                      {d.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-dark group-hover:text-primary transition-colors leading-tight">{d.name}</p>
                      <p className="font-body text-xs text-gray-400 leading-tight truncate">{d.role}</p>
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
