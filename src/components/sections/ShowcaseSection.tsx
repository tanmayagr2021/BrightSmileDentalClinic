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

const AUTO_MS = 5000
const EASE = [0.16, 1, 0.3, 1] as const

// Detailed architectural illustrations — cinematic SVG sketches
function RoomIllustration({ category, accent }: { category: string; accent: string }) {
  if (category === 'reception') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        {/* Floor line */}
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
        {/* Reception desk */}
        <rect x="140" y="190" width="260" height="90" rx="6" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
        <rect x="140" y="165" width="260" height="30" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        {/* Desk surface detail */}
        <rect x="160" y="175" width="80" height="12" rx="2" fill="white" fillOpacity="0.06" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="256" y="175" width="60" height="12" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        {/* Monitor */}
        <rect x="310" y="130" width="56" height="36" rx="3" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
        <rect x="314" y="134" width="48" height="28" rx="2" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="338" y1="166" x2="338" y2="176" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="328" y1="176" x2="348" y2="176" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        {/* Waiting chairs - left group */}
        <rect x="40" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="40" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="95" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="95" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        {/* Waiting chairs - right group */}
        <rect x="490" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="490" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="545" y="230" width="48" height="52" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="545" y="210" width="48" height="24" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        {/* Plant */}
        <ellipse cx="580" cy="285" rx="18" ry="10" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <path d="M580 285 Q572 265 568 250 M580 285 Q582 260 590 245 M580 285 Q588 268 595 255" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
        {/* Logo on wall */}
        <rect x="270" y="80" width="100" height="40" rx="4" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        {/* Accent light */}
        <circle cx="320" cy="100" r="50" fill={accent} fillOpacity="0.06" />
        {/* Ceiling lights */}
        <circle cx="200" cy="40" r="8" fill="white" fillOpacity="0.06" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
        <circle cx="320" cy="40" r="8" fill="white" fillOpacity="0.06" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
        <circle cx="440" cy="40" r="8" fill="white" fillOpacity="0.06" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
        {/* Light rays (subtle) */}
        <path d="M200 48 L175 140 M200 48 L225 140" stroke="white" strokeWidth="0.3" strokeOpacity="0.08" />
        <path d="M320 48 L295 140 M320 48 L345 140" stroke="white" strokeWidth="0.3" strokeOpacity="0.08" />
      </svg>
    )
  }

  if (category === 'waiting') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
        {/* Sofa — large, premium */}
        <rect x="120" y="230" width="180" height="70" rx="10" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
        <rect x="120" y="200" width="180" height="35" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="114" y="205" width="16" height="80" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <rect x="290" y="205" width="16" height="80" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        {/* Sofa cushion lines */}
        <line x1="210" y1="200" x2="210" y2="230" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
        {/* Side chair */}
        <rect x="340" y="240" width="70" height="60" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.45" />
        <rect x="340" y="215" width="70" height="28" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="335" y="218" width="10" height="72" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="405" y="218" width="10" height="72" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        {/* Coffee table */}
        <rect x="170" y="290" width="120" height="8" rx="3" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        {/* Magazine on table */}
        <rect x="192" y="285" width="40" height="6" rx="1" fill="white" fillOpacity="0.06" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
        {/* Floor lamp */}
        <line x1="490" y1="310" x2="490" y2="160" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
        <ellipse cx="490" cy="155" rx="22" ry="10" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <ellipse cx="490" cy="310" rx="14" ry="5" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        {/* Plant large */}
        <ellipse cx="80" cy="295" rx="22" ry="12" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <path d="M80 295 Q68 268 62 248 M80 295 Q82 265 92 245 M80 295 Q90 272 100 255 M80 295 Q72 275 70 260" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" strokeLinecap="round" />
        {/* Artwork on wall */}
        <rect x="220" y="80" width="80" height="60" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="228" y="88" width="64" height="44" rx="2" fill="white" fillOpacity="0.03" />
        <rect x="340" y="90" width="60" height="50" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        {/* Accent glow */}
        <circle cx="490" cy="155" r="60" fill={accent} fillOpacity="0.08" />
        {/* Ceiling lights */}
        <rect x="240" y="32" width="50" height="8" rx="4" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
        <rect x="360" y="32" width="50" height="8" rx="4" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.5" strokeOpacity="0.18" />
      </svg>
    )
  }

  if (category === 'treatment') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
        {/* Dental chair */}
        <path d="M120 260 L120 210 Q120 185 145 185 L340 185 Q380 185 380 220 L380 270 Q380 295 355 295 L165 295 Q120 295 120 260Z" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" fill="white" fillOpacity="0.03" />
        {/* Chair back adjustment */}
        <path d="M340 185 L355 160 Q360 145 375 145 L395 145" stroke="white" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
        {/* Headrest */}
        <rect x="395" y="132" width="44" height="26" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.45" />
        {/* Chair base / pedestal */}
        <rect x="218" y="295" width="90" height="10" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="240" y="305" width="46" height="5" rx="2" stroke="white" strokeWidth="0.7" strokeOpacity="0.25" />
        {/* Overhead dental light arm */}
        <line x1="460" y1="50" x2="460" y2="130" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" />
        <line x1="460" y1="130" x2="380" y2="155" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" />
        <ellipse cx="368" cy="162" rx="28" ry="12" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
        <ellipse cx="368" cy="162" rx="18" ry="7" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />
        {/* Light glow */}
        <circle cx="368" cy="162" r="55" fill={accent} fillOpacity="0.09" />
        {/* Equipment unit */}
        <rect x="440" y="160" width="90" height="130" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="450" y="172" width="70" height="55" rx="4" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.7" strokeOpacity="0.25" />
        {/* Small instrument tray */}
        <rect x="380" y="200" width="55" height="20" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
        {/* Instruments on tray */}
        <line x1="392" y1="205" x2="392" y2="215" stroke="white" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" />
        <line x1="400" y1="204" x2="400" y2="216" stroke="white" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" />
        <line x1="408" y1="205" x2="408" y2="215" stroke="white" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" />
        {/* Doctor stool */}
        <circle cx="90" cy="265" r="22" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="90" y1="287" x2="90" y2="310" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <ellipse cx="90" cy="310" rx="16" ry="6" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
        {/* Wall unit */}
        <rect x="525" y="60" width="80" height="160" rx="6" stroke="white" strokeWidth="0.9" strokeOpacity="0.35" />
        <rect x="533" y="70" width="64" height="70" rx="3" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.6" strokeOpacity="0.2" />
      </svg>
    )
  }

  if (category === 'equipment') {
    return (
      <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
        <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
        {/* X-ray machine */}
        <rect x="80" y="80" width="160" height="210" rx="10" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
        <rect x="96" y="96" width="128" height="100" rx="6" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        {/* ECG/scan readout */}
        <path d="M104 140 l14 0 l7 -22 l12 44 l10 -28 l10 20 l12 -14 l14 0 l10 12 l12 0" stroke={accent} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
        {/* Control panel */}
        <rect x="96" y="208" width="128" height="65" rx="4" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.7" strokeOpacity="0.25" />
        <circle cx="118" cy="228" r="8" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <circle cx="145" cy="228" r="8" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <circle cx="172" cy="228" r="8" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="110" y="244" width="100" height="6" rx="3" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="0.5" strokeOpacity="0.4" />
        {/* Large circular X-ray head */}
        <circle cx="380" cy="155" r="90" stroke="white" strokeWidth="1.3" strokeOpacity="0.45" />
        <circle cx="380" cy="155" r="64" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
        <circle cx="380" cy="155" r="38" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="0.7" strokeOpacity="0.3" />
        {/* Cross-hair */}
        <line x1="340" y1="155" x2="420" y2="155" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="380" y1="115" x2="380" y2="195" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <circle cx="380" cy="155" r="10" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="0.8" strokeOpacity="0.5" />
        {/* Accent glow */}
        <circle cx="380" cy="155" r="110" fill={accent} fillOpacity="0.05" />
        {/* Arm mount */}
        <line x1="380" y1="65" x2="380" y2="40" stroke="white" strokeWidth="2" strokeOpacity="0.35" />
        <rect x="360" y="32" width="40" height="10" rx="4" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        {/* Sterilisation cabinet */}
        <rect x="510" y="120" width="100" height="170" rx="8" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="510" y1="205" x2="610" y2="205" stroke="white" strokeWidth="0.6" strokeOpacity="0.2" />
        <rect x="524" y="134" width="72" height="64" rx="4" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.6" strokeOpacity="0.2" />
        <circle cx="595" cy="170" r="6" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
      </svg>
    )
  }

  // team
  return (
    <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" aria-hidden="true">
      <line x1="0" y1="310" x2="640" y2="310" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
      {/* Three doctors in a line — premium portrait style */}
      {/* Person 1 — left */}
      <circle cx="170" cy="130" r="52" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <circle cx="170" cy="118" r="26" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      <path d="M100 310 Q100 248 170 248 Q240 248 240 310" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" strokeLinecap="round" />
      {/* White coat lines */}
      <path d="M132 275 L140 310 M208 275 L200 310" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" strokeLinecap="round" />
      {/* Stethoscope */}
      <path d="M145 268 Q138 280 142 292" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
      <circle cx="142" cy="295" r="5" stroke="white" strokeWidth="0.7" strokeOpacity="0.3" />

      {/* Person 2 — center, slightly forward */}
      <circle cx="320" cy="118" r="58" stroke="white" strokeWidth="1.4" strokeOpacity="0.58" />
      <circle cx="320" cy="105" r="30" fill="white" fillOpacity="0.06" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M240 310 Q240 242 320 242 Q400 242 400 310" stroke="white" strokeWidth="1.4" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M282 270 L272 310 M358 270 L368 310" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" strokeLinecap="round" />
      {/* Name badge */}
      <rect x="305" y="272" width="48" height="20" rx="3" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />
      {/* Accent glow on center person */}
      <circle cx="320" cy="118" r="80" fill={accent} fillOpacity="0.07" />

      {/* Person 3 — right */}
      <circle cx="470" cy="130" r="52" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <circle cx="470" cy="118" r="26" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      <path d="M400 310 Q400 248 470 248 Q540 248 540 310" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M432 275 L440 310 M508 275 L500 310" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" strokeLinecap="round" />
      {/* Clipboard */}
      <rect x="488" y="255" width="30" height="38" rx="3" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="492" y1="264" x2="514" y2="264" stroke="white" strokeWidth="0.6" strokeOpacity="0.2" />
      <line x1="492" y1="270" x2="514" y2="270" stroke="white" strokeWidth="0.6" strokeOpacity="0.2" />
      <line x1="492" y1="276" x2="506" y2="276" stroke="white" strokeWidth="0.6" strokeOpacity="0.2" />
      {/* NMC badges — subtle */}
      <circle cx="170" cy="78" r="10" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
      <path d="M166 78l2.5 2.5 5-5" stroke={accent} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
      <circle cx="470" cy="78" r="10" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
      <path d="M466 78l2.5 2.5 5-5" stroke={accent} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
    </svg>
  )
}

// slide variants — direction-aware
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '6%' : '-6%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: '0%',
    opacity: 1,
    scale: 1,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-5%' : '5%',
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.55, ease: [0.55, 0, 0.45, 1] },
  }),
}

const textVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
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
  }, [])

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
      className="relative overflow-hidden bg-[#0d2018]"
      style={{ minHeight: 'calc(100vh - 4.75rem)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Clinic Showcase"
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
              radial-gradient(ellipse at 65% 25%, ${current.accent_color}18 0%, transparent 55%),
              radial-gradient(ellipse at 20% 80%, ${current.accent_color}0c 0%, transparent 40%),
              linear-gradient(150deg, ${current.gradient_from} 0%, ${current.gradient_to} 100%)
            `,
          }}
        >
          {/* Architectural grid overlay */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.032]" aria-hidden="true">
            <defs>
              <pattern id={`grid-${current.id}`} width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${current.id})`} />
          </svg>

          {/* Real clinic photo — shown when uploaded */}
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

          {/* Large room illustration — shown only when no real photo */}
          {!current.image_url && (
            <div className="absolute inset-0 flex items-center justify-center px-16 pt-16 pb-52 sm:pb-48 lg:pb-56">
              <div className="h-full w-full max-w-3xl opacity-[0.28]">
                <RoomIllustration category={current.category} accent={current.accent_color} />
              </div>
            </div>
          )}

          {/* Accent line — top */}
          <motion.div
            className="absolute left-0 right-0 top-0 h-[2px]"
            style={{ backgroundColor: current.accent_color, opacity: 0.7 }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
          />

          {/* Bottom gradient — light, airy */}
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bars ── */}
      <div className="absolute left-0 right-0 top-0 flex gap-1.5 px-6 pt-5 sm:px-10 lg:px-14" aria-hidden="true">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/15 focus-visible:outline-none"
            aria-label={`Slide ${i + 1}`}
          >
            {i < active && (
              <span className="absolute inset-0 rounded-full bg-white/60" />
            )}
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

      {/* ── Clinic identifier — top ── */}
      <div className="absolute left-6 top-10 flex items-center gap-3 sm:left-10 lg:left-14" aria-hidden="true">
        <div
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: current.accent_color }}
        />
        <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/35">
          Bright Smile Dental
        </span>
      </div>

      {/* ── Slide counter — top right ── */}
      <div className="absolute right-6 top-9 sm:right-10 lg:right-14" aria-hidden="true">
        <span className="font-heading text-xs font-medium tabular-nums text-white/25">
          <span className="text-white/50">{String(active + 1).padStart(2, '0')}</span>
          {' '}/{' '}
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── Bottom content ── */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 sm:px-10 sm:pb-12 lg:px-14 lg:pb-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          {/* Left: text — glass panel */}
          <div className="max-w-lg rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-md sm:px-8 sm:py-6">
            <AnimatePresence mode="wait">
              <motion.div key={`text-${active}`}>
                {/* Category eyebrow */}
                <motion.div
                  custom={0}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-3 flex items-center gap-2.5"
                >
                  <span
                    className="inline-block h-px w-6"
                    style={{ backgroundColor: current.accent_color }}
                  />
                  <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: current.accent_color }}
                  >
                    {current.subtitle}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  custom={0.08}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl tracking-display"
                >
                  {current.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  custom={0.16}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-3 max-w-sm font-body text-sm text-white/70 leading-relaxed lg:text-base"
                >
                  {current.description}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  custom={0.22}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-7 flex flex-wrap items-center gap-3"
                >
                  <Link
                    href="/appointments"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-primary/35 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Book a Visit
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-heading text-sm font-semibold text-white/75 backdrop-blur-sm transition-all hover:border-white/35 hover:text-white active:scale-[0.97]"
                  >
                    Full Gallery
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: glassmorphism booking card */}
          <div className="hidden lg:block flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-64 overflow-hidden rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur-md"
            >
              <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-widest text-white/40 mb-3">
                Contact Us
              </p>
              <a
                href={`tel:${CLINIC_CONTACT.phone}`}
                className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 font-heading text-sm font-medium text-white transition-all hover:bg-white/15"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true">
                  <path d="M2 2.5h2.5l1 2.5-1.5 1a8 8 0 004 4l1-1.5 2.5 1V12a1 1 0 01-1 1C5.5 13 2 8.5 2 3.5A1 1 0 012 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {CLINIC_CONTACT.phone}
              </a>
              <div className="space-y-1.5 rounded-xl bg-white/8 px-3.5 py-2.5">
                {OPENING_HOURS.map((h) => (
                  <div key={h.days} className="flex justify-between font-body text-xs">
                    <span className="text-white/40">{h.days.replace('Sunday – ', 'Sun–')}</span>
                    <span className="text-white/70">{h.hours.replace('AM', 'am').replace('PM', 'pm')}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/appointments"
                className="mt-3 flex w-full items-center justify-center rounded-xl bg-primary py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.97]"
              >
                Book Appointment
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Thumbnail navigation row */}
        <div className="mt-8 flex items-center gap-4">
          {/* Prev / Next */}
          <div className="flex gap-2">
            <button
              onClick={() => { setIsPaused(true); advance(-1) }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => { setIsPaused(true); advance(1) }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              aria-label="Next slide"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Dot navigation */}
          <div className="flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goTo(i)}
                aria-label={`Go to: ${slide.title}`}
                aria-current={i === active}
                className="relative h-1.5 transition-all duration-400 focus-visible:outline-none rounded-full overflow-hidden"
                style={{ width: i === active ? '2rem' : '0.375rem' }}
              >
                <span className="absolute inset-0 rounded-full bg-white/25" />
                {i === active && (
                  <span className="absolute inset-0 rounded-full" style={{ backgroundColor: current.accent_color }} />
                )}
              </button>
            ))}
          </div>

          {/* Slide name */}
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.35 }}
              className="ml-1 hidden font-heading text-xs text-white/30 sm:block"
            >
              {current.subtitle}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
