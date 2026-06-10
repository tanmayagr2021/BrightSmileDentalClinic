'use client'

import { motion } from 'framer-motion'
import { fadeUp, stagger, scaleIn } from '@/lib/animations'
import { TRUST_INDICATORS_STATIC } from '@/lib/constants'

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
    <section className="bg-tint py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {indicators.map((item) => {
            const Icon = icons[item.id]
            return (
              <motion.div
                key={item.id}
                variants={scaleIn}
                className="flex flex-col items-start rounded-2xl bg-white p-7 shadow-sm shadow-gray-100 border border-white"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {Icon && <Icon />}
                </div>
                <h3 className="font-heading text-sm font-semibold text-dark">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 text-center font-body text-sm text-gray-400"
        >
          Serving Kathmandu since 2013 &mdash; Over 1,000 patients trust us with their smiles.
        </motion.p>

      </div>
    </section>
  )
}
