'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, slideInRight } from '@/lib/animations'
import { CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  )
}

export default function CtaSection({
  phone,
  email,
  address,
  mapsUrl,
  openingHours,
}: {
  phone?: string
  email?: string
  address?: string
  mapsUrl?: string
  openingHours?: { days: string; hours: string; open: boolean }[]
}) {
  const displayPhone = phone ?? CLINIC_CONTACT.phone
  const displayEmail = email ?? CLINIC_CONTACT.emailAppointments
  const displayAddress = address ?? CLINIC_CONTACT.addressFull
  const displayMapsUrl = mapsUrl ?? CLINIC_CONTACT.googleMapsUrl
  const displayHours = (openingHours && openingHours.length > 0) ? openingHours : [...OPENING_HOURS]

  return (
    <section className="overflow-hidden bg-[#0F172A]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left — CTA */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative overflow-hidden px-8 py-20 sm:px-14 lg:px-18 lg:py-28"
          >
            {/* Architectural grid */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.02]" aria-hidden="true">
              <defs>
                <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>

            <motion.span variants={fadeUp} className="mb-5 inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="inline-block h-px w-7 bg-primary/60" />
              Get Started Today
            </motion.span>

            <motion.h2 variants={fadeUp} className="relative font-display leading-[1.04] text-white tracking-display" style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4rem)' }}>
              Ready for Your<br />
              <span className="text-primary">Best Smile?</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="mt-6 max-w-md font-body text-base text-white/55 leading-relaxed">
              Take the first step towards a healthier, more confident smile. Book your consultation today — our team is here to help every step of the way.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/appointments"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-9 py-4 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-primary/40 active:scale-[0.98]"
              >
                Book Appointment
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight />
                </span>
              </Link>
              <a
                href={`tel:${displayPhone.replace(/-/g, '')}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/14 px-9 py-4 font-heading text-sm font-semibold text-white/75 transition-all hover:border-white/28 hover:text-white active:scale-[0.98]"
              >
                <PhoneIcon />
                {displayPhone}
              </a>
            </motion.div>

            {/* Trust micro-row */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              {['NMC Registered', 'Call Before You Commit', 'No Hidden Charges'].map((item) => (
                <span key={item} className="flex items-center gap-2 font-body text-xs text-white/35">
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 flex-shrink-0 text-primary/70" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Hours + location */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative border-l border-white/6 px-8 py-20 sm:px-12 lg:px-14 lg:py-28"
          >
            {/* Subtle right-side glow */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/[0.02] to-transparent" aria-hidden="true" />

            <h3 className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/50 mb-6">
              Opening Hours
            </h3>

            <div className="space-y-4 mb-10">
              {displayHours.map((slot) => (
                <div key={slot.days} className="flex items-center justify-between border-b border-white/6 pb-4">
                  <span className="font-body text-sm text-white/60">{slot.days}</span>
                  <span className="font-heading text-sm font-semibold text-white">
                    {('open' in slot && !slot.open) ? 'Closed' : slot.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
                Location
              </h3>
              <p className="font-body text-sm text-white/60 leading-relaxed">{displayAddress}</p>
              {displayMapsUrl && (
                <a
                  href={displayMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-primary transition-all hover:text-primary-light"
                >
                  Get Directions <ArrowRight />
                </a>
              )}
            </div>

            <div>
              <h3 className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
                Contact
              </h3>
              <div className="space-y-2.5">
                <a href={`tel:${displayPhone}`} className="flex items-center gap-2.5 font-body text-sm text-white/60 transition-colors hover:text-white">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" aria-hidden="true">
                    <path d="M2 2.5h2.5l1 2.5-1.5 1a8 8 0 004 4l1-1.5 2.5 1V12a1 1 0 01-1 1C5.5 13 2 8.5 2 3.5A1 1 0 012 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {displayPhone}
                </a>
                <a href={`mailto:${displayEmail}`} className="flex items-center gap-2.5 font-body text-sm text-white/60 transition-colors hover:text-white">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" aria-hidden="true">
                    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M1.5 6l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  {displayEmail}
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
