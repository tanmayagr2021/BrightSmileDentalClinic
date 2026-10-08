'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, blurFadeIn } from '@/lib/animations'
import { TOUR_SCENES, TOUR_START, getTourScene } from '@/data/virtual-tour'
import PanoramaModalLoader from './PanoramaModalLoader'

export default function VirtualTourExperience({
  variant = 'standalone',
}: {
  /** 'embedded' drops the full-page hero/background so this can sit inside another page (the Gallery page). */
  variant?: 'standalone' | 'embedded'
}) {
  const [startSceneId, setStartSceneId] = useState<string | null>(null)
  const embedded = variant === 'embedded'
  const prefersReducedMotion = useReducedMotion()
  // Embedded mode nests inside the Gallery page (which owns the page's h1),
  // so this section's heading must step down to h2 to keep a valid outline.
  const Heading = embedded ? motion.h2 : motion.h1
  const start = getTourScene(TOUR_START) ?? TOUR_SCENES[0]

  const content = (
    <>
      <section className={embedded ? 'relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8' : 'relative overflow-hidden px-6 pb-12 pt-32 sm:pt-40'}>
        {!embedded && (
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold blur-[160px]" />
          </div>
        )}
        <div className={embedded ? 'relative max-w-2xl' : 'relative mx-auto max-w-4xl text-center'}>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="eyebrow-dark mb-4 font-heading text-xs font-semibold uppercase tracking-[0.25em] text-gold-ink"
          >
            Virtual Tour
          </motion.p>
          <Heading
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={blurFadeIn}
            className={embedded ? 'font-display text-3xl text-ink sm:text-4xl' : 'font-display text-4xl text-ink sm:text-5xl md:text-6xl'}
          >
            Step Inside Our Clinic
          </Heading>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className={embedded ? 'mt-4 max-w-xl font-body text-sm text-ink-muted' : 'mx-auto mt-5 max-w-xl font-body text-base text-ink-muted'}
          >
            Walk from the front desk through the lounge and into each of our three treatment rooms, so the place feels familiar before your first visit.
          </motion.p>
        </div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className={embedded ? 'relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8' : 'relative mx-auto max-w-6xl px-4 pb-28 sm:px-6'}
      >
        {/* The way in: one wide window onto the first scene. */}
        <button
          type="button"
          onClick={() => setStartSceneId(start.id)}
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:aspect-[21/9]"
          aria-label={`Start the virtual tour at ${start.name}`}
        >
          <Image
            src={start.src}
            alt={`${start.name} at Bright Smile Dental Clinic`}
            fill
            priority={!embedded}
            sizes="(max-width: 1280px) 100vw, 1200px"
            className={`object-cover transition-transform duration-[1200ms] ease-out ${prefersReducedMotion ? '' : 'group-hover:scale-[1.03]'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/85 via-[#0A1128]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <p className="font-heading text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold/90">Starts at</p>
              <p className="mt-1 font-display text-2xl text-white sm:text-3xl">{start.name}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 font-heading text-sm font-semibold text-[#0A1128] transition-all duration-300 group-hover:gap-3 group-hover:bg-gold-light">
              Start the tour
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </button>

        {/* Secondary: drop straight into a particular room. */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-body text-xs text-ink-muted">Or start in</span>
          {TOUR_SCENES.filter((s) => s.id !== start.id).map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => setStartSceneId(scene.id)}
              className="rounded-full border border-ink/20 px-3.5 py-2 font-heading text-[0.7rem] font-semibold text-ink-muted transition-colors hover:border-gold/50 hover:text-gold-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {scene.name}
            </button>
          ))}
        </div>
      </motion.section>

      {startSceneId && <PanoramaModalLoader startSceneId={startSceneId} onClose={() => setStartSceneId(null)} />}
    </>
  )

  if (embedded) return content

  return (
    <div className="min-h-screen bg-ivory-page">
      {content}
    </div>
  )
}
