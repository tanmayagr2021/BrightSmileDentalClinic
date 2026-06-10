'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { SHOWCASE_SLIDES_STATIC } from '@/lib/constants'

const slides = SHOWCASE_SLIDES_STATIC.filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder)
const AUTO_ADVANCE_MS = 5000

// SVG room illustrations — minimal, cinematic
function RoomIllustration({ category }: { category: string }) {
  if (category === 'reception') {
    return (
      <svg viewBox="0 0 480 280" fill="none" className="h-full w-full opacity-20" aria-hidden="true">
        <rect x="60" y="160" width="180" height="80" rx="4" stroke="white" strokeWidth="1.5" />
        <rect x="80" y="130" width="140" height="30" rx="3" stroke="white" strokeWidth="1.5" />
        <rect x="100" y="140" width="60" height="15" rx="2" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1" />
        <rect x="280" y="120" width="120" height="120" rx="4" stroke="white" strokeWidth="1.5" />
        <rect x="295" y="135" width="40" height="50" rx="2" stroke="white" strokeWidth="1" />
        <line x1="0" y1="240" x2="480" y2="240" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="280" x2="480" y2="280" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="420" cy="60" r="30" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M406 60 l8 8 l16-16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
      </svg>
    )
  }
  if (category === 'waiting') {
    return (
      <svg viewBox="0 0 480 280" fill="none" className="h-full w-full opacity-20" aria-hidden="true">
        <rect x="40" y="170" width="70" height="60" rx="8" stroke="white" strokeWidth="1.5" />
        <rect x="40" y="150" width="70" height="25" rx="4" stroke="white" strokeWidth="1.5" />
        <rect x="140" y="170" width="70" height="60" rx="8" stroke="white" strokeWidth="1.5" />
        <rect x="140" y="150" width="70" height="25" rx="4" stroke="white" strokeWidth="1.5" />
        <rect x="240" y="170" width="70" height="60" rx="8" stroke="white" strokeWidth="1.5" />
        <rect x="240" y="150" width="70" height="25" rx="4" stroke="white" strokeWidth="1.5" />
        <path d="M380 230 C380 190 360 160 380 120 C390 100 410 90 420 120 L420 230" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="400" cy="110" rx="25" ry="30" stroke="white" strokeWidth="1.5" />
        <line x1="0" y1="230" x2="480" y2="230" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    )
  }
  if (category === 'treatment') {
    return (
      <svg viewBox="0 0 480 280" fill="none" className="h-full w-full opacity-20" aria-hidden="true">
        <path d="M80 200 L80 160 Q80 140 100 140 L260 140 Q300 140 300 180 L300 220 Q300 240 280 240 L120 240 Q80 240 80 200Z" stroke="white" strokeWidth="1.5" />
        <rect x="260" y="90" width="20" height="50" rx="4" stroke="white" strokeWidth="1.5" />
        <circle cx="270" cy="80" r="20" stroke="white" strokeWidth="1.5" />
        <rect x="300" y="120" width="100" height="60" rx="6" stroke="white" strokeWidth="1.5" />
        <rect x="310" y="130" width="80" height="40" rx="4" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="1" />
        <circle cx="60" cy="160" r="20" stroke="white" strokeWidth="1.5" />
        <line x1="0" y1="250" x2="480" y2="250" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    )
  }
  if (category === 'equipment') {
    return (
      <svg viewBox="0 0 480 280" fill="none" className="h-full w-full opacity-20" aria-hidden="true">
        <rect x="60" y="80" width="140" height="180" rx="8" stroke="white" strokeWidth="1.5" />
        <rect x="75" y="100" width="110" height="80" rx="4" fill="white" fillOpacity="0.06" stroke="white" strokeWidth="1" />
        <path d="M95 140 l15 0 l5 -15 l10 30 l10 -20 l10 15 l15 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="340" cy="140" r="70" stroke="white" strokeWidth="1.5" />
        <circle cx="340" cy="140" r="45" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M310 140 L370 140 M340 110 L340 170" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="340" cy="140" r="6" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1" />
      </svg>
    )
  }
  // team
  return (
    <svg viewBox="0 0 480 280" fill="none" className="h-full w-full opacity-20" aria-hidden="true">
      <circle cx="160" cy="110" r="42" stroke="white" strokeWidth="1.5" />
      <path d="M90 240 Q90 190 160 190 Q230 190 230 240" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="280" cy="120" r="36" stroke="white" strokeWidth="1.5" />
      <path d="M220 240 Q220 195 280 195 Q340 195 340 240" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="390" cy="115" r="30" stroke="white" strokeWidth="1.5" />
      <path d="M340 240 Q340 200 390 200 Q440 200 440 240" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function ShowcaseSection() {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length)
  }, [])

  const goTo = (i: number) => {
    setActive(i)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      if (!isPaused) {
        intervalRef.current = setInterval(advance, AUTO_ADVANCE_MS)
      }
    }
  }

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(advance, AUTO_ADVANCE_MS)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, advance])

  const current = slides[active]
  if (!current) return null

  return (
    <section
      className="bg-dark py-24 lg:py-32"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Clinic Showcase"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow mb-3 inline-flex items-center gap-2 text-primary">
              <span className="inline-block h-px w-5 bg-primary" />
              Our Clinic
            </span>
            <h2 className="font-display text-4xl text-white sm:text-5xl tracking-display">
              A Space Designed<br className="hidden sm:block" /> for Your Comfort
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-heading text-sm font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
          >
            View Full Gallery
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Showcase window */}
        <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: '16/8' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 70% 30%, ${current.accentColor}22 0%, transparent 60%), linear-gradient(135deg, ${current.gradientFrom}, ${current.gradientTo})`,
              }}
            >
              {/* Pattern overlay */}
              <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`grid-${current.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${current.id})`} />
              </svg>

              {/* Room illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-full max-w-lg">
                  <RoomIllustration category={current.category} />
                </div>
              </div>

              {/* Gradient overlay — bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Slide content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-white/50 mb-2">
                    {current.subtitle}
                  </p>
                  <h3 className="font-display text-2xl text-white sm:text-3xl tracking-display">
                    {current.title}
                  </h3>
                  <p className="mt-2 max-w-md font-body text-sm text-white/60 leading-relaxed">
                    {current.description}
                  </p>
                </motion.div>
              </div>

              {/* Accent color streak */}
              <div
                className="absolute top-0 right-0 h-1 w-32 opacity-60"
                style={{ backgroundColor: current.accentColor }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={() => goTo((active - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => goTo((active + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Next slide"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
            {slides.map((_, i) => (
              <div key={i} className="relative flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
                {i === active && (
                  <motion.div
                    className="absolute inset-0 origin-left rounded-full bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isPaused ? undefined : 1 }}
                    transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                    key={`${active}-${isPaused}`}
                  />
                )}
                {i < active && (
                  <div className="absolute inset-0 bg-white rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slide thumbnails / dots */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  i === active
                    ? 'w-6 h-2 bg-primary'
                    : 'w-2 h-2 bg-white/25 hover:bg-white/45'
                }`}
                aria-label={`Go to slide: ${slide.title}`}
                aria-current={i === active}
              />
            ))}
          </div>

          <span className="font-heading text-xs text-white/30">
            {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  )
}
