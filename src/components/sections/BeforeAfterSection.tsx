'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { stagger, fadeUp, liftIn } from '@/lib/animations'
import { BEFORE_AFTER_STATIC, type BeforeAfterCategory } from '@/lib/constants'
import { useTrackViewOnce } from '@/hooks/useTrackViewOnce'

const CATEGORY_LABELS: Record<BeforeAfterCategory | 'all', string> = {
  all: 'All Cases',
  'smile-makeover': 'Smile Makeover',
  orthodontics: 'Orthodontics',
  whitening: 'Whitening',
  implants: 'Implants',
}

const CATEGORY_ORDER: Array<BeforeAfterCategory | 'all'> = [
  'all',
  'smile-makeover',
  'orthodontics',
  'whitening',
  'implants',
]


export default function BeforeAfterSection() {
  const [activeCategory, setActiveCategory] = useState<BeforeAfterCategory | 'all'>('all')
  const allCases = BEFORE_AFTER_STATIC.filter((c) => c.visible).sort((a, b) => a.sortOrder - b.sortOrder)
  const filtered = activeCategory === 'all' ? allCases : allCases.filter((c) => c.category === activeCategory)
  const viewRef = useTrackViewOnce<HTMLElement>('Before/After Viewed')

  return (
    <section ref={viewRef} className="bg-dark py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <motion.span variants={fadeUp} className="mb-3 inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.15em] text-gold">
              <span className="inline-block h-px w-5 bg-gold/60" />
              Results
            </motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl text-white sm:text-5xl tracking-display">
              Before & After
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-lg font-body text-base text-white/85 leading-relaxed">
              Real transformations from our patients. Photos will be added as patients provide consent — check back soon.
            </motion.p>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-heading text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
            >
              Book a Consultation
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap gap-2"
        >
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 font-heading text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'border border-white/10 text-white/75 hover:border-white/25 hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </motion.div>

        {/* Cases grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={liftIn}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                {/* Before / After visual */}
                <div className="relative h-52 overflow-hidden">
                  {/* Before half */}
                  <div
                    className="absolute inset-y-0 left-0 w-1/2"
                    style={{ background: `linear-gradient(160deg, ${item.beforeGradient} 0%, #1a0f0f 100%)` }}
                    aria-hidden="true"
                  >
                    {/* Decorative depth circle */}
                    <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-1 font-heading text-[0.65rem] font-bold tracking-[0.12em] text-white/85 backdrop-blur-sm">
                      BEFORE
                    </div>
                  </div>

                  {/* After half */}
                  <div
                    className="absolute inset-y-0 right-0 w-1/2"
                    style={{ background: `linear-gradient(160deg, #0a0f1d 0%, ${item.afterGradient} 100%)` }}
                    aria-hidden="true"
                  >
                    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(74,155,111,0.5) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-3 right-3 rounded-full bg-primary/20 px-2.5 py-1 font-heading text-[0.65rem] font-bold tracking-[0.12em] text-primary backdrop-blur-sm border border-primary/20">
                      AFTER
                    </div>
                  </div>

                  {/* Center divider */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10" aria-hidden="true" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-md ring-1 ring-white/15" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-white/50" aria-hidden="true">
                      <path d="M5 4l-3 4 3 4M11 4l3 4-3 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Premium "coming soon" overlay — always visible, not just on hover */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-2.5 pb-6 pt-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 backdrop-blur-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span className="font-heading text-[0.65rem] font-semibold tracking-[0.08em] text-white/85">Photos — Awaiting Patient Consent</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="inline-block mb-2 rounded-full bg-primary/15 px-2.5 py-1 font-heading text-[0.65rem] font-semibold text-primary tracking-wide uppercase">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  <h3 className="font-heading text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 font-body text-xs text-white/80 leading-relaxed">{item.treatmentDetails}</p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-white/30" aria-hidden="true">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                      <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <span className="font-body text-[0.65rem] text-white/75">Treatment duration: {item.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom note */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 text-center font-body text-xs text-white/80"
        >
          Patient photos are uploaded by our clinical team with full written consent. All cases are genuine.
        </motion.p>

      </div>
    </section>
  )
}
