'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PATIENT_JOURNEY_STATIC } from '@/lib/constants'

const STEP_ICONS: Record<string, React.ReactNode> = {
  book: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h16M8 2v4M14 2v4M8 14h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  consult: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  diagnose: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="2" width="11" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 7h4M7 10h4M7 13h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M19 19l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 9h8M7 12h5M7 15h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  treat: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 11l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  followup: (
    <svg viewBox="0 0 22 22" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M19 11A8 8 0 113 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19 7v4h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

// Map step numbers to arrival, consultation, treatment, follow-up language
const ARRIVAL_LABELS: Record<number, { label: string; sublabel: string }> = {
  1: { label: 'Arrival', sublabel: 'Your welcome begins' },
  2: { label: 'Consultation', sublabel: 'We listen first' },
  3: { label: 'Diagnosis', sublabel: 'Clarity through expertise' },
  4: { label: 'Your Plan', sublabel: 'Designed around you' },
  5: { label: 'Treatment', sublabel: 'Comfortable precision' },
  6: { label: 'Follow-Up', sublabel: 'We stay with you' },
}

export default function PatientJourneySection() {
  const steps = PATIENT_JOURNEY_STATIC.filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ background: 'linear-gradient(155deg, #081912 0%, #0D2318 50%, #0a1e14 100%)' }}
    >
      {/* Architectural grid overlay */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]" aria-hidden="true">
        <defs>
          <pattern id="journey-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#journey-grid)" />
      </svg>

      {/* Accent glows */}
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-teal/6 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mb-4 inline-flex items-center gap-3 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-primary">
              <span className="inline-block h-px w-7 bg-primary/60" />
              The Experience
            </span>
            <h2 className="font-display text-4xl leading-[1.06] text-white sm:text-5xl lg:text-6xl tracking-display">
              A Day at<br />
              <span className="text-primary">Bright Smile</span>
            </h2>
            <p className="mt-4 max-w-lg font-body text-base text-white/50 leading-relaxed">
              From your first call to your final follow-up — every moment is crafted around your comfort, clarity, and confidence.
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
              className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              Start Your Journey
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Steps — two rows of 3 */}
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.slice(0, 3).map((step, i) => {
              const arrival = ARRIVAL_LABELS[step.step] ?? { label: step.title, sublabel: step.subtitle }
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
                  className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.07]"
                >
                  {/* Large ghost step number */}
                  <span className="pointer-events-none absolute right-4 top-2 select-none font-display text-8xl font-bold leading-none text-white/[0.035] group-hover:text-primary/[0.06] transition-colors duration-400" aria-hidden="true">
                    {step.step}
                  </span>

                  {/* Step indicator row */}
                  <div className="relative mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary/25 transition-colors">
                      {STEP_ICONS[step.id]}
                    </div>
                    <span className="rounded-full bg-white/8 px-2.5 py-1 font-heading text-[0.58rem] font-bold uppercase tracking-[0.15em] text-white/40 group-hover:text-white/60 transition-colors">
                      {arrival.label}
                    </span>
                  </div>

                  <h3 className="relative font-heading text-[0.95rem] font-semibold text-white">{step.title}</h3>
                  <p className="relative mt-1 mb-3 font-heading text-xs font-medium text-primary/70">{arrival.sublabel}</p>
                  <p className="relative font-body text-sm text-white/45 leading-relaxed group-hover:text-white/55 transition-colors">{step.description}</p>

                  {/* Connector dot (desktop) — bottom center */}
                  <div className="absolute -bottom-0.5 left-1/2 hidden h-1 w-1 -translate-x-1/2 rounded-full bg-primary/30 sm:block" aria-hidden="true" />
                </motion.div>
              )
            })}
          </div>

          {/* Connector arrow */}
          <div className="hidden items-center justify-center py-2 lg:flex" aria-hidden="true">
            <div className="flex items-center gap-4 text-primary/20">
              <div className="h-px w-40 bg-gradient-to-r from-transparent to-primary/30" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/8">
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 rotate-90 text-primary/50">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="h-px w-40 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.slice(3, 6).map((step, i) => {
              const arrival = ARRIVAL_LABELS[step.step] ?? { label: step.title, sublabel: step.subtitle }
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
                  className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.1]"
                >
                  {/* Large ghost step number */}
                  <span className="pointer-events-none absolute right-4 top-2 select-none font-display text-8xl font-bold leading-none text-primary/[0.06] group-hover:text-primary/[0.1] transition-colors duration-400" aria-hidden="true">
                    {step.step}
                  </span>

                  {/* Step indicator row */}
                  <div className="relative mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary group-hover:bg-primary/30 transition-colors">
                      {STEP_ICONS[step.id]}
                    </div>
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 font-heading text-[0.58rem] font-bold uppercase tracking-[0.15em] text-primary/80">
                      {arrival.label}
                    </span>
                  </div>

                  <h3 className="relative font-heading text-[0.95rem] font-semibold text-white">{step.title}</h3>
                  <p className="relative mt-1 mb-3 font-heading text-xs font-medium text-primary">{arrival.sublabel}</p>
                  <p className="relative font-body text-sm text-white/50 leading-relaxed group-hover:text-white/60 transition-colors">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-8 py-7 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          <div>
            <p className="font-heading text-sm font-semibold text-white">Ready to start your journey?</p>
            <p className="mt-1 font-body text-xs text-white/40">
              Our team answers questions before you book — no commitment needed.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="tel:+97714419594"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-5 py-2.5 font-heading text-xs font-semibold text-white/70 transition-all hover:border-white/22 hover:text-white"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M2 2.5a1 1 0 011-1h1.8a1 1 0 01.97.76l.56 2.24a1 1 0 01-.4.99l-.83.56a8.2 8.2 0 003.8 3.8l.56-.83a1 1 0 01.99-.4l2.24.56a1 1 0 01.76.97V12a1 1 0 01-1 1h-1C6 13 2 9 2 4V2.5z" />
              </svg>
              Call Us
            </a>
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
            >
              Book Online
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
