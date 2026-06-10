import type { Metadata } from 'next'
import Link from 'next/link'
import { DOCTORS_STATIC } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Our Doctors',
  description: 'Meet the experienced NMC-registered dental team at Bright Smile Dental Clinic, Kathmandu.',
}

export default function DoctorsPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Our Team
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Meet Our Doctors
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            Our NMC-registered team brings years of expertise and genuine care to every patient.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DOCTORS_STATIC.map((doctor) => (
            <div key={doctor.name} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div
                className="relative flex h-48 items-center justify-center"
                style={{ backgroundColor: doctor.bg }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
                  <span className="font-display text-2xl font-bold text-white">{doctor.initials}</span>
                </div>
                <span className="absolute right-4 top-4 rounded-lg bg-white/20 px-2.5 py-1 font-heading text-xs font-semibold text-white backdrop-blur-sm">
                  {doctor.qualification}
                </span>
                {doctor.bookable && (
                  <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 font-heading text-[0.6rem] font-semibold uppercase tracking-wide text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Accepting Patients
                  </span>
                )}
              </div>
              <div className="p-6">
                <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-primary">{doctor.nmc}</p>
                <h2 className="mt-1 font-heading text-base font-semibold text-dark">{doctor.name}</h2>
                <p className="mt-1 font-body text-sm text-gray-500">{doctor.role}</p>
                {doctor.bookable ? (
                  <Link href="/appointments" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark">
                    Book Appointment
                  </Link>
                ) : (
                  <div className="mt-5 rounded-xl bg-tint px-4 py-2.5 text-center font-heading text-xs text-gray-500">
                    Available by referral
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
