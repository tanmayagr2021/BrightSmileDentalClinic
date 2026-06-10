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

export default function CtaSection() {
  return (
    <section className="overflow-hidden bg-dark py-0">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left — CTA */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative overflow-hidden px-8 py-20 sm:px-12 lg:px-16 lg:py-24"
          >
            {/* Background blobs */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/10" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary/5" aria-hidden="true" />

            <motion.span variants={fadeUp} className="eyebrow mb-4 inline-flex items-center gap-2 text-primary">
              <span className="inline-block h-px w-5 bg-primary" />
              Get Started Today
            </motion.span>

            <motion.h2 variants={fadeUp} className="font-display text-4xl leading-tight text-white sm:text-5xl tracking-display">
              Ready for Your<br />
              <span className="text-primary">Best Smile?</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="mt-5 max-w-md font-body text-base text-white/60 leading-relaxed">
              Take the first step towards a healthier, more confident smile. Book your consultation today — we&apos;re here to help.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/appointments"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-primary/40 active:scale-[0.98]"
              >
                Book Appointment
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight />
                </span>
              </Link>
              <a
                href={`tel:${CLINIC_CONTACT.phone.replace(/-/g, '')}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-8 py-4 font-heading text-sm font-semibold text-white/80 transition-all hover:border-white/30 hover:text-white active:scale-[0.98]"
              >
                <PhoneIcon />
                {CLINIC_CONTACT.phone}
              </a>
            </motion.div>
          </motion.div>

          {/* Right — Opening hours */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="border-l border-white/8 px-8 py-20 sm:px-12 lg:px-16 lg:py-24"
          >
            <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-white/40">
              Opening Hours
            </h3>

            <div className="mt-6 space-y-4">
              {OPENING_HOURS.map((slot) => (
                <div key={slot.days} className="flex items-center justify-between border-b border-white/8 pb-4">
                  <span className="font-body text-sm text-white/70">{slot.days}</span>
                  <span className="font-heading text-sm font-semibold text-white">{slot.hours}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-white/40">
                Location
              </h3>
              <p className="mt-3 font-body text-sm text-white/70">{CLINIC_CONTACT.addressFull}</p>
              {CLINIC_CONTACT.googleMapsUrl && (
                <a
                  href={CLINIC_CONTACT.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-primary hover:text-primary-dark"
                >
                  Get Directions <ArrowRight />
                </a>
              )}
            </div>

            <div className="mt-8">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-white/40">
                Contact
              </h3>
              <div className="mt-3 space-y-2">
                <a href={`tel:${CLINIC_CONTACT.phone}`} className="block font-body text-sm text-white/70 transition-colors hover:text-white">
                  {CLINIC_CONTACT.phone}
                </a>
                <a href={`mailto:${CLINIC_CONTACT.emailAppointments}`} className="block font-body text-sm text-white/70 transition-colors hover:text-white">
                  {CLINIC_CONTACT.emailAppointments}
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
