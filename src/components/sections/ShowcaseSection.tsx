'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'

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

const AUTO_MS = 6000
const EASE = [0.16, 1, 0.3, 1] as const

// Cinematic architectural illustrations
function RoomIllustration({ category, accent }: { category: string; accent: string }) {
  if (category === 'reception') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
        <rect x="140" y="190" width="260" height="90" rx="6" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
        <rect x="140" y="165" width="260" height="30" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="160" y="175" width="80" height="12" rx="2" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <rect x="256" y="175" width="60" height="12" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
        <rect x="310" y="130" width="56" height="36" rx="3" stroke="white" strokeWidth="1" strokeOpacity="0.45" />
        <rect x="314" y="134" width="48" height="28" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
        <line x1="338" y1="166" x2="338" y2="176" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
        <line x1="328" y1="176" x2="348" y2="176" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
        <rect x="40" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="40" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <rect x="95" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="95" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <rect x="490" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="490" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <rect x="545" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="545" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <ellipse cx="580" cy="285" rx="18" ry="10" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M580 285 Q572 265 568 250 M580 285 Q582 260 590 245 M580 285 Q588 268 595 255" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" strokeLinecap="round" />
        <rect x="270" y="80" width="100" height="40" rx="4" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
        <circle cx="320" cy="100" r="60" fill={accent} fillOpacity="0.07" />
        <circle cx="200" cy="40" r="8" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
        <circle cx="320" cy="40" r="8" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
        <circle cx="440" cy="40" r="8" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
        <path d="M200 48 L175 140 M200 48 L225 140" stroke="white" strokeWidth="0.3" strokeOpacity="0.06" />
        <path d="M320 48 L295 140 M320 48 L345 140" stroke="white" strokeWidth="0.3" strokeOpacity="0.06" />
      </svg>
    )
  }

  if (category === 'waiting') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
        <rect x="120" y="230" width="180" height="70" rx="10" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
        <rect x="120" y="200" width="180" height="35" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="114" y="205" width="16" height="80" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <rect x="290" y="205" width="16" height="80" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="210" y1="200" x2="210" y2="230" stroke="white" strokeWidth="0.8" strokeOpacity="0.18" />
        <rect x="340" y="240" width="70" height="60" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="340" y="215" width="70" height="28" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="335" y="218" width="10" height="72" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <rect x="405" y="218" width="10" height="72" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <rect x="170" y="290" width="120" height="8" rx="3" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <rect x="192" y="285" width="40" height="6" rx="1" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
        <line x1="490" y1="310" x2="490" y2="160" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <ellipse cx="490" cy="155" rx="22" ry="10" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <ellipse cx="490" cy="310" rx="14" ry="5" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
        <ellipse cx="80" cy="295" rx="22" ry="12" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M80 295 Q68 268 62 248 M80 295 Q82 265 92 245 M80 295 Q90 272 100 255 M80 295 Q72 275 70 260" stroke="white" strokeWidth="0.9" strokeOpacity="0.25" strokeLinecap="round" />
        <rect x="220" y="80" width="80" height="60" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <rect x="340" y="90" width="60" height="50" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
        <circle cx="490" cy="155" r="65" fill={accent} fillOpacity="0.08" />
        <rect x="240" y="32" width="50" height="8" rx="4" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
        <rect x="360" y="32" width="50" height="8" rx="4" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
      </svg>
    )
  }

  if (category === 'treatment') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
        <path d="M120 260 L120 210 Q120 185 145 185 L340 185 Q380 185 380 220 L380 270 Q380 295 355 295 L165 295 Q120 295 120 260Z" stroke="white" strokeWidth="1.3" strokeOpacity="0.5" fill="white" fillOpacity="0.025" />
        <path d="M340 185 L355 160 Q360 145 375 145 L395 145" stroke="white" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
        <rect x="395" y="132" width="44" height="26" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="218" y="295" width="90" height="10" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <rect x="240" y="305" width="46" height="5" rx="2" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
        <line x1="460" y1="50" x2="460" y2="130" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="460" y1="130" x2="380" y2="155" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
        <ellipse cx="368" cy="162" rx="28" ry="12" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
        <ellipse cx="368" cy="162" rx="18" ry="7" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.6" strokeOpacity="0.25" />
        <circle cx="368" cy="162" r="60" fill={accent} fillOpacity="0.09" />
        <rect x="440" y="160" width="90" height="130" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="450" y="172" width="70" height="55" rx="4" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
        <rect x="380" y="200" width="55" height="20" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="392" y1="205" x2="392" y2="215" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
        <line x1="400" y1="204" x2="400" y2="216" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
        <line x1="408" y1="205" x2="408" y2="215" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
        <circle cx="90" cy="265" r="22" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <line x1="90" y1="287" x2="90" y2="310" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
        <ellipse cx="90" cy="310" rx="16" ry="6" stroke="white" strokeWidth="0.7" strokeOpacity="0.18" />
        <rect x="525" y="60" width="80" height="160" rx="6" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
        <rect x="533" y="70" width="64" height="70" rx="3" fill="white" fillOpacity="0.025" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
      </svg>
    )
  }

  if (category === 'equipment') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
        <rect x="80" y="80" width="160" height="210" rx="10" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
        <rect x="96" y="96" width="128" height="100" rx="6" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <path d="M104 140 l14 0 l7 -22 l12 44 l10 -28 l10 20 l12 -14 l14 0 l10 12 l12 0" stroke={accent} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.75" />
        <rect x="96" y="208" width="128" height="65" rx="4" fill="white" fillOpacity="0.025" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
        <circle cx="118" cy="228" r="8" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <circle cx="145" cy="228" r="8" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <circle cx="172" cy="228" r="8" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <rect x="110" y="244" width="100" height="6" rx="3" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="0.5" strokeOpacity="0.35" />
        <circle cx="380" cy="155" r="90" stroke="white" strokeWidth="1.3" strokeOpacity="0.4" />
        <circle cx="380" cy="155" r="64" stroke="white" strokeWidth="0.8" strokeOpacity="0.22" />
        <circle cx="380" cy="155" r="38" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.7" strokeOpacity="0.25" />
        <line x1="340" y1="155" x2="420" y2="155" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <line x1="380" y1="115" x2="380" y2="195" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <circle cx="380" cy="155" r="10" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="380" cy="155" r="115" fill={accent} fillOpacity="0.045" />
        <line x1="380" y1="65" x2="380" y2="40" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <rect x="360" y="32" width="40" height="10" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <rect x="510" y="120" width="100" height="170" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <line x1="510" y1="205" x2="610" y2="205" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
        <rect x="524" y="134" width="72" height="64" rx="4" fill="white" fillOpacity="0.025" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
        <circle cx="595" cy="170" r="6" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
      <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
      <circle cx="170" cy="130" r="52" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
      <circle cx="170" cy="118" r="26" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M100 310 Q100 248 170 248 Q240 248 240 310" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M132 275 L140 310 M208 275 L200 310" stroke="white" strokeWidth="0.8" strokeOpacity="0.18" strokeLinecap="round" />
      <path d="M145 268 Q138 280 142 292" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" strokeLinecap="round" />
      <circle cx="142" cy="295" r="5" stroke="white" strokeWidth="0.7" strokeOpacity="0.25" />
      <circle cx="320" cy="118" r="58" stroke="white" strokeWidth="1.4" strokeOpacity="0.52" />
      <circle cx="320" cy="105" r="30" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
      <path d="M240 310 Q240 242 320 242 Q400 242 400 310" stroke="white" strokeWidth="1.4" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M282 270 L272 310 M358 270 L368 310" stroke="white" strokeWidth="0.8" strokeOpacity="0.18" strokeLinecap="round" />
      <rect x="305" y="272" width="48" height="20" rx="3" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.6" strokeOpacity="0.25" />
      <circle cx="320" cy="118" r="85" fill={accent} fillOpacity="0.07" />
      <circle cx="470" cy="130" r="52" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
      <circle cx="470" cy="118" r="26" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M400 310 Q400 248 470 248 Q540 248 540 310" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M432 275 L440 310 M508 275 L500 310" stroke="white" strokeWidth="0.8" strokeOpacity="0.18" strokeLinecap="round" />
      <rect x="488" y="255" width="30" height="38" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="492" y1="264" x2="514" y2="264" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
      <line x1="492" y1="270" x2="514" y2="270" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
      <line x1="492" y1="276" x2="506" y2="276" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
      <circle cx="170" cy="78" r="10" fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="0.6" strokeOpacity="0.45" />
      <path d="M166 78l2.5 2.5 5-5" stroke={accent} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.75" />
      <circle cx="470" cy="78" r="10" fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="0.6" strokeOpacity="0.45" />
      <path d="M466 78l2.5 2.5 5-5" stroke={accent} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.75" />
    </svg>
  )
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '5%' : '-5%',
    opacity: 0,
    scale: 1.04,
    filter: 'blur(4px)',
  }),
  center: {
    x: '0%',
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-4%' : '4%',
    opacity: 0,
    scale: 0.97,
    filter: 'blur(3px)',
    transition: { duration: 0.6, ease: [0.55, 0, 0.45, 1] },
  }),
}

const textVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
  }),
}

export default function ShowcaseSection({ slides }: { slides: SlideData[] }) {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback((dir = 1) => {
    setDirection(dir)
    setActive((prev) => (prev + dir + slides.length) % slides.length)
  }, [slides.length])

  const goTo = useCallback((i: number) => {
    const dir = i > active ? 1 : -1
    setDirection(dir)
    setActive(i)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!isPaused) intervalRef.current = setInterval(() => advance(1), AUTO_MS)
  }, [active, isPaused, advance])

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
      className="relative overflow-hidden bg-[#0a1f14] -mt-[4.75rem] lg:-mt-[6.5rem]"
      style={{ minHeight: '100vh' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="The Bright Smile Experience"
    >
      {/* ── Slide background ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 70% 20%, ${current.accent_color}1a 0%, transparent 52%),
              radial-gradient(ellipse at 15% 85%, ${current.accent_color}0e 0%, transparent 42%),
              linear-gradient(155deg, ${current.gradient_from} 0%, ${current.gradient_to} 100%)
            `,
          }}
        >
          {/* Architectural grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.028]" aria-hidden="true">
            <defs>
              <pattern id={`grid-${current.id}`} width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${current.id})`} />
          </svg>

          {/* Real clinic photo */}
          {current.image_url && (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={current.image_url}
                alt={current.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          )}

          {/* Illustration when no photo */}
          {!current.image_url && (
            <div className="absolute inset-0 flex items-center justify-center px-16 pt-16 pb-60 sm:pb-52 lg:pb-64">
              <div className="h-full w-full max-w-3xl opacity-[0.22]">
                <RoomIllustration category={current.category} accent={current.accent_color} />
              </div>
            </div>
          )}

          {/* Top gradient for header readability */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" aria-hidden="true" />

          {/* Accent top line */}
          <motion.div
            className="absolute left-0 right-0 top-0 h-[2.5px]"
            style={{ backgroundColor: current.accent_color, opacity: 0.8 }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.3, ease: EASE }}
          />

          {/* Cinematic bottom gradient — deeper */}
          <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/70 via-black/22 to-transparent" />

          {/* Side gradient for text readability */}
          <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bars ── */}
      <div className="absolute left-0 right-0 top-[4.75rem] lg:top-[6.5rem] flex gap-1.5 px-6 pt-4 sm:px-10 lg:px-14 lg:pt-5" aria-hidden="true">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/12 focus-visible:outline-none"
            aria-label={`Slide ${i + 1}`}
          >
            {i < active && <span className="absolute inset-0 rounded-full bg-white/55" />}
            {i === active && (
              <motion.span
                className="absolute inset-0 origin-left rounded-full"
                style={{ backgroundColor: current.accent_color }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isPaused ? undefined : 1 }}
                transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
                key={`progress-${active}-${isPaused}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Top metadata bar ── */}
      <div className="absolute left-0 right-0 top-[4.75rem] lg:top-[6.5rem] flex items-center justify-between px-6 pt-10 sm:px-10 lg:px-14 lg:pt-12" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: current.accent_color }}
          />
          <span className="font-heading text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white/30">
            The Bright Smile Experience
          </span>
        </div>
        <span className="font-heading text-xs font-medium tabular-nums text-white/22">
          <span className="text-white/45">{String(active + 1).padStart(2, '0')}</span>
          {' '}/{' '}
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 sm:px-10 sm:pb-14 lg:px-14 lg:pb-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          {/* Left: cinematic text block */}
          <div className="max-w-xl lg:max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={`text-${active}`}>

                {/* Category eyebrow */}
                <motion.div
                  custom={0}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-4 flex items-center gap-3"
                >
                  <motion.span
                    className="inline-block h-px w-8"
                    style={{ backgroundColor: current.accent_color }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                  <span
                    className="font-heading text-[0.62rem] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: current.accent_color }}
                  >
                    {current.subtitle}
                  </span>
                </motion.div>

                {/* Main title — cinematic large */}
                <motion.h1
                  custom={0.07}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="font-display leading-[1.04] text-white tracking-display"
                  style={{ fontSize: 'clamp(2.4rem, 5vw, 4.75rem)' }}
                >
                  {current.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  custom={0.16}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-4 max-w-md font-body text-[0.95rem] text-white/65 leading-relaxed lg:text-base"
                >
                  {current.description}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  custom={0.24}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <Link
                    href="/appointments"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-primary/40 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Book a Visit
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-white/18 px-7 py-3.5 font-heading text-sm font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-white/32 hover:text-white active:scale-[0.97]"
                  >
                    View Gallery
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: floating contact card */}
          <div className="hidden lg:block flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-72 overflow-hidden rounded-2xl border border-white/10 bg-white/7 p-6 backdrop-blur-xl"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <p className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-white/35 mb-4">
                Quick Contact
              </p>
              <a
                href={`tel:${CLINIC_CONTACT.phone}`}
                className="mb-3 flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 font-heading text-sm font-medium text-white transition-all hover:bg-white/14 focus-visible:outline-none"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-primary" aria-hidden="true">
                    <path d="M2 2.5h2.5l1 2.5-1.5 1a8 8 0 004 4l1-1.5 2.5 1V12a1 1 0 01-1 1C5.5 13 2 8.5 2 3.5A1 1 0 012 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {CLINIC_CONTACT.phone}
              </a>

              {/* Hours */}
              <div className="space-y-2 rounded-xl bg-white/6 px-4 py-3">
                {OPENING_HOURS.map((h) => (
                  <div key={h.days} className="flex justify-between font-body text-xs">
                    <span className="text-white/38">{h.days.replace('Sunday – ', 'Sun–').replace('Saturday', 'Sat')}</span>
                    <span className="text-white/65">{h.hours.replace('AM', 'am').replace('PM', 'pm')}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/appointments"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary py-3 font-heading text-[0.8rem] font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.97]"
              >
                Book Appointment
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Navigation strip */}
        <div className="mt-8 flex items-center gap-5">
          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => { setIsPaused(true); advance(-1) }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/14 text-white/45 backdrop-blur-sm transition-all hover:border-white/28 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => { setIsPaused(true); advance(1) }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/14 text-white/45 backdrop-blur-sm transition-all hover:border-white/28 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              aria-label="Next slide"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Pill dot navigation */}
          <div className="flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goTo(i)}
                aria-label={`Go to: ${slide.title}`}
                aria-current={i === active}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500 focus-visible:outline-none"
                style={{ width: i === active ? '2.25rem' : '0.375rem' }}
              >
                <span className="absolute inset-0 rounded-full bg-white/20" />
                {i === active && (
                  <span className="absolute inset-0 rounded-full" style={{ backgroundColor: current.accent_color }} />
                )}
              </button>
            ))}
          </div>

          {/* Current slide label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="ml-1 hidden font-heading text-xs text-white/28 sm:block"
            >
              {current.subtitle}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
