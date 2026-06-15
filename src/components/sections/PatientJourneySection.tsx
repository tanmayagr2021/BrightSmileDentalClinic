'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PATIENT_JOURNEY_STATIC } from '@/lib/constants'

const STEP_ICONS: Record<string, React.ReactNode> = {
  book: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 9h16M8 2v4M14 2v4M8 14h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  consult: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 20c0-3.9 3.1-7 7-7s7 3.1 7 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  diagnose: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="2" width="11" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 7h4M7 10h4M7 13h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M19 19l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 9h8M7 12h5M7 15h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  treat: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7.5 11l2.5 2.5 5-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  followup: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M19 11A8 8 0 113 11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M19 7v4h-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const ARRIVAL_LABELS: Record<number, { label: string; sublabel: string }> = {
  1: { label: 'Arrival', sublabel: 'Your welcome begins' },
  2: { label: 'Consultation', sublabel: 'We listen first' },
  3: { label: 'Diagnosis', sublabel: 'Clarity through expertise' },
  4: { label: 'Your Plan', sublabel: 'Designed around you' },
  5: { label: 'Treatment', sublabel: 'Comfortable precision' },
  6: { label: 'Follow-Up', sublabel: 'We stay with you' },
}

export default function PatientJourneySection() {
  const steps = PATIENT_JOURNEY_STATIC.filter((s) => s.visible).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )

  return (
    <section
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ background: '#0A1128' }}
    >
      {/* Architectural grid overlay */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
        aria-hidden="true"
      >
        <defs>
          <pattern id="journey-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#journey-grid)" />
      </svg>

      {/* Accent glows */}
      <div
        className="pointer-events-none absolute left-1/3 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-teal/6 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mb-4 inline-flex items-center gap-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="inline-block h-px w-7 bg-gold/60" />
              The Experience
            </span>
            <h2 className="font-display text-4xl leading-[1.06] text-white sm:text-5xl lg:text-6xl tracking-display">
              A Day at
              <br />
              <span className="text-gold">Bright Smile</span>
            </h2>
            <p className="mt-4 max-w-lg font-body text-base text-white/50 leading-relaxed">
              From your first call to your final follow-up — every moment is crafted around your
              comfort, clarity, and confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="flex-shrink-0"
          >
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gold px-7 py-3.5 font-heading text-sm font-semibold text-[#0A1128] shadow-button-gold transition-all hover:bg-gold-dark active:scale-[0.98]"
            >
              Start Your Journey
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Steps — 6 editorial columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, i) => {
            const arrival = ARRIVAL_LABELS[step.step] ?? {
              label: step.title,
              sublabel: step.subtitle,
            }
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                className="group relative border-l border-white/8 px-5 py-10 transition-all duration-300 first:border-l-0 hover:bg-white/[0.035] lg:px-6 lg:py-12"
              >
                {/* Ghost step number */}
                <span
                  className="pointer-events-none select-none font-display text-7xl font-bold leading-none text-white/[0.07] transition-colors duration-300 group-hover:text-primary/[0.12] lg:text-8xl"
                  aria-hidden="true"
                >
                  {String(step.step).padStart(2, '0')}
                </span>

                {/* Accent line */}
                <div className="mb-5 mt-6 h-px w-6 bg-primary/40 transition-all duration-300 group-hover:w-10 group-hover:bg-primary" />

                {/* Step icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  {STEP_ICONS[step.id]}
                </div>

                {/* Title */}
                <h3 className="mt-4 font-heading text-sm font-semibold leading-snug text-white">
                  {step.title}
                </h3>

                {/* Sublabel */}
                <p className="mt-1 font-heading text-[0.65rem] font-medium text-primary/70">
                  {arrival.sublabel}
                </p>

                {/* Description */}
                <p className="mt-3 font-body text-xs leading-relaxed text-white/65">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col items-start gap-4 border-t border-white/8 pt-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-heading text-sm font-semibold text-white">
              Ready to start your journey?
            </p>
            <p className="mt-1 font-body text-xs text-white/40">
              Our team answers questions before you book — no commitment needed.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <a
              href="tel:+97714419594"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-5 py-2.5 font-heading text-xs font-semibold text-white/70 transition-all hover:border-white/25 hover:text-white"
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M2 2.5a1 1 0 011-1h1.8a1 1 0 01.97.76l.56 2.24a1 1 0 01-.4.99l-.83.56a8.2 8.2 0 003.8 3.8l.56-.83a1 1 0 01.99-.4l2.24.56a1 1 0 01.76.97V12a1 1 0 01-1 1h-1C6 13 2 9 2 4V2.5z" />
              </svg>
              Call Us
            </a>
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-heading text-xs font-semibold text-[#0A1128] shadow-button-gold transition-all hover:bg-gold-dark"
            >
              Book Online
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
