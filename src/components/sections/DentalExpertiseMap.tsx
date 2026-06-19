'use client'

/**
 * DentalExpertiseMap
 * ------------------------------------------------------------------
 * Blueprint-style interactive occlusal-view dental arch diagram.
 * Regions are auto-derived from each doctor's specializations array.
 * ------------------------------------------------------------------
 */

import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'

// Re-export from shared lib so server components can import without touching 'use client'
export { regionsFromSpecializations, SPECIALTY_TO_REGIONS } from '@/lib/dental-regions'

export type MapDoctor = {
  id: string
  name: string
  shortName: string
  initials: string
  color: string
  title: string | null
  specializations: string[]
  regions: string[]
  slug?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VIEW_W = 540
const VIEW_H = 500
const CX = 270  // SVG center X
const CY = 250  // SVG center Y

type ArchCfg = { readonly cx: number; readonly cy: number; readonly rx: number; readonly ry: number; readonly a0: number; readonly a1: number }

const UPPER: ArchCfg = { cx: 270, cy: 28,  rx: 208, ry: 200, a0: 20,  a1: 160 }
const LOWER: ArchCfg = { cx: 270, cy: 472, rx: 193, ry: 208, a0: 200, a1: 340 }

const REGION_LABEL: Record<string, string> = {
  'upper-right': 'Upper Right',
  'upper-front': 'Upper Front',
  'upper-left':  'Upper Left',
  'lower-right': 'Lower Right',
  'lower-front': 'Lower Front',
  'lower-left':  'Lower Left',
  'full-arch':   'Full Arch',
  'surgical':    'Surgical Sites',
  'implants':    'Implants',
  'orthodontics':'Orthodontics',
  'periodontics':'Periodontics',
}

const CROSS_ARCH_PILLS = [
  { id: 'full-arch',    label: 'Full Arch' },
  { id: 'surgical',     label: 'Surgical Sites' },
  { id: 'implants',     label: 'Implants' },
  { id: 'orthodontics', label: 'Orthodontics' },
  { id: 'periodontics', label: 'Periodontics' },
]

const ANATOMICAL_REGIONS = [
  'upper-right', 'upper-front', 'upper-left',
  'lower-right', 'lower-front', 'lower-left',
] as const

// ─── Geometry Types ───────────────────────────────────────────────────────────
type ToothData = {
  id: string
  x: number
  y: number
  rot: number
  w: number
  h: number
  regions: string[]
  archCx: number
  archCy: number
}

type RegionGeo = {
  region: string
  polygon: string
  centroid: { x: number; y: number }
  labelX: number
  labelY: number
  labelAnchor: 'start' | 'middle' | 'end'
}

type LinePos = { id: string; x1: number; y1: number; x2: number; y2: number }

// ─── Geometry Helpers ─────────────────────────────────────────────────────────
function toothSize(i: number): { w: number; h: number } {
  const d = Math.abs(i - 7.5)
  if (d < 1)   return { w: 8.5,  h: 13   }  // centrals
  if (d < 2)   return { w: 7.5,  h: 12   }  // laterals
  if (d < 3)   return { w: 8,    h: 12.5 }  // canines
  if (d < 5.5) return { w: 10,   h: 9.5  }  // premolars
  return               { w: 12.5, h: 8   }  // molars
}

function toothRegions(arch: 'upper' | 'lower', i: number): string[] {
  const out: string[] = ['full-arch', 'orthodontics']
  if (arch === 'upper') {
    if (i <= 4)       out.push('upper-right')
    else if (i <= 10) out.push('upper-front')
    else              out.push('upper-left')
  } else {
    if (i <= 4)       out.push('lower-left')
    else if (i <= 10) out.push('lower-front')
    else              out.push('lower-right')
  }
  if (i === 0 || i === 15)                       out.push('surgical')
  if ((i >= 1 && i <= 3) || (i >= 12 && i <= 14)) out.push('implants')
  if (i >= 4 && i <= 11)                          out.push('periodontics')
  return out
}

function buildTeeth(arch: ArchCfg, name: 'upper' | 'lower'): ToothData[] {
  return Array.from({ length: 16 }, (_, i): ToothData => {
    const t   = i / 15
    const deg = arch.a0 + (arch.a1 - arch.a0) * t
    const rad = (deg * Math.PI) / 180
    const x   = arch.cx + arch.rx * Math.cos(rad)
    const y   = arch.cy + arch.ry * Math.sin(rad)
    const rot = Math.atan2(arch.cy - y, arch.cx - x) * (180 / Math.PI)
    const { w, h } = toothSize(i)
    return { id: `${name}-${i}`, x, y, rot, w, h, regions: toothRegions(name, i), archCx: arch.cx, archCy: arch.cy }
  })
}

function gumPath(teeth: ToothData[], cx: number, cy: number): string {
  const pts = teeth.map(t => {
    const dx = t.x - cx, dy = t.y - cy, len = Math.hypot(dx, dy) || 1
    return { x: t.x + (dx / len) * 16, y: t.y + (dy / len) * 16 }
  })
  return pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
}

function archOutlinePath(arch: ArchCfg): string {
  const r0 = arch.a0 * Math.PI / 180, r1 = arch.a1 * Math.PI / 180
  const x1 = arch.cx + arch.rx * Math.cos(r0), y1 = arch.cy + arch.ry * Math.sin(r0)
  const x2 = arch.cx + arch.rx * Math.cos(r1), y2 = arch.cy + arch.ry * Math.sin(r1)
  const da = Math.abs(arch.a1 - arch.a0)
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${arch.rx} ${arch.ry} 0 ${da > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

function regionPolygon(teeth: ToothData[], cx: number, cy: number): string {
  if (!teeth.length) return ''
  const outer = teeth.map(t => {
    const dx = t.x - cx, dy = t.y - cy, len = Math.hypot(dx, dy) || 1
    return { x: t.x + (dx / len) * 14, y: t.y + (dy / len) * 14 }
  })
  const inner = [...teeth].reverse().map(t => {
    const dx = t.x - cx, dy = t.y - cy, len = Math.hypot(dx, dy) || 1
    return { x: t.x - (dx / len) * 7, y: t.y - (dy / len) * 7 }
  })
  return [...outer, ...inner].map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
}

// ─── Static Geometry (module-level, computed once) ────────────────────────────
const UPPER_TEETH  = buildTeeth(UPPER, 'upper')
const LOWER_TEETH  = buildTeeth(LOWER, 'lower')
const ALL_TEETH    = [...UPPER_TEETH, ...LOWER_TEETH]
const UPPER_GUM    = gumPath(UPPER_TEETH, UPPER.cx, UPPER.cy)
const LOWER_GUM    = gumPath(LOWER_TEETH, LOWER.cx, LOWER.cy)
const UPPER_OUTLINE = archOutlinePath(UPPER)
const LOWER_OUTLINE = archOutlinePath(LOWER)

const REGION_GEOS: RegionGeo[] = ANATOMICAL_REGIONS.map(region => {
  const isUp = region.startsWith('upper')
  const acx = isUp ? UPPER.cx : LOWER.cx
  const acy = isUp ? UPPER.cy : LOWER.cy
  const ts  = ALL_TEETH.filter(t => t.regions.includes(region))
  const cx  = ts.reduce((s, t) => s + t.x, 0) / (ts.length || 1)
  const cy  = ts.reduce((s, t) => s + t.y, 0) / (ts.length || 1)
  const dx  = cx - CX, dy = cy - CY, len = Math.hypot(dx, dy) || 1
  const lx  = cx + (dx / len) * 32, ly = cy + (dy / len) * 32
  const anchor: 'start' | 'middle' | 'end' = lx < CX - 50 ? 'end' : lx > CX + 50 ? 'start' : 'middle'
  return {
    region,
    polygon: regionPolygon(ts, acx, acy),
    centroid: { x: cx, y: cy },
    labelX: lx, labelY: ly, labelAnchor: anchor,
  }
})

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DentalExpertiseMap({ doctors }: { doctors: MapDoctor[] }) {
  const router        = useRouter()
  const prefersReduced = useReducedMotion()
  const sectionRef    = useRef<HTMLDivElement>(null)
  const wrapperRef    = useRef<HTMLDivElement>(null)
  const svgRef        = useRef<SVGSVGElement>(null)
  const cardRefs      = useRef(new Map<string, HTMLDivElement>())

  const [hoveredDoctor, setHoveredDoctor] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [lines, setLines]                 = useState<LinePos[]>([])

  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  // Mutable refs so computeLines doesn't need them as effect deps
  const activeDoctorIdsRef = useRef<Set<string>>(new Set())
  const doctorsRef         = useRef<MapDoctor[]>(doctors)
  doctorsRef.current = doctors

  // ── Derived state ──────────────────────────────────────────────────────────
  const activeRegions = useMemo<Set<string>>(() => {
    if (hoveredDoctor) {
      const doc = doctors.find(d => d.id === hoveredDoctor)
      return new Set(doc?.regions ?? [])
    }
    if (hoveredRegion) return new Set([hoveredRegion])
    return new Set()
  }, [hoveredDoctor, hoveredRegion, doctors])

  const activeDoctorIds = useMemo<Set<string>>(() => {
    if (hoveredDoctor) return new Set([hoveredDoctor])
    if (hoveredRegion) {
      return new Set(doctors.filter(d => d.regions.includes(hoveredRegion)).map(d => d.id))
    }
    return new Set()
  }, [hoveredDoctor, hoveredRegion, doctors])

  activeDoctorIdsRef.current = activeDoctorIds

  // ── Connection line computation ────────────────────────────────────────────
  const computeLines = useCallback(() => {
    if (!wrapperRef.current || !svgRef.current) { setLines([]); return }
    const activeIds = activeDoctorIdsRef.current
    if (activeIds.size === 0) { setLines([]); return }

    const wRect = wrapperRef.current.getBoundingClientRect()
    const sRect = svgRef.current.getBoundingClientRect()
    const sx    = sRect.width  / VIEW_W
    const sy    = sRect.height / VIEW_H
    const newLines: LinePos[] = []

    for (const docId of activeIds) {
      const cardEl = cardRefs.current.get(docId)
      if (!cardEl) continue
      const cRect = cardEl.getBoundingClientRect()
      const cardX = cRect.left - wRect.left + cRect.width  / 2
      const cardY = cRect.top  - wRect.top  + cRect.height / 2
      const doc   = doctorsRef.current.find(d => d.id === docId)
      if (!doc) continue
      for (const rg of REGION_GEOS) {
        if (!doc.regions.includes(rg.region)) continue
        newLines.push({
          id: `${docId}-${rg.region}`,
          x1: sRect.left - wRect.left + rg.centroid.x * sx,
          y1: sRect.top  - wRect.top  + rg.centroid.y * sy,
          x2: cardX,
          y2: cardY,
        })
      }
    }
    setLines(newLines)
  }, [])

  useEffect(() => { computeLines() }, [hoveredDoctor, hoveredRegion, computeLines])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(computeLines)
    ro.observe(el)
    return () => ro.disconnect()
  }, [computeLines])

  // ── Doctor split ───────────────────────────────────────────────────────────
  const mid          = Math.ceil(doctors.length / 2)
  const leftDoctors  = doctors.slice(0, mid)
  const rightDoctors = doctors.slice(mid)

  // ── Animation helpers ──────────────────────────────────────────────────────
  const d = (base: number) => prefersReduced ? 0 : base
  const show = inView

  const isToothActive   = (tooth: ToothData) => tooth.regions.some(r => activeRegions.has(r))
  const isRegionActive  = (region: string)   => activeRegions.has(region) || (activeRegions.has('full-arch') && region !== 'surgical')

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div ref={sectionRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* Heading */}
      <motion.div
        className="mb-14 text-center"
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.5, delay: d(0) }}
      >
        <span className="inline-flex items-center gap-3 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold">
          <span className="inline-block h-px w-8 bg-gold/50" />
          Dental Coverage Map
          <span className="inline-block h-px w-8 bg-gold/50" />
        </span>
        <h2 className="mt-4 font-display text-4xl text-white sm:text-5xl" style={{ letterSpacing: '-0.02em' }}>
          Every Region. Every Specialist.
        </h2>
        <p className="mx-auto mt-4 max-w-lg font-body text-[0.94rem] leading-relaxed text-white/72">
          A coordinated network covering the full spectrum of dental care — hover any doctor or region to explore.
        </p>
      </motion.div>

      {/* 3-column layout */}
      <div
        ref={wrapperRef}
        className="relative grid gap-6 lg:grid-cols-[1fr_minmax(300px,440px)_1fr] lg:items-center lg:gap-8"
      >
        {/* Connection line overlay (desktop only) */}
        <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
          <svg width="100%" height="100%" className="overflow-visible" aria-hidden="true">
            <AnimatePresence>
              {lines.map(ln => (
                <motion.path
                  key={ln.id}
                  d={`M ${ln.x1} ${ln.y1} L ${ln.x2} ${ln.y2}`}
                  stroke="#C5A059"
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>
          </svg>
        </div>

        {/* ── Left doctor column ── */}
        <div className="order-2 grid grid-cols-2 gap-3 lg:order-1 lg:col-start-1 lg:grid-cols-1">
          {leftDoctors.map((doc, i) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              active={activeDoctorIds.has(doc.id)}
              align="right"
              index={i}
              prefersReduced={!!prefersReduced}
              cardRefs={cardRefs}
              onEnter={setHoveredDoctor}
              onLeave={() => setHoveredDoctor(null)}
              onClick={() => { if (doc.slug) router.push(`/doctors/${doc.slug}`) }}
            />
          ))}
        </div>

        {/* ── Center: SVG blueprint ── */}
        <div className="order-1 lg:order-2 lg:col-start-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="mx-auto h-auto w-full max-w-sm lg:max-w-none"
            role="img"
            aria-label="Occlusal view of dental arches showing each specialist's area of focus"
          >
            <defs>
              {/* Blueprint grid pattern */}
              <pattern id="dem-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.4" opacity="0.025" />
              </pattern>
              {/* Gold glow filter */}
              <filter id="dem-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feColorMatrix in="blur" type="matrix"
                  values="1 0.8 0 0 0  0.8 0.6 0 0 0  0 0 0 0 0  0 0 0 0.8 0"
                  result="gold" />
                <feMerge><feMergeNode in="gold" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Layer 1: Blueprint grid */}
            <motion.rect
              width={VIEW_W} height={VIEW_H}
              fill="url(#dem-grid)"
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: d(0) }}
            />

            {/* Layer 2: Construction lines */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: d(1.1) }}
            >
              <line x1={CX} y1={0}      x2={CX}     y2={VIEW_H} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <line x1={0}  y1={CY}     x2={VIEW_W} y2={CY}     stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <line x1={80} y1={60}     x2={460}    y2={440}    stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <line x1={460} y1={60}    x2={80}     y2={440}    stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            </motion.g>

            {/* Layer 3: Measurement annotations */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, delay: d(0.9) }}
              fontSize="5"
              fill="rgba(255,255,255,0.25)"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              <text x="18" y="22">UL ○3</text>
              <text x="490" y="22" textAnchor="end">UR ○3</text>
              <text x="18" y="490">LL ○3</text>
              <text x="490" y="490" textAnchor="end">LR ○3</text>
              {/* Tick marks */}
              <line x1="16" y1="28" x2="28" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <line x1="512" y1="28" x2="524" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <line x1="16" y1="472" x2="28" y2="472" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <line x1="512" y1="472" x2="524" y2="472" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            </motion.g>

            {/* Layer 4: Arch outline paths */}
            <motion.path
              d={UPPER_OUTLINE}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.8"
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={show ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: d(0.15) }}
            />
            <motion.path
              d={LOWER_OUTLINE}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.8"
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={show ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: d(0.25) }}
            />

            {/* Layer 5: Gum arcs */}
            <motion.path
              d={UPPER_GUM}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={show ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: d(0.4) }}
            />
            <motion.path
              d={LOWER_GUM}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={show ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: d(0.5) }}
            />

            {/* Layer 6: Region fills */}
            {REGION_GEOS.map(rg => {
              const active = isRegionActive(rg.region)
              return (
                <path
                  key={`fill-${rg.region}`}
                  d={rg.polygon}
                  fill={active ? 'rgba(197,160,89,0.12)' : 'rgba(255,255,255,0.035)'}
                  style={{
                    transition: 'fill 0.3s ease',
                    filter: active ? 'drop-shadow(0 0 6px rgba(197,160,89,0.3))' : 'none',
                  }}
                />
              )
            })}

            {/* Layer 7: Teeth */}
            {ALL_TEETH.map((tooth, i) => {
              const active = isToothActive(tooth)
              return (
                <motion.rect
                  key={tooth.id}
                  x={-tooth.w / 2}
                  y={-tooth.h / 2}
                  width={tooth.w}
                  height={tooth.h}
                  rx={2}
                  transform={`translate(${tooth.x.toFixed(2)},${tooth.y.toFixed(2)}) rotate(${tooth.rot.toFixed(1)})`}
                  fill={active ? 'rgba(197,160,89,0.88)' : 'rgba(255,255,255,0.07)'}
                  stroke={active ? '#C5A059' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={active ? 1.2 : 0.8}
                  style={{ transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease' }}
                  initial={{ opacity: 0 }}
                  animate={show ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.25, delay: d(0.55 + i * 0.015) }}
                />
              )
            })}

            {/* Layer 8: Center crosshair */}
            <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.8">
              <line x1={CX - 8} y1={CY}     x2={CX + 8} y2={CY} />
              <line x1={CX}     y1={CY - 8} x2={CX}     y2={CY + 8} />
            </g>

            {/* Layer 9: Region labels — hover targets */}
            {REGION_GEOS.map((rg, i) => {
              const active = isRegionActive(rg.region)
              return (
                <g key={`label-${rg.region}`}>
                  {/* Hit area */}
                  <circle
                    cx={rg.centroid.x}
                    cy={rg.centroid.y}
                    r={28}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredRegion(rg.region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />
                  <motion.text
                    x={rg.labelX}
                    y={rg.labelY}
                    textAnchor={rg.labelAnchor}
                    dominantBaseline="middle"
                    fontSize="7"
                    letterSpacing="1.2"
                    fontWeight={active ? 700 : 500}
                    fill={active ? '#C5A059' : 'rgba(255,255,255,0.4)'}
                    style={{
                      textTransform: 'uppercase',
                      transition: 'fill 0.3s ease',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onMouseEnter={() => setHoveredRegion(rg.region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    initial={{ opacity: 0 }}
                    animate={show ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.25, delay: d(1.3 + i * 0.06) }}
                  >
                    {REGION_LABEL[rg.region]}
                  </motion.text>
                </g>
              )
            })}

            {/* Region centroid pulse on reveal */}
            {REGION_GEOS.map((rg, i) => (
              <motion.circle
                key={`pulse-${rg.region}`}
                cx={rg.centroid.x}
                cy={rg.centroid.y}
                r={3}
                fill="#C5A059"
                fillOpacity={0}
                initial={{ scale: 0, opacity: 0 }}
                animate={show ? { scale: [0, 1.2, 1], opacity: [0, 0.6, 0] } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: d(1.8 + i * 0.08), ease: 'easeOut' }}
                style={{ originX: `${rg.centroid.x}px`, originY: `${rg.centroid.y}px` }}
              />
            ))}
          </svg>

          {/* Cross-arch region pills */}
          <motion.div
            className="mt-5 flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: d(1.4) }}
          >
            {CROSS_ARCH_PILLS.map(pill => {
              const active = activeRegions.has(pill.id)
              return (
                <button
                  key={pill.id}
                  type="button"
                  onMouseEnter={() => setHoveredRegion(pill.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onFocus={() => setHoveredRegion(pill.id)}
                  onBlur={() => setHoveredRegion(null)}
                  className={`rounded-full border px-3 py-1 font-heading text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition-all ${
                    active
                      ? 'border-gold/50 bg-gold/15 text-gold'
                      : 'border-white/12 bg-white/[0.04] text-white/55 hover:text-white/75'
                  }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </motion.div>
        </div>

        {/* ── Right doctor column ── */}
        <div className="order-3 grid grid-cols-2 gap-3 lg:col-start-3 lg:grid-cols-1">
          {rightDoctors.map((doc, i) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              active={activeDoctorIds.has(doc.id)}
              align="left"
              index={i}
              prefersReduced={!!prefersReduced}
              cardRefs={cardRefs}
              onEnter={setHoveredDoctor}
              onLeave={() => setHoveredDoctor(null)}
              onClick={() => { if (doc.slug) router.push(`/doctors/${doc.slug}`) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────
function DoctorCard({
  doctor,
  active,
  align,
  index,
  prefersReduced,
  cardRefs,
  onEnter,
  onLeave,
  onClick,
}: {
  doctor: MapDoctor
  active: boolean
  align: 'left' | 'right'
  index: number
  prefersReduced: boolean
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  onEnter: (id: string) => void
  onLeave: () => void
  onClick: () => void
}) {
  return (
    <motion.div
      ref={(el: HTMLDivElement | null) => {
        if (el) cardRefs.current.set(doctor.id, el)
        else cardRefs.current.delete(doctor.id)
      }}
      role="button"
      tabIndex={0}
      onMouseEnter={() => onEnter(doctor.id)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(doctor.id)}
      onBlur={onLeave}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={prefersReduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: prefersReduced ? 0 : 1.5 + index * 0.08 }}
      className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl border p-4 backdrop-blur-sm transition-all duration-300 ${
        active
          ? 'border-gold/40 bg-white/[0.07] -translate-y-0.5 shadow-glass-dark'
          : 'border-white/10 bg-white/[0.04] hover:border-white/[0.18] hover:bg-white/[0.065]'
      } ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <span
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold text-white ring-2 ring-white/15"
        style={{ backgroundColor: doctor.color }}
      >
        {doctor.initials}
      </span>

      {/* Info */}
      <div className={`min-w-0 flex-1 ${align === 'right' ? 'lg:text-right' : ''}`}>
        <p className="truncate font-heading text-sm font-semibold text-white">{doctor.shortName}</p>
        {doctor.title && (
          <p className="truncate font-body text-xs text-white/70">{doctor.title}</p>
        )}
        <div className={`mt-1.5 flex flex-wrap gap-1 ${align === 'right' ? 'lg:justify-end' : ''}`}>
          {doctor.specializations.slice(0, 2).map(s => (
            <span
              key={s}
              className={`rounded px-1.5 py-0.5 font-heading text-[0.55rem] font-semibold transition-colors ${
                active ? 'bg-gold/20 text-gold' : 'bg-white/8 text-white/65'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Active indicator dot */}
      <div
        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all ${
          active ? 'scale-150 bg-gold' : 'bg-white/20'
        }`}
      />
    </motion.div>
  )
}
