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
  'NMC Registered',
  'Est. 2013',
  '6 Specialist Dentists',
  'Kathmandu, Nepal',
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
      {/* ── LEFT: Authority copy panel ── */}
      <div className="relative z-10 order-2 lg:order-1 flex flex-col justify-center bg-[#0F172A] px-8 pt-12 pb-14 sm:px-12 lg:w-[50%] lg:px-14 lg:pt-[8.5rem] lg:pb-16 xl:px-18">

        {/* Micro dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.016]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          aria-hidden="true"
        />

        <div className="relative max-w-lg">

          {/* Eyebrow */}
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-8 flex-shrink-0 bg-[#0EA5A4]" aria-hidden="true" />
            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#0EA5A4]">
              Bright Smile Dental Clinic
            </span>
          </div>

          {/* Static authority headline */}
          <h1
            className="font-display leading-[1.04] text-white"
            style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4.5rem)', letterSpacing: '-0.022em' }}
          >
            Expert Dental Care,
            <span className="block text-primary mt-0.5">Comfortable</span>
            <span className="block">Experience.</span>
          </h1>

          {/* Sub-copy */}
          <p className="mt-6 max-w-[38ch] font-body text-[0.95rem] leading-[1.78] text-white/65">
            Modern dentistry with genuine care. Six experienced specialists, transparent treatment planning, and results built to last.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#0EA5A4] px-7 py-[0.875rem] font-heading text-[0.85rem] font-semibold text-white shadow-lg shadow-[#0EA5A4]/18 transition-all duration-200 hover:bg-[#0d9488] hover:shadow-[#0EA5A4]/32 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
            >
              Book Appointment
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href={`tel:${displayPhone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/12 px-7 py-[0.875rem] font-heading text-[0.85rem] font-semibold text-white/70 transition-all duration-200 hover:border-white/26 hover:text-white active:scale-[0.97]"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M2 2.5h3.5L7 6l-1.5 1A8 8 0 009 9.5L10 8l3.5 1.5V13a.5.5 0 01-.5.5C6 13.5 2 9.5 2 3.5a.5.5 0 010-.5L2 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Call Clinic
            </a>
          </div>

          {/* Trust chips */}
          <div className="mt-9 flex flex-wrap gap-2.5">
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-[0.35rem] font-heading text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/50"
              >
                <span className="h-[3px] w-[3px] flex-shrink-0 rounded-full bg-[#0EA5A4]" aria-hidden="true" />
                {chip}
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
                  className="relative h-[2px] overflow-hidden rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0EA5A4]"
                  style={{
                    width: i === active ? '2rem' : '0.375rem',
                    backgroundColor: i === active ? '#0EA5A4' : 'rgba(255,255,255,0.18)',
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
                className="font-heading text-[0.6rem] text-white/20 hidden sm:block"
              >
                {current.subtitle || current.title}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Clinic image panel ── */}
      <div
        className="relative order-1 lg:order-2 flex-1 overflow-hidden bg-[#0a0f1d]"
        style={{ minHeight: 'clamp(52vw, 55vw, 55vh)' }}
      >
        {/* Progress bars — below the fixed nav */}
        <div className="absolute top-[4.75rem] lg:top-[6.5rem] left-0 right-0 z-20 flex gap-0.5 px-0">
          {slides.map((_, i) => (
            <div key={i} className="relative h-[2px] flex-1 overflow-hidden bg-white/8">
              {i < active && <div className="absolute inset-0 bg-white/40" />}
              {i === active && (
                <motion.div
                  className="absolute inset-0 origin-left bg-white/55"
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
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                {/* Left blend edge — merges with navy copy panel on desktop */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/55 lg:from-[#0F172A]/25 via-transparent to-transparent" />
                {/* Bottom readability gradient */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
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

        {/* Slide label — bottom corner */}
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
      </div>
    </section>
  )
}
