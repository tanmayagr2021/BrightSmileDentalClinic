'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CLINIC_CONTACT } from '@/lib/constants'
import MagneticWrap from '@/components/motion/MagneticWrap'
import { trackEvent } from '@/lib/analytics'
import { pick } from '@/lib/content-client'

type SlideData = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  category: string
  image_url: string | null
  gradient_from: string
  gradient_to: string
  accent_color: string
  sort_order: number
  is_visible: boolean
}

const AUTO_MS = 7000

const SLIDE_BTN =
  'flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 bg-white/50 text-ink-muted transition-all hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'

// The curved edge of the ivory panel, in a 0–100 box stretched over the
// panel. Same path drives the mask and the gold hairline so they line up.
const SWEEP_EDGE = 'M57 0 C50 34 62 68 96 100'
const SWEEP_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><filter id='f'><feGaussianBlur stdDeviation='0.6'/></filter><path filter='url(#f)' d='M0 0 H57 C50 34 62 68 96 100 H0 Z' fill='#000'/></svg>`
)}")`

export default function ShowcaseSection({
  slides,
  phone,
  content,
}: {
  slides: SlideData[]
  phone?: string
  content: Record<string, string>
}) {
  const displayPhone = phone ?? CLINIC_CONTACT.phone
  const trustChips = [
    pick(content, 'home.hero.badge_1', 'Covering All Specialities'),
    pick(content, 'home.hero.badge_2', 'Since 2006'),
    pick(content, 'home.hero.badge_3', 'Experienced Team'),
    pick(content, 'home.hero.badge_4', 'Kathmandu'),
  ]
  const [active, setActive] = useState(0)
  // Hover pause is transient (resumes on mouse-leave); manual pause via the
  // keyboard-reachable button sticks until explicitly toggled back on — WCAG
  // 2.2.2 requires this not to depend on hover, which mouse-only users get for free.
  const [isHovering, setIsHovering] = useState(false)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const isPaused = isHovering || isManuallyPaused
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback((dir = 1) => {
    setActive((prev) => (prev + dir + slides.length) % slides.length)
  }, [slides.length])

  const goTo = useCallback((i: number) => {
    setActive(i)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!isPaused) intervalRef.current = setInterval(() => advance(1), AUTO_MS)
  }, [isPaused, advance])

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => advance(1), AUTO_MS)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPaused, advance])

  const current = slides[active]
  if (!current) return null

  return (
    <section
      className="-mt-[4.75rem] lg:-mt-[6.5rem] relative overflow-hidden bg-ivory-waves lg:min-h-[100svh]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label="Bright Smile Dental Clinic"
    >
      {/* ── Clinic photo — full-bleed on the right on desktop, a banner
          under the header on mobile ── */}
      <div className="relative mt-[4.75rem] aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[28%] lg:mt-0 lg:aspect-auto lg:w-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            className="absolute inset-0"
          >
            {current.image_url ? (
              <Image
                src={current.image_url}
                alt={current.title}
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 72vw, 100vw"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: `linear-gradient(155deg, ${current.gradient_from} 0%, ${current.gradient_to} 100%)` }}
              >
                <span className="px-10 text-center font-display text-xl tracking-display text-white/80">
                  {current.title}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Light haze at the top so the nav stays readable over the photo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-44 bg-gradient-to-b from-white/75 via-white/30 to-transparent lg:block" aria-hidden="true" />
        {/* Mobile: photo fades into the ivory copy panel below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F8F6F3] to-transparent lg:hidden" aria-hidden="true" />
      </div>

      {/* ── Ivory sweep — the curved panel the copy sits on (desktop) ── */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[74%] bg-ivory-waves lg:block"
        style={{ WebkitMaskImage: SWEEP_MASK, maskImage: SWEEP_MASK, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
        aria-hidden="true"
      />
      {/* Gold hairline tracing the sweep's edge, echoing the background's lines */}
      <svg
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] hidden h-full w-[74%] lg:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={SWEEP_EDGE} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="6" vectorEffect="non-scaling-stroke" opacity="0.55" />
        <path d={SWEEP_EDGE} fill="none" stroke="#C9A24B" strokeWidth="1.2" vectorEffect="non-scaling-stroke" opacity="0.7" />
      </svg>

      {/* ── Copy ── */}
      <div className="relative z-10 flex flex-col justify-center px-6 pb-14 pt-4 sm:px-10 lg:min-h-[100svh] lg:pb-16 lg:pl-14 lg:pr-0 lg:pt-[8.5rem] xl:pl-16">
        <div className="max-w-xl lg:max-w-[38vw]">

          {/* Eyebrow */}
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-8 flex-shrink-0 bg-gold" aria-hidden="true" />
            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold-ink">
              {pick(content, 'home.hero.eyebrow', 'Bright Smile Dental Clinic · Kathmandu')}
            </span>
          </div>

          {/* Hero headline */}
          <h1
            className="font-display leading-[1.02] text-ink"
            style={{ fontSize: 'clamp(2.6rem, 4.4vw, 5rem)', letterSpacing: '-0.024em' }}
          >
            {pick(content, 'home.hero.headline_line1', 'Expert Dental Care,')}
            <span className="mt-1 block text-gold-dark">
              {pick(content, 'home.hero.headline_line2', 'Comfortable')}
            </span>
            <span className="block">{pick(content, 'home.hero.headline_line3', 'Experience.')}</span>
          </h1>

          {/* Sub-copy */}
          <p className="mt-7 max-w-[40ch] font-body text-[0.95rem] leading-[1.8] text-ink-muted">
            {pick(content, 'home.hero.subcopy', 'Modern dentistry with genuine care, covering every speciality, with transparent treatment planning and results built to last.')}
          </p>

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticWrap strength={0.25} className="inline-block">
              <Link
                href="/appointments"
                onClick={() => trackEvent('Hero CTA Clicked', { label: 'Book Consultation' })}
                className="btn-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                {pick(content, 'home.hero.cta_primary', 'Book Consultation')}
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MagneticWrap>

            <Link
              href="/gallery"
              onClick={() => trackEvent('View Gallery Clicked')}
              className="inline-flex items-center gap-2.5 rounded-xl border border-ink/20 bg-white/60 px-7 py-[0.875rem] font-heading text-[0.85rem] font-semibold text-ink backdrop-blur-sm transition-all duration-200 hover:border-ink/40 hover:bg-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="6" cy="7" r="1.2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 11l3-3 3 3 2-2 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {pick(content, 'home.hero.cta_secondary', 'View Smile Gallery')}
            </Link>
          </div>

          {/* Trust chips */}
          <div className="mt-9 flex flex-wrap gap-2">
            {trustChips.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/55 px-3.5 py-[0.35rem] font-heading text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink-muted backdrop-blur-sm"
              >
                <span className="h-[3px] w-[3px] flex-shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>

          {/* Slide navigation */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Slide navigation">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={slide.subtitle || slide.title}
                  onClick={() => goTo(i)}
                  className="relative h-[2px] overflow-hidden rounded-full transition-all duration-500 focus-visible:outline-none"
                  style={{
                    width: i === active ? '2rem' : '0.375rem',
                    backgroundColor: i === active ? '#C9A24B' : 'rgba(20,32,46,0.2)',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => { setIsManuallyPaused(true); advance(-1) }}
                className={SLIDE_BTN}
                aria-label="Previous slide"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => { setIsManuallyPaused(true); advance(1) }}
                className={SLIDE_BTN}
                aria-label="Next slide"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {/* Keyboard/touch-reachable pause control — WCAG 2.2.2 requires
                  a way to stop auto-advancing content that isn't hover-only */}
              <button
                onClick={() => setIsManuallyPaused((p) => !p)}
                className={SLIDE_BTN}
                aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
              >
                {isPaused ? (
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M5 3.5v9l8-4.5-8-4.5z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <rect x="4" y="3.5" width="2.5" height="9" rx="0.5" fill="currentColor" />
                    <rect x="9.5" y="3.5" width="2.5" height="9" rx="0.5" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="hidden font-heading text-[0.6rem] text-ink-soft sm:block"
              >
                {current.subtitle || current.title}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Phone CTA — bottom right over the photo */}
      <div className="absolute bottom-6 right-6 z-10 hidden lg:block">
        <a
          href={`tel:${displayPhone.replace(/[^0-9+]/g, '')}`}
          onClick={() => trackEvent('Phone Clicked', { location: 'hero' })}
          className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-ink/70 px-4 py-2.5 font-heading text-xs font-semibold text-white/90 backdrop-blur-md transition-colors hover:bg-ink/85"
        >
          <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3 text-gold" aria-hidden="true">
            <path d="M1 1.5h2.8L4.8 4.5l-1.2.8A6.4 6.4 0 007 9.4l.8-1.2 3 1v2.3a.4.4 0 01-.4.4C4.8 11.9 1 8.1 1 3a.4.4 0 010-.4V1.5z" />
          </svg>
          {displayPhone}
        </a>
      </div>
    </section>
  )
}
