'use client'

import { motion } from 'framer-motion'
import { stagger, fadeUp } from '@/lib/animations'
import { pick } from '@/lib/content-client'
import type { TrustIndicatorRow } from '@/lib/content'

export default function TrustSection({
  content,
  indicators,
}: {
  content: Record<string, string>
  indicators: TrustIndicatorRow[]
}) {
  return (
    <section className="relative bg-white py-24 lg:py-36">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Asymmetric split grid */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-20">

          {/* Left — manifesto */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow mb-6 inline-flex items-center gap-2.5">
              <span className="inline-block h-px w-6 bg-primary/50" />
              {pick(content, 'home.trust.eyebrow', 'Why Patients Trust Us')}
            </span>
            <h2 className="font-display text-5xl text-dark tracking-display leading-[1.04] sm:text-6xl lg:text-[4.5rem]">
              {pick(content, 'home.trust.heading_line1', 'Care you can')}
              <br />
              {pick(content, 'home.trust.heading_line2', 'count on.')}
              <br />
              <span className="text-primary">{pick(content, 'home.trust.heading_line3', 'Since 2013.')}</span>
            </h2>
            <p className="mt-8 max-w-md font-body text-base text-gray-500 leading-relaxed">
              {pick(content, 'home.trust.intro', 'Serving Kathmandu for over a decade — 1,000+ patients, 6 specialists, one commitment: exceptional care every visit.')}
            </p>
          </motion.div>

          {/* Right — 4 pillars in 2×2 grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 gap-x-10 gap-y-10 lg:pt-8"
          >
            {indicators.map((item) => (
              <motion.div key={item.id} variants={fadeUp}>
                <div className="h-px w-8 bg-primary" />
                <h3 className="mt-4 font-heading text-sm font-semibold text-dark">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* Bottom line */}
        <div className="mt-16 border-t border-gray-100 pt-8">
          <p className="font-body text-sm text-gray-600">
            {pick(content, 'home.trust.bottom_line', 'Serving Kathmandu since 2013 — Over 1,000 patients trust us with their smiles.')}
          </p>
        </div>

      </div>
    </section>
  )
}
