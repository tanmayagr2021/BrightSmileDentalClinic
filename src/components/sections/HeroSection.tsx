'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, slideInRight } from '@/lib/animations'
import { CLINIC_CONTACT, OPENING_HOURS, DOCTORS_STATIC } from '@/lib/constants'

const leadDoctors = DOCTORS_STATIC.filter((d) => d.type === 'lead')

const trustPoints = [
  'NMC Registered Doctors',
  'Modern Equipment',
  'Gentle & Caring',
  'Transparent Pricing',
]

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#4A9B6F" fillOpacity="0.15" />
      <path d="M5 8l2 2 4-4" stroke="#4A9B6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" fill="currentColor" fillOpacity="0.7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" fillOpacity="0.7" />
    </svg>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white flex items-center py-20 lg:min-h-[90vh] lg:py-0">
      {/* Decorative mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-64 -top-64 h-[800px] w-[800px] rounded-full bg-tint opacity-60" />
        <div className="absolute -left-32 bottom-0 h-[600px] w-[600px] rounded-full bg-tint opacity-40" />
        {/* Grid dots */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#1A3D2B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        {/* Accent blobs */}
        <div className="absolute right-[28%] top-[18%] h-4 w-4 rounded-full bg-primary opacity-20" />
        <div className="absolute left-[15%] top-[22%] h-3 w-3 rounded-full bg-primary opacity-15" />
        <div className="absolute right-[12%] bottom-[25%] h-5 w-5 rounded-full bg-primary opacity-10" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[58fr_42fr]">

          {/* ── Left: Main content ── */}
          <motion.div variants={stagger} initial="hidden" animate="visible">

            <motion.span variants={fadeUp} className="eyebrow mb-5 inline-flex items-center gap-2">
              <span className="inline-block h-1 w-6 rounded-full bg-primary" />
              Kathmandu&apos;s Trusted Dental Care
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-display text-[3.4rem] leading-[1.03] tracking-display text-dark sm:text-[4.5rem] lg:text-[5.2rem]"
            >
              Creating Smiles,{' '}
              <br className="hidden sm:block" />
              <span className="text-primary">Changing Lives</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg font-body text-[1.05rem] leading-relaxed text-gray-500"
            >
              Professional, compassionate dental care for your whole family — from
              routine check-ups to advanced treatments. Your comfort and health are
              our priority.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href="/appointments"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-dark hover:shadow-primary/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Book an Appointment
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight />
                </span>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-8 py-4 font-heading text-sm font-semibold text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:text-primary active:scale-[0.98]"
              >
                Explore Services
              </Link>
            </motion.div>

            {/* Trust bullets */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2"
            >
              {trustPoints.map((point) => (
                <span key={point} className="flex items-center gap-2 font-body text-sm text-gray-600">
                  <CheckIcon />
                  {point}
                </span>
              ))}
            </motion.div>

            {/* Lead Doctors Strip */}
            <motion.div variants={fadeUp} className="mt-10">
              <p className="mb-3 font-heading text-[0.7rem] font-semibold uppercase tracking-widest text-gray-400">
                Your Lead Dentists
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {leadDoctors.map((doc) => (
                  <div
                    key={doc.slug}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: doc.color }}
                    >
                      {doc.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-sm font-semibold text-dark leading-tight">
                        {doc.name}
                      </p>
                      <p className="font-body text-xs text-gray-500 leading-tight mt-0.5">
                        {doc.qualification} · {doc.experience}
                      </p>
                    </div>
                    <span className="ml-auto flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-heading text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
                      Bookable
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Booking card ── */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="lg:ml-6"
          >
            <div className="relative overflow-hidden rounded-3xl bg-dark p-8 shadow-2xl shadow-dark/25 md:p-10">
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/5" aria-hidden="true" />

              {/* Header */}
              <div className="relative">
                <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-white/40">
                  Ready to Book?
                </p>
                <h2 className="mt-2 font-display text-2xl text-white leading-snug">
                  Your smile starts<br />
                  <span className="text-primary">with a conversation.</span>
                </h2>
                <p className="mt-2 font-body text-sm text-white/50">
                  Appointments available with our lead dentists.
                </p>
              </div>

              {/* Doctor quick-select */}
              <div className="relative mt-7 space-y-3">
                {leadDoctors.map((doc) => (
                  <Link
                    key={doc.slug}
                    href="/appointments"
                    className="group flex items-center gap-4 rounded-2xl bg-white/8 px-4 py-3.5 transition-all hover:bg-white/14"
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-white/15"
                      style={{ backgroundColor: doc.color }}
                    >
                      {doc.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-semibold text-white leading-tight">
                        {doc.name}
                      </p>
                      <p className="font-body text-xs text-white/50 leading-tight mt-0.5">
                        {doc.role}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-white/30 transition-all group-hover:text-primary group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>

              {/* Contact + Hours */}
              <div className="relative mt-7 space-y-3">
                <a
                  href={`tel:${CLINIC_CONTACT.phone.replace(/-/g, '')}`}
                  className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 font-body text-sm text-white/70 transition-colors hover:bg-white/14 hover:text-white"
                >
                  <span className="text-primary"><PhoneIcon /></span>
                  {CLINIC_CONTACT.phone}
                </a>
                <div className="flex items-start gap-3 rounded-xl bg-white/8 px-4 py-3 font-body text-sm text-white/70">
                  <span className="mt-0.5 text-primary"><ClockIcon /></span>
                  <div className="space-y-0.5">
                    {OPENING_HOURS.map((h) => (
                      <div key={h.days} className="flex justify-between gap-4">
                        <span className="text-white/50">{h.days}</span>
                        <span className="font-medium text-white/85">{h.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 font-body text-sm text-white/70">
                  <span className="text-primary"><LocationIcon /></span>
                  {CLINIC_CONTACT.addressFull}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
