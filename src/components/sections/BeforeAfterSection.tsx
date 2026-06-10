'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { stagger, fadeUp, liftIn } from '@/lib/animations'
import { BEFORE_AFTER_STATIC, type BeforeAfterCategory } from '@/lib/constants'

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

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function BeforeAfterSection() {
  const [activeCategory, setActiveCategory] = useState<BeforeAfterCategory | 'all'>('all')
  const allCases = BEFORE_AFTER_STATIC.filter((c) => c.visible).sort((a, b) => a.sortOrder - b.sortOrder)
  const filtered = activeCategory === 'all' ? allCases : allCases.filter((c) => c.category === activeCategory)

  return (
    <section className="bg-dark py-24 lg:py-32">
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
            <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2 text-primary/70">
              <span className="inline-block h-px w-5 bg-primary" />
              Results
            </motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl text-white sm:text-5xl tracking-display">
              Before & After
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-lg font-body text-base text-white/50 leading-relaxed">
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
                  : 'border border-white/10 text-white/50 hover:border-white/25 hover:text-white/80'
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
                className="group overflow-hidden rounded-2xl border border-white/8 bg-white/5"
              >
                {/* Before / After visual */}
                <div className="relative h-52 overflow-hidden">
                  {/* Before half */}
                  <div
                    className="absolute inset-y-0 left-0 w-1/2"
                    style={{ background: `linear-gradient(135deg, ${item.beforeGradient}, ${item.beforeGradient}cc)` }}
                    aria-hidden="true"
                  >
                    <div className="absolute bottom-3 left-3 rounded-full bg-white/10 px-2 py-1 font-heading text-[0.55rem] font-bold text-white/60 backdrop-blur-sm tracking-wider">
                      BEFORE
                    </div>
                  </div>

                  {/* After half */}
                  <div
                    className="absolute inset-y-0 right-0 w-1/2"
                    style={{ background: `linear-gradient(135deg, ${item.afterGradient}cc, ${item.afterGradient})` }}
                    aria-hidden="true"
                  >
                    <div className="absolute bottom-3 right-3 rounded-full bg-primary/30 px-2 py-1 font-heading text-[0.55rem] font-bold text-primary-foreground backdrop-blur-sm tracking-wider">
                      AFTER
                    </div>
                  </div>

                  {/* Center divider */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/20" aria-hidden="true" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/20" aria-hidden="true">
                    <span className="font-heading text-[0.5rem] font-black text-white/70">B|A</span>
                  </div>

                  {/* Photo placeholder overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60">
                      <CameraIcon />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-white/70 backdrop-blur-sm">
                      <LockIcon />
                      <span className="font-heading text-[0.6rem] font-semibold">Photos coming soon</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="inline-block mb-2 rounded-full bg-primary/15 px-2.5 py-1 font-heading text-[0.6rem] font-semibold text-primary tracking-wide uppercase">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  <h3 className="font-heading text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 font-body text-xs text-white/40 leading-relaxed">{item.treatmentDetails}</p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-white/30" aria-hidden="true">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                      <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <span className="font-body text-[0.65rem] text-white/30">Treatment duration: {item.duration}</span>
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
          className="mt-10 text-center font-body text-xs text-white/25"
        >
          Patient photos are uploaded by our clinical team with full written consent. All cases are genuine.
        </motion.p>

      </div>
    </section>
  )
}
