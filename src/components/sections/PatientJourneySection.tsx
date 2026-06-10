'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { stagger, fadeUp, blurFadeIn } from '@/lib/animations'
import { PATIENT_JOURNEY_STATIC } from '@/lib/constants'

const STEP_ICONS: Record<string, React.ReactNode> = {
  book: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h14M7 2v4M13 2v4M7 13h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  consult: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  diagnose: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="2" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6h3M7 9h3M7 12h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="15.5" cy="15.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M17.5 17.5l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 8h6M7 11h4M7 14h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  treat: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  followup: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M17 10A7 7 0 113 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17 6v4h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function PatientJourneySection() {
  const steps = PATIENT_JOURNEY_STATIC.filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2">
              <span className="inline-block h-px w-5 bg-primary" />
              How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
              Your Journey to a Healthy Smile
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-lg font-body text-base text-gray-500 leading-relaxed">
              From your first call to your final follow-up, every step is designed around your comfort and confidence.
            </motion.p>
          </div>
          <motion.div variants={fadeUp} className="flex-shrink-0">
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              Start Your Journey
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        {/* Step grid — 3+3 with connector line */}
        <div className="space-y-4 lg:space-y-0">
          {/* Row 1: Steps 1–3 */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {steps.slice(0, 3).map((step) => (
              <motion.div
                key={step.id}
                variants={blurFadeIn}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                {/* Step number — large background */}
                <span className="pointer-events-none absolute right-5 top-3 font-display text-7xl font-bold text-gray-50 select-none leading-none" aria-hidden="true">
                  {step.step}
                </span>

                {/* Icon + badge row */}
                <div className="relative mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary group-hover:bg-primary/15 transition-colors">
                    {STEP_ICONS[step.id]}
                  </div>
                  <span className="rounded-full bg-dark px-2.5 py-0.5 font-heading text-[0.6rem] font-bold text-white/70 tracking-wide">
                    STEP {String(step.step).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="relative font-heading text-base font-semibold text-dark">{step.title}</h3>
                <p className="relative mt-1 mb-3 font-heading text-xs font-medium text-primary">{step.subtitle}</p>
                <p className="relative font-body text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Connector arrow row — desktop only */}
          <div className="hidden lg:flex items-center justify-center py-3" aria-hidden="true">
            <div className="flex items-center gap-3 text-gray-200">
              <div className="h-px w-32 bg-gradient-to-r from-transparent to-primary/30" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-tint">
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 rotate-90 text-primary/50">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="h-px w-32 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </div>

          {/* Row 2: Steps 4–6 */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {steps.slice(3, 6).map((step) => (
              <motion.div
                key={step.id}
                variants={blurFadeIn}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                {/* Step number — large background */}
                <span className="pointer-events-none absolute right-5 top-3 font-display text-7xl font-bold text-gray-50 select-none leading-none" aria-hidden="true">
                  {step.step}
                </span>

                {/* Icon + badge row */}
                <div className="relative mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary group-hover:bg-primary/15 transition-colors">
                    {STEP_ICONS[step.id]}
                  </div>
                  <span className="rounded-full bg-primary px-2.5 py-0.5 font-heading text-[0.6rem] font-bold text-white tracking-wide">
                    STEP {String(step.step).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="relative font-heading text-base font-semibold text-dark">{step.title}</h3>
                <p className="relative mt-1 mb-3 font-heading text-xs font-medium text-primary">{step.subtitle}</p>
                <p className="relative font-body text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/12 bg-tint px-7 py-6 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          <div>
            <p className="font-heading text-sm font-semibold text-dark">Ready to start your journey?</p>
            <p className="mt-0.5 font-body text-xs text-gray-500">
              Our team is here to answer any questions before you book.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="tel:+97714419594"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-heading text-xs font-semibold text-dark transition-all hover:border-primary hover:text-primary"
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
