'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CLINIC_CONTACT } from '@/lib/constants'

type HourRow = { days: string; hours: string; open: boolean }

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

const TRUST_CHIPS = [
  { label: 'NMC Registered', icon: '✦' },
  { label: 'Est. 2013', icon: '✦' },
  { label: '6 Specialists', icon: '✦' },
  { label: 'Kathmandu', icon: '✦' },
]

export default function ShowcaseSection({
  slides,
  openingHours: _openingHours,
  phone,
}: {
  slides: SlideData[]
  openingHours?: HourRow[]
  phone?: string
}) {
  const displayPhone = phone ?? CLINIC_CONTACT.phone
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
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
      className="-mt-[4.75rem] lg:-mt-[6.5rem] relative overflow-hidden flex flex-col lg:flex-row"
      style={{ minHeight: '100svh' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Bright Smile Dental Clinic"
    >
      {/* ── LEFT: Authority copy panel — 42% on desktop ── */}
      <div
        className="relative z-10 order-2 lg:order-1 flex flex-col justify-center px-8 pt-12 pb-14 sm:px-12 lg:w-[42%] lg:px-14 lg:pt-[8.5rem] lg:pb-16 xl:px-18"
        style={{ background: '#0A1128' }}
      >
        {/* Subtle architectural grid */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="hero-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* Accent glow */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full blur-3xl"
          style={{ background: 'rgba(197, 160, 89, 0.07)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-lg">

          {/* Eyebrow — gold on dark for visibility */}
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-8 flex-shrink-0 bg-gold" aria-hidden="true" />
            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
              Bright Smile Dental Clinic · Kathmandu
            </span>
          </div>

          {/* Hero headline */}
          <h1
            className="font-display leading-[1.02] text-white"
            style={{ fontSize: 'clamp(2.6rem, 4.8vw, 5rem)', letterSpacing: '-0.024em' }}
          >
            Expert Dental Care,
            <span
              className="block mt-1"
              style={{ color: '#C5A059' }}
            >
              Comfortable
            </span>
            <span className="block">Experience.</span>
          </h1>

          {/* Sub-copy */}
          <p className="mt-7 max-w-[38ch] font-body text-[0.95rem] leading-[1.8] text-white/75">
            Modern dentistry with genuine care — six experienced specialists, transparent treatment planning, and results built to last.
          </p>

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {/* PRIMARY — gold */}
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2.5 rounded-xl px-7 py-[0.875rem] font-heading text-[0.85rem] font-semibold transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1128]"
              style={{
                background: '#C5A059',
                color: '#0A1128',
                boxShadow: '0 4px 20px rgba(197, 160, 89, 0.35), 0 1px 4px rgba(197, 160, 89, 0.18)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#A8883C' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#C5A059' }}
            >
              Book Consultation
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {/* SECONDARY — ghost */}
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2.5 rounded-xl border px-7 py-[0.875rem] font-heading text-[0.85rem] font-semibold transition-all duration-200 hover:text-white active:scale-[0.97] focus-visible:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.28)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)' }}
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="6" cy="7" r="1.2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 11l3-3 3 3 2-2 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View Smile Gallery
            </Link>
          </div>

          {/* Trust chips */}
          <div className="mt-9 flex flex-wrap gap-2">
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-[0.35rem] font-heading text-[0.65rem] font-medium uppercase tracking-[0.14em]"
                style={{
                  border: '1px solid rgba(197, 160, 89, 0.18)',
                  color: 'rgba(255,255,255,0.42)',
                  background: 'rgba(197, 160, 89, 0.04)',
                }}
              >
                <span className="h-[3px] w-[3px] flex-shrink-0 rounded-full" style={{ background: '#C5A059' }} aria-hidden="true" />
                {chip.label}
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
                    backgroundColor: i === active ? '#C5A059' : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => { setIsPaused(true); advance(-1) }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/30 transition-all hover:border-white/22 hover:text-white/65 focus-visible:outline-none"
                aria-label="Previous slide"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => { setIsPaused(true); advance(1) }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/30 transition-all hover:border-white/22 hover:text-white/65 focus-visible:outline-none"
                aria-label="Next slide"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="hidden font-heading text-[0.6rem] text-white/20 sm:block"
              >
                {current.subtitle || current.title}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Clinic image panel — 58% on desktop ── */}
      <div
        className="relative order-1 lg:order-2 flex-1 overflow-hidden bg-[#060a18]"
        style={{ minHeight: 'clamp(52vw, 55vw, 55vh)' }}
      >
        {/* Progress bars */}
        <div className="absolute top-[4.75rem] lg:top-[6.5rem] left-0 right-0 z-20 flex gap-0.5 px-0">
          {slides.map((_, i) => (
            <div key={i} className="relative h-[2px] flex-1 overflow-hidden bg-white/8">
              {i < active && <div className="absolute inset-0 bg-white/40" />}
              {i === active && (
                <motion.div
                  className="absolute inset-0 origin-left"
                  style={{ background: '#C5A059' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isPaused ? undefined : 1 }}
                  transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
                  key={`prog-${active}-${isPaused}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Slide images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            className="absolute inset-0"
          >
            {current.image_url ? (
              <>
                <Image
                  src={current.image_url}
                  alt={current.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                />
                {/* Left blend into navy panel */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1128]/60 lg:from-[#0A1128]/30 via-transparent to-transparent" />
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              </>
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `linear-gradient(155deg, ${current.gradient_from} 0%, ${current.gradient_to} 100%)` }}
              >
                <span className="font-display text-xl text-white/25 tracking-display px-10 text-center">
                  {current.title}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Gold accent line — top of image panel */}
        <div
          className="absolute top-[4.75rem] lg:top-[6.5rem] left-0 right-0 z-30 h-px"
          style={{ background: 'linear-gradient(to right, rgba(197,160,89,0.4), transparent)' }}
          aria-hidden="true"
        />

        {/* Slide label */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5 lg:px-6 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-heading text-[0.62rem] font-medium uppercase tracking-[0.18em] text-white/25"
            >
              {current.image_url ? (current.subtitle || current.title) : ''}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Phone CTA overlay — bottom right */}
        <div className="absolute bottom-5 right-5 z-10 hidden lg:block">
          <a
            href={`tel:${displayPhone.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-heading text-xs font-semibold transition-all"
            style={{
              background: 'rgba(10, 17, 40, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3 text-gold" aria-hidden="true">
              <path d="M1 1.5h2.8L4.8 4.5l-1.2.8A6.4 6.4 0 007 9.4l.8-1.2 3 1v2.3a.4.4 0 01-.4.4C4.8 11.9 1 8.1 1 3a.4.4 0 010-.4V1.5z" />
            </svg>
            {displayPhone}
          </a>
        </div>
      </div>
    </section>
  )
}
