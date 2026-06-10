'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, slideInRight } from '@/lib/animations'
import { CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'

const trustPoints = [
  'NMC Registered Doctors',
  'Modern Equipment',
  'Gentle & Caring',
  'No Hidden Costs',
]

function ToothIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden="true">
      <path
        d="M16 4C12 4 8 8 8 14c0 4 1.5 7 2 10 .5 3 1 6 2 9 .5 2 1.5 3 2.5 3s2-.5 2.5-2c.5-1.5 1-4 1-6 0-1.5.5-2.5 2-3 .5 0 1-.5 2-.5s1.5.5 2 .5c1.5.5 2 1.5 2 3 0 2 .5 4.5 1 6 .5 1.5 1.5 2 2.5 2s2-1 2.5-3c1-3 1.5-6 2-9 .5-3 2-6 2-10 0-6-4-10-8-10-2 0-3.5.5-5 2C21.5 4.5 20 4 18 4c-.7 0-1.4 0-2 0z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#4A9B6F" fillOpacity="0.15" />
      <path d="M5 8l2 2 4-4" stroke="#4A9B6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <section className="relative overflow-hidden bg-white flex items-center py-16 lg:min-h-[88vh] lg:py-0">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-48 -top-48 h-[700px] w-[700px] rounded-full bg-tint opacity-70" />
        <div className="absolute -left-24 bottom-0 h-[500px] w-[500px] rounded-full bg-tint opacity-50" />
        <div className="absolute right-[30%] top-[20%] h-3 w-3 rounded-full bg-primary opacity-30" />
        <div className="absolute left-[20%] top-[15%] h-2 w-2 rounded-full bg-primary opacity-20" />
        <div className="absolute right-[15%] bottom-[20%] h-4 w-4 rounded-full bg-primary opacity-15" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[58fr_42fr]">

          {/* ── Left: Main content ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={fadeUp} className="eyebrow mb-5 inline-flex items-center gap-2">
              <span className="inline-block h-1 w-6 rounded-full bg-primary" />
              Kathmandu&apos;s Trusted Dental Care
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-display text-[3.2rem] leading-[1.05] tracking-display text-dark sm:text-[4rem] lg:text-[4.5rem]"
            >
              Creating Smiles,{' '}
              <span className="text-primary">Changing Lives</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl font-body text-lg leading-relaxed text-gray-500"
            >
              Professional, compassionate dental care for your whole family. From routine
              check-ups to advanced treatments — your comfort and health are our priority.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href="/appointments"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary-dark hover:shadow-primary/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Book an Appointment
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight />
                </span>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-8 py-4 font-heading text-sm font-semibold text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-primary hover:text-primary active:scale-[0.98]"
              >
                Explore Services
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-x-5 gap-y-2.5"
            >
              {trustPoints.map((point) => (
                <span key={point} className="flex items-center gap-2 font-body text-sm text-gray-600">
                  <CheckIcon />
                  {point}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Clinic info card ── */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="lg:ml-4"
          >
            <div className="relative overflow-hidden rounded-3xl bg-dark p-8 shadow-2xl shadow-dark/20 md:p-10">

              {/* Decorative circle inside card */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5" aria-hidden="true" />

              {/* Icon badge */}
              <div className="relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <ToothIcon />
              </div>

              <p className="relative font-display text-2xl text-white leading-snug">
                Ready for a<br />
                <span className="text-primary">healthier smile?</span>
              </p>
              <p className="relative mt-2 font-body text-sm text-white/50">
                We&apos;re accepting new patients — book your visit today.
              </p>

              <div className="relative mt-8 space-y-4">
                <a
                  href={`tel:${CLINIC_CONTACT.phone.replace(/-/g, '')}`}
                  className="group flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 font-body text-sm text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <span className="text-primary"><PhoneIcon /></span>
                  <span>{CLINIC_CONTACT.phone}</span>
                </a>

                <div className="flex items-start gap-3 rounded-xl bg-white/8 px-4 py-3 font-body text-sm text-white/70">
                  <span className="mt-0.5 text-primary"><ClockIcon /></span>
                  <div>
                    {OPENING_HOURS.map((h) => (
                      <div key={h.days} className="flex justify-between gap-4">
                        <span>{h.days}</span>
                        <span className="font-medium text-white/90">{h.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 font-body text-sm text-white/70">
                  <span className="text-primary"><LocationIcon /></span>
                  <span>{CLINIC_CONTACT.addressFull}</span>
                </div>
              </div>

              <div className="relative mt-7">
                <Link
                  href="/appointments"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-heading text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.98]"
                >
                  Book Appointment
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
