'use client'

/**
 * DentalExpertiseMap
 * ------------------------------------------------------------------
 * A blueprint-style interactive diagram of the dental arch that maps
 * each doctor to the regions of the mouth they focus on.
 *
 * ADMIN / CMS WORKFLOW (no DB change required):
 * The regions a doctor lights up are derived automatically from that
 * doctor's existing `specializations` array (see SPECIALTY_TO_REGIONS).
 * When an admin edits a doctor's Specializations in the admin panel,
 * this map updates automatically — there is no separate "regions"
 * table or column to maintain.
 * ------------------------------------------------------------------
 */

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
  regions: string[] // derived from specializations via regionsFromSpecializations
}

const REGION_LABELS: Record<string, string> = {
  'upper-right': 'Upper Right',
  'upper-front': 'Upper Front',
  'upper-left': 'Upper Left',
  'lower-right': 'Lower Right',
  'lower-front': 'Lower Front',
  'lower-left': 'Lower Left',
  'full-arch': 'Full Arch',
  surgical: 'Surgical Sites',
}

const ANATOMICAL_REGIONS = [
  'upper-right',
  'upper-front',
  'upper-left',
  'lower-right',
  'lower-front',
  'lower-left',
] as const

const VIEW_W = 400
const VIEW_H = 460
const CENTER = { x: 200, y: 230 }

type Tooth = { id: string; x: number; y: number; rot: number; regions: string[] }

type Geometry = {
  teeth: Tooth[]
  gumPaths: { id: string; d: string }[]
  labels: { region: string; x: number; y: number; anchor: 'start' | 'middle' | 'end' }[]
  connectors: { region: string; x1: number; y1: number; x2: number; y2: number }[]
}

function buildGeometry(): Geometry {
  const arcs = [
    {
      arch: 'upper',
      cx: 200,
      cy: 72,
      rx: 150,
      ry: 138,
      start: 18,
      end: 162,
      regions: ['upper-right', 'upper-front', 'upper-left'],
    },
    {
      arch: 'lower',
      cx: 200,
      cy: 388,
      rx: 150,
      ry: 138,
      start: 342,
      end: 198,
      regions: ['lower-right', 'lower-front', 'lower-left'],
    },
  ]

  const teeth: Tooth[] = []
  const gumPaths: { id: string; d: string }[] = []
  const count = 16
  const splits = [5, 11]

  for (const a of arcs) {
    const gumPts: { x: number; y: number }[] = []
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const deg = a.start + (a.end - a.start) * t
      const rad = (deg * Math.PI) / 180
      const x = a.cx + a.rx * Math.cos(rad)
      const y = a.cy + a.ry * Math.sin(rad)

      let region: string
      if (i < splits[0]) region = a.regions[0]
      else if (i < splits[1]) region = a.regions[1]
      else region = a.regions[2]
      const regions = [region, 'full-arch']
      if (i === 0 || i === count - 1) regions.push('surgical')

      teeth.push({ id: `${a.arch}-${i}`, x, y, rot: deg + 90, regions })

      // Gum line sits just outside the teeth (away from arch centre).
      const dx = x - a.cx
      const dy = y - a.cy
      const len = Math.hypot(dx, dy) || 1
      gumPts.push({ x: x + (dx / len) * 15, y: y + (dy / len) * 15 })
    }
    gumPaths.push({
      id: a.arch,
      d: gumPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '),
    })
  }

  // Region centroids → labels + connectors
  const labels: Geometry['labels'] = []
  const connectors: Geometry['connectors'] = []
  for (const region of ANATOMICAL_REGIONS) {
    const ts = teeth.filter((tooth) => tooth.regions.includes(region))
    const cx = ts.reduce((s, p) => s + p.x, 0) / ts.length
    const cy = ts.reduce((s, p) => s + p.y, 0) / ts.length

    connectors.push({ region, x1: CENTER.x, y1: CENTER.y, x2: cx, y2: cy })

    const dx = cx - CENTER.x
    const dy = cy - CENTER.y
    const len = Math.hypot(dx, dy) || 1
    const lx = cx + (dx / len) * 44
    const ly = cy + (dy / len) * 44
    const anchor: 'start' | 'middle' | 'end' = lx < 150 ? 'end' : lx > 250 ? 'start' : 'middle'
    labels.push({ region, x: lx, y: ly, anchor })
  }

  return { teeth, gumPaths, labels, connectors }
}

const GEO = buildGeometry()

export default function DentalExpertiseMap({ doctors }: { doctors: MapDoctor[] }) {
  const prefersReduced = useReducedMotion()
  const [hoveredDoctor, setHoveredDoctor] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const doctorById = useMemo(() => new Map(doctors.map((d) => [d.id, d])), [doctors])

  const activeRegions = useMemo<Set<string>>(() => {
    if (hoveredDoctor) return new Set(doctorById.get(hoveredDoctor)?.regions ?? [])
    if (hoveredRegion) return new Set([hoveredRegion])
    return new Set()
  }, [hoveredDoctor, hoveredRegion, doctorById])

  const activeDoctorIds = useMemo<Set<string>>(() => {
    if (hoveredRegion) {
      return new Set(
        doctors
          .filter((d) => d.regions.includes(hoveredRegion) || (hoveredRegion === 'full-arch' && d.regions.includes('full-arch')))
          .map((d) => d.id),
      )
    }
    if (hoveredDoctor) return new Set([hoveredDoctor])
    return new Set()
  }, [hoveredRegion, hoveredDoctor, doctors])

  const isToothActive = (tooth: Tooth) => tooth.regions.some((r) => activeRegions.has(r))
  const isRegionActive = (region: string) =>
    activeRegions.has(region) || (activeRegions.has('full-arch') && region !== 'surgical')

  // Split doctors across the two sides of the diagram on desktop.
  const mid = Math.ceil(doctors.length / 2)
  const leftDoctors = doctors.slice(0, mid)
  const rightDoctors = doctors.slice(mid)

  const drawTransition = prefersReduced ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-12 text-center">
        <span className="inline-flex items-center gap-3 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold">
          <span className="inline-block h-px w-7 bg-gold/60" />
          The Map of Care
          <span className="inline-block h-px w-7 bg-gold/60" />
        </span>
        <h2 className="mt-4 font-display text-4xl text-white tracking-display leading-[1.06] sm:text-5xl">
          Expertise at a Glance
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-base text-white/75 leading-relaxed">
          Hover a doctor or region to see their area of focus.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)_1fr] lg:items-center lg:gap-8">
        {/* SVG — order first on mobile, centre on desktop */}
        <div className="order-1 lg:order-2 lg:col-start-2">
          <motion.svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="mx-auto h-auto w-full max-w-[420px]"
            role="img"
            aria-label="Diagram of the dental arch showing each specialist's area of focus"
            initial={prefersReduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            <defs>
              <pattern id="dem-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="dem-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Blueprint grid */}
            <motion.rect
              width={VIEW_W}
              height={VIEW_H}
              fill="url(#dem-grid)"
              initial={prefersReduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 0.02 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            />

            {/* Centre node */}
            <circle cx={CENTER.x} cy={CENTER.y} r="40" fill="url(#dem-glow)" />
            <circle cx={CENTER.x} cy={CENTER.y} r="3" fill="#C5A059" fillOpacity="0.8" />

            {/* Connector lines from centre outward */}
            <g>
              {GEO.connectors.map((c, i) => {
                const active = isRegionActive(c.region)
                return (
                  <motion.line
                    key={c.region}
                    x1={c.x1}
                    y1={c.y1}
                    x2={c.x2}
                    y2={c.y2}
                    stroke={active ? '#C5A059' : 'rgba(255,255,255,0.12)'}
                    strokeWidth={active ? 1.4 : 0.8}
                    strokeDasharray="2 3"
                    style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
                    initial={prefersReduced ? false : { pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: prefersReduced ? 0 : 0.9 + i * 0.06 }}
                  />
                )
              })}
            </g>

            {/* Gum arcs — draw themselves */}
            {GEO.gumPaths.map((g, i) => (
              <motion.path
                key={g.id}
                d={g.d}
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1"
                strokeLinecap="round"
                initial={prefersReduced ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ ...drawTransition, delay: prefersReduced ? 0 : 0.2 + i * 0.15 }}
              />
            ))}

            {/* Teeth */}
            <g>
              {GEO.teeth.map((tooth, i) => {
                const active = isToothActive(tooth)
                return (
                  <g key={tooth.id} transform={`rotate(${tooth.rot.toFixed(1)} ${tooth.x.toFixed(1)} ${tooth.y.toFixed(1)})`}>
                    <motion.ellipse
                      cx={tooth.x}
                      cy={tooth.y}
                      rx={6.5}
                      ry={9.5}
                      fill={active ? 'rgba(197,160,89,0.9)' : 'rgba(255,255,255,0.06)'}
                      stroke={active ? '#C5A059' : 'rgba(255,255,255,0.22)'}
                      strokeWidth={active ? 1.2 : 0.8}
                      style={{ transition: 'fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease' }}
                      initial={prefersReduced ? false : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: prefersReduced ? 0 : 0.5 + i * 0.018 }}
                    />
                  </g>
                )
              })}
            </g>

            {/* Region labels */}
            <g>
              {GEO.labels.map((l, i) => {
                const active = isRegionActive(l.region)
                return (
                  <motion.text
                    key={l.region}
                    x={l.x}
                    y={l.y}
                    textAnchor={l.anchor}
                    dominantBaseline="middle"
                    fontSize="8"
                    letterSpacing="1"
                    style={{ transition: 'fill 0.3s ease', textTransform: 'uppercase', cursor: 'pointer' }}
                    fill={active ? '#C5A059' : 'rgba(255,255,255,0.45)'}
                    fontWeight={active ? 700 : 500}
                    onMouseEnter={() => setHoveredRegion(l.region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    initial={prefersReduced ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: prefersReduced ? 0 : 1.3 + i * 0.05 }}
                  >
                    {REGION_LABELS[l.region]}
                  </motion.text>
                )
              })}
            </g>

            {/* Hover targets per anatomical region (larger hit area) */}
            <g>
              {GEO.connectors.map((c) => (
                <circle
                  key={`hit-${c.region}`}
                  cx={c.x2}
                  cy={c.y2}
                  r="26"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredRegion(c.region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
              ))}
            </g>
          </motion.svg>

          {/* Legend for whole-mouth regions */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {(['full-arch', 'surgical'] as const).map((region) => {
              const active = isRegionActive(region) || activeRegions.has(region)
              return (
                <button
                  key={region}
                  type="button"
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onFocus={() => setHoveredRegion(region)}
                  onBlur={() => setHoveredRegion(null)}
                  className={`rounded-full border px-3 py-1 font-heading text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition-all ${
                    active
                      ? 'border-gold/50 bg-gold/15 text-gold'
                      : 'border-white/12 bg-white/[0.04] text-white/60 hover:text-white/80'
                  }`}
                >
                  {REGION_LABELS[region]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Left doctor column */}
        <DoctorColumn
          doctors={leftDoctors}
          className="order-2 grid grid-cols-2 gap-3 lg:order-1 lg:col-start-1 lg:grid-cols-1"
          activeDoctorIds={activeDoctorIds}
          onEnter={setHoveredDoctor}
          onLeave={() => setHoveredDoctor(null)}
          prefersReduced={!!prefersReduced}
          align="right"
        />

        {/* Right doctor column */}
        <DoctorColumn
          doctors={rightDoctors}
          className="order-3 grid grid-cols-2 gap-3 lg:col-start-3 lg:grid-cols-1"
          activeDoctorIds={activeDoctorIds}
          onEnter={setHoveredDoctor}
          onLeave={() => setHoveredDoctor(null)}
          prefersReduced={!!prefersReduced}
          align="left"
        />
      </div>
    </div>
  )
}

function DoctorColumn({
  doctors,
  className,
  activeDoctorIds,
  onEnter,
  onLeave,
  prefersReduced,
  align,
}: {
  doctors: MapDoctor[]
  className: string
  activeDoctorIds: Set<string>
  onEnter: (id: string) => void
  onLeave: () => void
  prefersReduced: boolean
  align: 'left' | 'right'
}) {
  return (
    <div className={className}>
      {doctors.map((d, i) => {
        const active = activeDoctorIds.has(d.id)
        return (
          <motion.button
            key={d.id}
            type="button"
            onMouseEnter={() => onEnter(d.id)}
            onMouseLeave={onLeave}
            onFocus={() => onEnter(d.id)}
            onBlur={onLeave}
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: prefersReduced ? 0 : 0.2 + i * 0.1 }}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left backdrop-blur-sm transition-all duration-300 ${
              active
                ? 'border-gold/40 bg-gold/[0.08] -translate-y-0.5 shadow-glass-dark'
                : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
            } ${align === 'right' ? 'lg:flex-row-reverse lg:text-right' : ''}`}
          >
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold text-white ring-2 ring-white/15"
              style={{ backgroundColor: d.color }}
            >
              {d.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading text-sm font-semibold text-white">{d.shortName}</span>
              {d.title && (
                <span className="block truncate font-body text-xs text-white/72">{d.title}</span>
              )}
              <span className={`mt-1.5 flex flex-wrap gap-1 ${align === 'right' ? 'lg:justify-end' : ''}`}>
                {d.specializations.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className={`rounded-md px-1.5 py-0.5 font-heading text-[0.58rem] font-semibold transition-colors ${
                      active ? 'bg-gold/20 text-gold' : 'bg-white/8 text-white/72'
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
