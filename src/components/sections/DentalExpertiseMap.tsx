'use client'

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// Re-exports for backward compat — doctors/page.tsx imports from here
export { regionsFromSpecializations, SPECIALTY_TO_REGIONS } from '@/lib/dental-regions'

// ─── MapDoctor type ─────────────────────────────────────────────────────────────

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

// ─── SVG Geometry ───────────────────────────────────────────────────────────────

const VW = 560
const VH = 520
const UPPER = { cx: 270, cy: 28, rx: 208, ry: 200, a0: 20, a1: 160 }
const LOWER = { cx: 270, cy: 472, rx: 193, ry: 208, a0: 200, a1: 340 }
const ARCH_CENTER_Y = 260

function toothSize(i: number): { w: number; h: number } {
  const d = Math.abs(i - 7.5)
  if (d < 1) return { w: 8.5, h: 13 }
  if (d < 2) return { w: 7.5, h: 12 }
  if (d < 3) return { w: 8, h: 12.5 }
  if (d < 5.5) return { w: 10, h: 9.5 }
  return { w: 12.5, h: 8 }
}

function toothRegions(name: 'upper' | 'lower', i: number): string[] {
  const regions: string[] = []
  if (name === 'upper') {
    if (i <= 4) regions.push('upper-right')
    else if (i <= 10) regions.push('upper-front')
    else regions.push('upper-left')
  } else {
    if (i <= 4) regions.push('lower-left')
    else if (i <= 10) regions.push('lower-front')
    else regions.push('lower-right')
  }
  regions.push('full-arch', 'orthodontics')
  if (i === 0 || i === 15) regions.push('surgical')
  if ((i >= 1 && i <= 3) || (i >= 12 && i <= 14)) regions.push('implants')
  if (i >= 4 && i <= 11) regions.push('periodontics')
  return regions
}

interface ToothData {
  id: string
  x: number
  y: number
  rot: number
  w: number
  h: number
  regions: string[]
}

function buildTeeth(arch: typeof UPPER, name: 'upper' | 'lower'): ToothData[] {
  return Array.from({ length: 16 }, (_, i) => {
    const t = i / 15
    const deg = arch.a0 + (arch.a1 - arch.a0) * t
    const rad = (deg * Math.PI) / 180
    const x = arch.cx + arch.rx * Math.cos(rad)
    const y = arch.cy + arch.ry * Math.sin(rad)
    const rot = Math.atan2(arch.cy - y, arch.cx - x) * (180 / Math.PI)
    const { w, h } = toothSize(i)
    return { id: `${name}-${i}`, x, y, rot, w, h, regions: toothRegions(name, i) }
  })
}

function archOutlinePath(arch: typeof UPPER): string {
  const startRad = (arch.a0 * Math.PI) / 180
  const endRad = (arch.a1 * Math.PI) / 180
  const x1 = arch.cx + arch.rx * Math.cos(startRad)
  const y1 = arch.cy + arch.ry * Math.sin(startRad)
  const x2 = arch.cx + arch.rx * Math.cos(endRad)
  const y2 = arch.cy + arch.ry * Math.sin(endRad)
  const largeArc = arch.a1 - arch.a0 > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${arch.rx} ${arch.ry} 0 ${largeArc} 1 ${x2} ${y2}`
}

function gumPath(teeth: ToothData[], arch: typeof UPPER): string {
  const pts = teeth.map(({ x, y }) => {
    const dx = x - arch.cx
    const dy = y - arch.cy
    const len = Math.sqrt(dx * dx + dy * dy)
    return { x: x + (dx / len) * 16, y: y + (dy / len) * 16 }
  })
  const [first, ...rest] = pts
  return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ')
}

function regionPolygon(teeth: ToothData[], arch: typeof UPPER): string {
  if (teeth.length === 0) return ''
  const outer = teeth.map(({ x, y }) => {
    const dx = x - arch.cx; const dy = y - arch.cy
    const len = Math.sqrt(dx * dx + dy * dy)
    return { x: x + (dx / len) * 16, y: y + (dy / len) * 16 }
  })
  const inner = [...teeth].reverse().map(({ x, y }) => {
    const dx = x - arch.cx; const dy = y - arch.cy
    const len = Math.sqrt(dx * dx + dy * dy)
    return { x: x - (dx / len) * 8, y: y - (dy / len) * 8 }
  })
  return [...outer, ...inner].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
}

// ─── Static computed geometry ───────────────────────────────────────────────────

const UPPER_TEETH = buildTeeth(UPPER, 'upper')
const LOWER_TEETH = buildTeeth(LOWER, 'lower')
const ALL_TEETH: ToothData[] = [...UPPER_TEETH, ...LOWER_TEETH]
const UPPER_GUM_PATH = gumPath(UPPER_TEETH, UPPER)
const LOWER_GUM_PATH = gumPath(LOWER_TEETH, LOWER)
const UPPER_ARCH_PATH = archOutlinePath(UPPER)
const LOWER_ARCH_PATH = archOutlinePath(LOWER)

// ─── Region system ──────────────────────────────────────────────────────────────

const ALL_REGION_IDS = [
  'upper-right', 'upper-front', 'upper-left',
  'lower-right', 'lower-front', 'lower-left',
  'surgical', 'implants', 'periodontics', 'orthodontics', 'full-arch',
] as const
type RegionId = typeof ALL_REGION_IDS[number]

const REGION_LABELS: Record<RegionId, string> = {
  'upper-right': 'UPPER RIGHT', 'upper-front': 'UPPER FRONT', 'upper-left': 'UPPER LEFT',
  'lower-right': 'LOWER RIGHT', 'lower-front': 'LOWER FRONT', 'lower-left': 'LOWER LEFT',
  surgical: 'SURGICAL', implants: 'IMPLANTS', periodontics: 'PERIODONTICS',
  orthodontics: 'ORTHODONTICS', 'full-arch': 'FULL ARCH',
}

function centroid(teeth: ToothData[]): { x: number; y: number } {
  if (teeth.length === 0) return { x: VW / 2, y: VH / 2 }
  return {
    x: teeth.reduce((a, t) => a + t.x, 0) / teeth.length,
    y: teeth.reduce((a, t) => a + t.y, 0) / teeth.length,
  }
}

// ─── Region anchors (connector line targets in SVG viewBox coords) ──────────────

export const REGION_ANCHORS: Record<string, { x: number; y: number; label: string }> =
  Object.fromEntries(
    ALL_REGION_IDS.map(id => {
      const teeth = ALL_TEETH.filter(t => t.regions.includes(id))
      const c = centroid(teeth)
      return [id, { x: c.x, y: c.y, label: REGION_LABELS[id] }]
    }),
  )

// ─── Region geo for SVG rendering ──────────────────────────────────────────────

interface RegionGeo {
  id: RegionId
  polygon: string
  centroid: { x: number; y: number }
  labelPos: { x: number; y: number }
  label: string
}

const SVG_CENTER = { x: VW / 2, y: ARCH_CENTER_Y }

function buildRegionGeo(regionId: RegionId): RegionGeo {
  const isUpper = regionId.startsWith('upper')
  const isLower = regionId.startsWith('lower')
  const teethForRegion = ALL_TEETH.filter(t => t.regions.includes(regionId))
  let poly = ''
  if (isUpper) {
    poly = regionPolygon(UPPER_TEETH.filter(t => t.regions.includes(regionId)), UPPER)
  } else if (isLower) {
    poly = regionPolygon(LOWER_TEETH.filter(t => t.regions.includes(regionId)), LOWER)
  } else {
    const p1 = regionPolygon(UPPER_TEETH.filter(t => t.regions.includes(regionId)), UPPER)
    const p2 = regionPolygon(LOWER_TEETH.filter(t => t.regions.includes(regionId)), LOWER)
    poly = [p1, p2].filter(Boolean).join(' ')
  }
  const c = centroid(teethForRegion)
  const dx = c.x - SVG_CENTER.x
  const dy = c.y - SVG_CENTER.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const labelPos = { x: c.x + (dx / len) * 32, y: c.y + (dy / len) * 32 }
  return { id: regionId, polygon: poly, centroid: c, labelPos, label: REGION_LABELS[regionId] }
}

const ANATOMICAL_REGIONS: RegionId[] = [
  'upper-right', 'upper-front', 'upper-left', 'lower-right', 'lower-front', 'lower-left',
]
const LABEL_REGIONS: RegionId[] = [
  'upper-right', 'upper-front', 'upper-left', 'lower-right', 'lower-front', 'lower-left', 'surgical',
]
const REGION_GEOS: RegionGeo[] = ALL_REGION_IDS.map(buildRegionGeo)

// ─── Color tokens ───────────────────────────────────────────────────────────────

const GOLD = '#C5A059'
const GOLD_FILL_ACTIVE = 'rgba(197,160,89,0.14)'
const TOOTH_DEFAULT_FILL = 'rgba(255,255,255,0.12)'
const TOOTH_DEFAULT_STROKE = 'rgba(255,255,255,0.45)'
const TOOTH_ACTIVE_FILL = 'rgba(197,160,89,0.9)'

// ─── BlueprintArch SVG Component ────────────────────────────────────────────────

interface BlueprintArchProps {
  svgRef?: React.RefObject<SVGSVGElement>
  activeRegions: Set<string>
  hoveredRegion: string | null
  prefersReduced: boolean
  onRegionEnter: (r: string) => void
  onRegionLeave: () => void
}

function BlueprintArch({
  svgRef,
  activeRegions,
  hoveredRegion,
  prefersReduced,
  onRegionEnter,
  onRegionLeave,
}: BlueprintArchProps) {
  const delay = (t: number) => (prefersReduced ? 0 : t)

  function archMotion(d: number) {
    if (prefersReduced) {
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
    }
    return {
      initial: { pathLength: 0 as number },
      animate: { pathLength: 1 as number },
      transition: { duration: 1.0, delay: d },
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full h-auto"
      style={{ maxHeight: `${VH}px` }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="bp-grid" width={28} height={28} patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth={0.3} />
        </pattern>
        <filter id="region-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx={0} dy={0} stdDeviation={4} floodColor={GOLD} floodOpacity={0.25} />
        </filter>
      </defs>

      {/* Layer 1 — Blueprint grid */}
      <motion.rect
        x={0} y={0} width={VW} height={VH} fill="url(#bp-grid)"
        initial={{ opacity: 0 }} animate={{ opacity: 0.04 }}
        transition={{ duration: 0.4, delay: delay(0) }}
      />

      {/* Layer 2 — Axis lines */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: delay(0) }}>
        <line x1={270} y1={0} x2={270} y2={VH} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
        <line x1={0} y1={ARCH_CENTER_Y} x2={VW} y2={ARCH_CENTER_Y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
      </motion.g>

      {/* Layer 3 — Region zone fills */}
      {ANATOMICAL_REGIONS.map(regionId => {
        const geo = REGION_GEOS.find(g => g.id === regionId)!
        const isActive = activeRegions.has(regionId) || hoveredRegion === regionId
        return (
          <motion.g key={regionId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: delay(0.15) }}>
            <path
              d={geo.polygon}
              fill={isActive ? GOLD_FILL_ACTIVE : 'rgba(255,255,255,0.04)'}
              style={{
                transition: 'fill 0.25s ease, filter 0.25s ease',
                filter: isActive ? 'drop-shadow(0 0 8px rgba(197,160,89,0.25))' : 'none',
              }}
            />
            <circle
              cx={geo.centroid.x} cy={geo.centroid.y} r={28}
              fill="transparent" style={{ cursor: 'pointer' }}
              onMouseEnter={() => onRegionEnter(regionId)}
              onMouseLeave={onRegionLeave}
            />
          </motion.g>
        )
      })}

      {/* Layer 4 — Arch outlines */}
      <motion.path d={UPPER_ARCH_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="5 3" {...archMotion(0.2)} />
      <motion.path d={LOWER_ARCH_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="5 3" {...archMotion(0.2)} />

      {/* Layer 5 — Gum arcs */}
      <motion.path d={UPPER_GUM_PATH} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" {...archMotion(0.4)} />
      <motion.path d={LOWER_GUM_PATH} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" {...archMotion(0.4)} />

      {/* Layer 6 — Teeth */}
      {ALL_TEETH.map((tooth, idx) => {
        const { x, y, rot, w, h, id, regions } = tooth
        const isActive = regions.some(r => activeRegions.has(r) || hoveredRegion === r)
        return (
          <motion.rect
            key={id}
            transform={`translate(${x},${y}) rotate(${rot})`}
            x={-w / 2} y={-h / 2} width={w} height={h} rx={2}
            fill={isActive ? TOOTH_ACTIVE_FILL : TOOTH_DEFAULT_FILL}
            stroke={isActive ? GOLD : TOOTH_DEFAULT_STROKE}
            strokeWidth={isActive ? 1.5 : 0.9}
            style={{ transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: delay(0.55 + idx * 0.012), duration: 0.2 }}
          />
        )
      })}

      {/* Layer 7 — Region anchor dots */}
      {ALL_REGION_IDS.map(regionId => {
        const anchor = REGION_ANCHORS[regionId]
        const isActive = activeRegions.has(regionId) || hoveredRegion === regionId
        return (
          <motion.circle
            key={`dot-${regionId}`}
            cx={anchor.x} cy={anchor.y}
            r={isActive ? 4 : 3}
            fill={isActive ? GOLD : 'rgba(255,255,255,0.35)'}
            style={{ transition: 'fill 0.25s ease' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: delay(0.9), duration: 0.3 }}
          />
        )
      })}

      {/* Layer 8 — Region labels */}
      {LABEL_REGIONS.map((regionId, li) => {
        const geo = REGION_GEOS.find(g => g.id === regionId)!
        const isActive = activeRegions.has(regionId) || hoveredRegion === regionId
        return (
          <motion.text
            key={`label-${regionId}`}
            x={geo.labelPos.x} y={geo.labelPos.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={7} fontFamily="monospace" letterSpacing={1.5}
            fill={isActive ? GOLD : 'rgba(255,255,255,0.45)'}
            style={{ textTransform: 'uppercase', transition: 'fill 0.25s ease', pointerEvents: 'none' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: delay(1.1 + li * 0.07), duration: 0.3 }}
          >
            {geo.label}
          </motion.text>
        )
      })}

      {/* Layer 9 — Center crosshair */}
      <line x1={260} y1={ARCH_CENTER_Y} x2={280} y2={ARCH_CENTER_Y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <line x1={270} y1={ARCH_CENTER_Y - 10} x2={270} y2={ARCH_CENTER_Y + 10} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
    </svg>
  )
}

// ─── Connector Lines ─────────────────────────────────────────────────────────────

const REGION_PRIORITY: readonly string[] = [
  'surgical', 'implants', 'periodontics', 'orthodontics',
  'upper-front', 'lower-front', 'upper-right', 'upper-left',
  'lower-right', 'lower-left', 'full-arch',
]

function primaryRegions(regions: string[]): string[] {
  return REGION_PRIORITY.filter(p => regions.includes(p)).slice(0, 2)
}

interface LineData {
  id: string
  doctorId: string
  region: string
  d: string
  isActive: boolean
}

interface ConnectorLinesProps {
  doctors: MapDoctor[]
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  wrapperRef: React.RefObject<HTMLDivElement>
  svgRef: React.RefObject<SVGSVGElement>
  hoveredDoctor: string | null
  hoveredRegion: string | null
  leftDoctorIds: Set<string>
  prefersReduced: boolean
}

function computeLines(
  doctors: MapDoctor[],
  cardRefs: Map<string, HTMLDivElement>,
  wrapperEl: HTMLDivElement,
  svgEl: SVGSVGElement,
  leftDoctorIds: Set<string>,
  hoveredDoctor: string | null,
  hoveredRegion: string | null,
): LineData[] {
  const wRect = wrapperEl.getBoundingClientRect()
  const sRect = svgEl.getBoundingClientRect()
  const scaleX = sRect.width / VW
  const scaleY = sRect.height / VH

  const activeDocIds: Set<string> = hoveredDoctor
    ? new Set([hoveredDoctor])
    : hoveredRegion
      ? new Set(doctors.filter(d => d.regions.includes(hoveredRegion)).map(d => d.id))
      : new Set()

  const lines: LineData[] = []
  for (const doc of doctors) {
    const cardEl = cardRefs.get(doc.id)
    if (!cardEl) continue
    const cRect = cardEl.getBoundingClientRect()
    const isLeft = leftDoctorIds.has(doc.id)
    const cardX = isLeft ? cRect.right - wRect.left : cRect.left - wRect.left
    const cardY = cRect.top - wRect.top + cRect.height / 2

    for (const region of primaryRegions(doc.regions)) {
      const anchor = REGION_ANCHORS[region]
      if (!anchor) continue
      const svgX = sRect.left - wRect.left + anchor.x * scaleX
      const svgY = sRect.top - wRect.top + anchor.y * scaleY
      const dx = svgX - cardX
      lines.push({
        id: `${doc.id}-${region}`,
        doctorId: doc.id,
        region,
        d: `M ${cardX.toFixed(1)} ${cardY.toFixed(1)} C ${(cardX + dx * 0.45).toFixed(1)} ${cardY.toFixed(1)}, ${(cardX + dx * 0.55).toFixed(1)} ${svgY.toFixed(1)}, ${svgX.toFixed(1)} ${svgY.toFixed(1)}`,
        isActive: activeDocIds.has(doc.id) || hoveredRegion === region,
      })
    }
  }
  return lines
}

function ConnectorLines({
  doctors, cardRefs, wrapperRef, svgRef, hoveredDoctor, hoveredRegion, leftDoctorIds, prefersReduced,
}: ConnectorLinesProps) {
  const [lines, setLines] = useState<LineData[]>([])

  const recompute = useCallback(() => {
    if (!wrapperRef.current || !svgRef.current) return
    setLines(computeLines(
      doctors, cardRefs.current, wrapperRef.current, svgRef.current,
      leftDoctorIds, hoveredDoctor, hoveredRegion,
    ))
  }, [doctors, cardRefs, wrapperRef, svgRef, leftDoctorIds, hoveredDoctor, hoveredRegion])

  useEffect(() => { recompute() }, [recompute])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(recompute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [wrapperRef, recompute])

  if (lines.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 20 }}>
      <svg width="100%" height="100%" style={{ overflow: 'visible' }} aria-hidden="true">
        <defs>
          <marker id="arrowhead-dim" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 1 L 7 4 L 0 7 Z" fill="rgba(255,255,255,0.35)" />
          </marker>
          <marker id="arrowhead-gold" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 1 L 7 4 L 0 7 Z" fill="#C5A059" />
          </marker>
        </defs>

        {/* Always-visible dim base lines */}
        {lines.map((ln, i) => (
          <motion.path
            key={`dim-${ln.id}`}
            d={ln.d}
            stroke={ln.isActive ? 'rgba(197,160,89,0.35)' : 'rgba(255,255,255,0.14)'}
            strokeWidth={ln.isActive ? 1.2 : 0.8}
            strokeDasharray="4 4"
            fill="none"
            markerEnd={ln.isActive ? 'url(#arrowhead-gold)' : 'url(#arrowhead-dim)'}
            style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
            initial={prefersReduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: prefersReduced ? 0 : 0.6, delay: prefersReduced ? 0 : 0.9 + i * 0.07, ease: 'easeOut' }}
          />
        ))}

        {/* Active bright lines on top */}
        <AnimatePresence>
          {lines.filter(ln => ln.isActive).map(ln => (
            <motion.path
              key={`active-${ln.id}`}
              d={ln.d}
              stroke="#C5A059"
              strokeWidth={1.6}
              strokeDasharray="5 3"
              fill="none"
              markerEnd="url(#arrowhead-gold)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}

// ─── Section Heading ─────────────────────────────────────────────────────────────

function SpecializationMapHeading() {
  return (
    <div className="mb-12 text-center">
      <span className="inline-flex items-center gap-3 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
        <span className="inline-block h-px w-8 bg-[#C5A059]/50" />
        Clinical Specialization Map
        <span className="inline-block h-px w-8 bg-[#C5A059]/50" />
      </span>
      <h2
        className="mt-4 font-display text-4xl text-white sm:text-5xl"
        style={{ letterSpacing: '-0.02em' }}
      >
        Where Specialists Join Your Care
      </h2>
      <p className="mx-auto mt-4 max-w-xl font-body text-[0.95rem] leading-relaxed text-white/70">
        For advanced expertise, your lead dentist coordinates specialists into a single, seamless treatment journey.
      </p>
    </div>
  )
}

// ─── Doctor Annotation Card ──────────────────────────────────────────────────────

interface DoctorAnnotationCardProps {
  doctor: MapDoctor
  isActive: boolean
  side: 'left' | 'right'
  index: number
  prefersReduced: boolean
  cardRef: (el: HTMLDivElement | null) => void
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}

function DoctorAnnotationCard({
  doctor, isActive, side, index, prefersReduced, cardRef, onEnter, onLeave, onClick,
}: DoctorAnnotationCardProps) {
  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`View ${doctor.shortName}'s profile`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      initial={prefersReduced ? false : { opacity: 0, x: side === 'left' ? -14 : 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: prefersReduced ? 0 : 0.65 + index * 0.09 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full cursor-pointer rounded-xl border p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1128] ${
        isActive
          ? 'border-[#C5A059]/40 bg-[#C5A059]/[0.07]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
      }`}
    >
      {/* SVG-facing color bar */}
      <div
        className={`absolute top-3 bottom-3 w-[2px] rounded-full transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-30'} ${side === 'left' ? 'right-0 translate-x-[1px]' : 'left-0 -translate-x-[1px]'}`}
        style={{ backgroundColor: doctor.color }}
      />

      {/* Identity row */}
      <div className={`mb-2 flex items-center gap-2.5 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold text-white"
          style={{ backgroundColor: doctor.color }}
        >
          {doctor.initials}
        </div>
        <div className={`min-w-0 flex-1 ${side === 'left' ? 'text-right' : 'text-left'}`}>
          <p className="truncate font-heading text-xs font-semibold leading-tight text-white">
            {doctor.shortName}
          </p>
          {doctor.title && (
            <p className="mt-0.5 truncate font-heading text-[0.58rem] leading-tight text-white/75">
              {doctor.title}
            </p>
          )}
        </div>
      </div>

      {/* Specialty chips */}
      <div className={`flex flex-wrap gap-1 ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
        {doctor.specializations.slice(0, 2).map(s => (
          <span
            key={s}
            className={`rounded px-1.5 py-0.5 font-heading text-[0.52rem] font-semibold uppercase tracking-wide transition-colors duration-200 ${
              isActive ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-white/[0.06] text-white/75'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Doctor Column ───────────────────────────────────────────────────────────────

interface DoctorColumnProps {
  doctors: MapDoctor[]
  side: 'left' | 'right'
  activeDoctorIds: Set<string>
  prefersReduced: boolean
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  onEnter: (id: string) => void
  onLeave: () => void
  router: ReturnType<typeof useRouter>
}

function DoctorColumn({ doctors, side, activeDoctorIds, prefersReduced, cardRefs, onEnter, onLeave, router }: DoctorColumnProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${side === 'left' ? 'items-end' : 'items-start'}`}>
      {doctors.map((doc, i) => (
        <DoctorAnnotationCard
          key={doc.id}
          doctor={doc}
          isActive={activeDoctorIds.has(doc.id)}
          side={side}
          index={i}
          prefersReduced={prefersReduced}
          cardRef={el => { if (el) cardRefs.current.set(doc.id, el); else cardRefs.current.delete(doc.id) }}
          onEnter={() => onEnter(doc.id)}
          onLeave={onLeave}
          onClick={() => { if (doc.slug) router.push(`/doctors/${doc.slug}`) }}
        />
      ))}
    </div>
  )
}

// ─── Mobile Card Grid ─────────────────────────────────────────────────────────────

interface MobileCardGridProps {
  doctors: MapDoctor[]
  activeDoctorIds: Set<string>
  prefersReduced: boolean
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  onEnter: (id: string) => void
  onLeave: () => void
  router: ReturnType<typeof useRouter>
}

function MobileCardGrid({ doctors, activeDoctorIds, prefersReduced, cardRefs, onEnter, onLeave, router }: MobileCardGridProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2">
      {doctors.map((doc, i) => (
        <DoctorAnnotationCard
          key={doc.id}
          doctor={doc}
          isActive={activeDoctorIds.has(doc.id)}
          side="right"
          index={i}
          prefersReduced={prefersReduced}
          cardRef={el => { if (el) cardRefs.current.set(doc.id, el); else cardRefs.current.delete(doc.id) }}
          onEnter={() => onEnter(doc.id)}
          onLeave={onLeave}
          onClick={() => { if (doc.slug) router.push(`/doctors/${doc.slug}`) }}
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────────

export default function DentalExpertiseMap({ doctors }: { doctors: MapDoctor[] }) {
  const [hoveredDoctor, setHoveredDoctor] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const prefersReduced = useReducedMotion() ?? false
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const mid = Math.ceil(doctors.length / 2)
  const leftDoctors = doctors.slice(0, mid)
  const rightDoctors = doctors.slice(mid)
  const leftDoctorIds = useMemo(() => new Set(leftDoctors.map(d => d.id)), [leftDoctors])

  const activeDoctorIds = useMemo<Set<string>>(() => {
    if (hoveredDoctor) return new Set([hoveredDoctor])
    if (hoveredRegion) return new Set(doctors.filter(d => d.regions.includes(hoveredRegion)).map(d => d.id))
    return new Set()
  }, [hoveredDoctor, hoveredRegion, doctors])

  const activeRegions = useMemo<Set<string>>(() => {
    const regions = new Set<string>()
    for (const id of activeDoctorIds) {
      doctors.find(d => d.id === id)?.regions.forEach(r => regions.add(r))
    }
    return regions
  }, [activeDoctorIds, doctors])

  const handleDoctorEnter = useCallback((id: string) => {
    setHoveredDoctor(id)
    setHoveredRegion(null)
  }, [])
  const handleDoctorLeave = useCallback(() => { setHoveredDoctor(null) }, [])
  const handleRegionEnter = useCallback((r: string) => { setHoveredRegion(r); setHoveredDoctor(null) }, [])
  const handleRegionLeave = useCallback(() => { setHoveredRegion(null) }, [])

  const sharedColumnProps = {
    activeDoctorIds, prefersReduced, cardRefs,
    onEnter: handleDoctorEnter, onLeave: handleDoctorLeave, router,
  }

  const archProps = {
    activeRegions, hoveredRegion, prefersReduced,
    onRegionEnter: handleRegionEnter, onRegionLeave: handleRegionLeave,
  }

  return (
    <section className="relative overflow-hidden bg-[#0A1128] py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1A7A5E]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SpecializationMapHeading />

        {/* Desktop — 3-column clinical map */}
        <div
          ref={wrapperRef}
          className="relative hidden lg:grid"
          style={{ gridTemplateColumns: '240px 1fr 240px', gap: '24px', alignItems: 'center' }}
        >
          <DoctorColumn doctors={leftDoctors} side="left" {...sharedColumnProps} />
          <BlueprintArch svgRef={svgRef} {...archProps} />
          <DoctorColumn doctors={rightDoctors} side="right" {...sharedColumnProps} />

          <ConnectorLines
            doctors={doctors}
            cardRefs={cardRefs}
            wrapperRef={wrapperRef}
            svgRef={svgRef}
            hoveredDoctor={hoveredDoctor}
            hoveredRegion={hoveredRegion}
            leftDoctorIds={leftDoctorIds}
            prefersReduced={prefersReduced}
          />
        </div>

        {/* Mobile — SVG above card grid */}
        <div className="lg:hidden">
          <div className="mx-auto max-w-sm">
            <BlueprintArch {...archProps} />
          </div>
          <MobileCardGrid doctors={doctors} {...sharedColumnProps} />
        </div>
      </div>
    </section>
  )
}
