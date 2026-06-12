'use client'

import { motion } from 'framer-motion'
import { stagger, liftIn } from '@/lib/animations'
import { TRUST_INDICATORS_STATIC } from '@/lib/constants'

const INDICATOR_CONFIG: Record<string, { gradient: string; iconBg: string; borderColor: string }> = {
  'nmc-registered': {
    gradient: 'from-primary/5 to-transparent',
    iconBg: 'bg-primary/10 text-primary',
    borderColor: 'border-t-primary/60',
  },
  'modern-technology': {
    gradient: 'from-teal/5 to-transparent',
    iconBg: 'bg-teal/10 text-teal',
    borderColor: 'border-t-teal/60',
  },
  'gentle-care': {
    gradient: 'from-primary/5 to-transparent',
    iconBg: 'bg-primary/10 text-primary',
    borderColor: 'border-t-primary/60',
  },
  'transparent-pricing': {
    gradient: 'from-dark/5 to-transparent',
    iconBg: 'bg-dark/8 text-dark',
    borderColor: 'border-t-dark/40',
  },
}

const icons: Record<string, () => React.ReactElement> = {
  'nmc-registered': () => (
    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M14 2L4 6.5v7c0 5.5 4.3 10.6 10 12 5.7-1.4 10-6.5 10-12v-7L14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 14l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'modern-technology': () => (
    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="5" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 21v2M19 21v2M7 23h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'gentle-care': () => (
    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M14 24s-9-5.5-9-12a6 6 0 0112 0 6 6 0 0112 0c0 6.5-9 12-9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'transparent-pricing': () => (
    <svg viewBox="0 0 28 28" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 8v2m0 8v2M10 14h4.5a1.5 1.5 0 010 3H10m0-3h3.5a1.5 1.5 0 000-3H10v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

export default function TrustSection() {
  const indicators = TRUST_INDICATORS_STATIC.filter((t) => t.visible).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section className="relative bg-white py-20 lg:py-28">
      {/* Section bridge — gradient from dark stats to white trust */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0A1F14]/10 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 text-center"
        >
          <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="inline-block h-px w-8 bg-primary/40" />
            Why Patients Trust Us
            <span className="inline-block h-px w-8 bg-primary/40" />
          </span>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {indicators.map((item) => {
            const Icon = icons[item.id]
            const config = INDICATOR_CONFIG[item.id] ?? {
              gradient: 'from-primary/5 to-transparent',
              iconBg: 'bg-primary/10 text-primary',
              borderColor: 'border-t-primary/60',
            }
            return (
              <motion.div
                key={item.id}
                variants={liftIn}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                className={`group relative flex flex-col items-start overflow-hidden rounded-2xl border border-gray-100 border-t-4 ${config.borderColor} bg-white p-7 shadow-card hover:shadow-card-hover transition-all duration-300`}
              >
                {/* Card gradient background */}
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} aria-hidden="true" />

                {/* Icon */}
                <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg} transition-transform duration-200 group-hover:scale-105`}>
                  {Icon && <Icon />}
                </div>

                <h3 className="relative font-heading text-[0.95rem] font-semibold text-dark leading-snug">
                  {item.title}
                </h3>
                <p className="relative mt-2.5 font-body text-sm leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 text-center font-body text-sm text-gray-400"
        >
          Serving Kathmandu since 2013 &mdash; Over 1,000 patients trust us with their smiles.
        </motion.p>

      </div>
    </section>
  )
}
