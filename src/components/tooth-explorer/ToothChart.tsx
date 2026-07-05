'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TOOTH_LAYOUT, VIEWBOX, CENTER_X, type ToothKind } from '@/lib/tooth-layout'

export type ToothStatus = 'default' | 'active' | 'selected'

// Current design tokens (tailwind.config.ts) — kept as local constants here
// since raw hex is the existing convention for SVG fill/stroke in this file.
export const GOLD = '#C9A24B' // primary/gold — selected tooth
export const IVORY = '#F5EFE4' // ivory — tooth has admin content configured
export const SAGE = '#9CAF88' // region-highlight only — distinct from the
// reserved verification `teal` (#0C3C2D), intentionally not a theme token
const SAGE_FILL = 'rgba(156,175,136,0.24)'
const ACCENT_SHADE = 'rgba(14,27,46,0.22)' // dark-navy overlay for cusps/edges

type CuspSpec = { dx: number; dy: number; r: number }
type CrownSpec = {
  rx: number
  cusps: CuspSpec[]
  point?: { halfWidth: number; tipExtend: number }
  edgeBar?: { halfWidth: number }
}

// Anatomically-motivated per-kind crown detail. All offsets are multipliers of
// the tooth's own width/height, layered on top of the existing base rect —
// no freeform path data.
const KIND_CROWN: Record<ToothKind, CrownSpec> = {
  'incisor-central': { rx: 0.18, cusps: [], edgeBar: { halfWidth: 0.3 } },
  'incisor-lateral': { rx: 0.2, cusps: [], edgeBar: { halfWidth: 0.28 } },
  canine: { rx: 0.16, cusps: [], point: { halfWidth: 0.28, tipExtend: 7 } },
  'premolar-1': { rx: 0.28, cusps: [{ dx: -0.19, dy: 0.22, r: 0.15 }, { dx: 0.19, dy: 0.22, r: 0.15 }] },
  'premolar-2': { rx: 0.28, cusps: [{ dx: -0.19, dy: 0.22, r: 0.15 }, { dx: 0.19, dy: 0.22, r: 0.15 }] },
  'molar-1': {
    rx: 0.34,
    cusps: [
      { dx: -0.2, dy: 0.14, r: 0.12 }, { dx: 0.2, dy: 0.14, r: 0.12 },
      { dx: -0.2, dy: 0.3, r: 0.12 }, { dx: 0.2, dy: 0.3, r: 0.12 },
    ],
  },
  'molar-2': {
    rx: 0.34,
    cusps: [
      { dx: -0.2, dy: 0.14, r: 0.12 }, { dx: 0.2, dy: 0.14, r: 0.12 },
      { dx: -0.2, dy: 0.3, r: 0.12 }, { dx: 0.2, dy: 0.3, r: 0.12 },
    ],
  },
  'molar-3': {
    rx: 0.3,
    cusps: [
      { dx: 0, dy: 0.12, r: 0.13 },
      { dx: -0.18, dy: 0.3, r: 0.13 }, { dx: 0.18, dy: 0.3, r: 0.13 },
    ],
  },
}

function caninePoints(width: number, height: number, halfWidth: number, tipExtend: number, occlusalSign: number) {
  const baseY = occlusalSign * (height / 2 - 2)
  const tipY = occlusalSign * (height / 2 + tipExtend)
  const hw = halfWidth * width
  return `${-hw},${baseY} ${hw},${baseY} 0,${tipY}`
}

interface ToothChartProps {
  /** tooth_number set that has admin content configured (renders solid vs. faded) */
  activeToothNumbers: Set<number>
  selectedToothNumber: number | null
  onSelectTooth: (toothNumber: number) => void
  /** tooth_number -> display name, for meaningful accessible labels. Falls back to "Tooth #N". */
  toothNames?: Record<number, string>
  /** tooth_number set for the active region-browsing chip, if any */
  regionToothNumbers?: Set<number>
  /** label of the active region chip, for accessible announcement */
  activeRegionLabel?: string
}

export default function ToothChart({
  activeToothNumbers,
  selectedToothNumber,
  onSelectTooth,
  toothNames,
  regionToothNumbers = new Set(),
  activeRegionLabel,
}: ToothChartProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <svg viewBox={VIEWBOX} className="h-full w-full" aria-label="Interactive dental chart, 32 teeth. Use Tab to move between teeth and Enter or Space to select one.">
      <defs>
        <radialGradient id="tooth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.55" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tooth-region-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SAGE} stopOpacity="0.35" />
          <stop offset="100%" stopColor={SAGE} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bite line — labels sit clear of the teeth: UPPER/LOWER ARCH above/below
          the whole arch (not at center, where front teeth sit closest to the
          bite line), and the orientation hint out at the margins, in the wide
          gap beside the canine/premolar teeth. */}
      <line x1={CENTER_X - 250} y1={250} x2={CENTER_X + 250} y2={250} stroke="#ffffff" strokeOpacity={0.06} strokeDasharray="2 6" strokeWidth={1.5} aria-hidden="true" />
      <text x={CENTER_X} y={36} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.25} fontSize={10} letterSpacing={2} aria-hidden="true">
        UPPER ARCH
      </text>
      <text x={CENTER_X} y={452} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.25} fontSize={10} letterSpacing={2} aria-hidden="true">
        LOWER ARCH
      </text>
      <text x={CENTER_X - 190} y={253} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.2} fontSize={8} letterSpacing={1.2} aria-hidden="true">
        {'◄ PATIENT’S RIGHT'}
      </text>
      <text x={CENTER_X + 190} y={253} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.2} fontSize={8} letterSpacing={1.2} aria-hidden="true">
        {'PATIENT’S LEFT ►'}
      </text>

      {TOOTH_LAYOUT.map((t) => {
        const isSelected = selectedToothNumber === t.toothNumber
        const isActive = activeToothNumbers.has(t.toothNumber)
        const inRegion = regionToothNumbers.has(t.toothNumber)
        const label = toothNames?.[t.toothNumber] ?? `Tooth ${t.toothNumber}`
        const crown = KIND_CROWN[t.kind]
        const occlusalSign = t.arch === 'upper' ? 1 : -1
        const rx = t.width * crown.rx

        const fill = isSelected ? GOLD : inRegion ? SAGE_FILL : isActive ? IVORY : 'rgba(255,255,255,0.14)'
        const stroke = isSelected ? GOLD : inRegion ? SAGE : 'rgba(255,255,255,0.35)'

        return (
          <motion.g
            key={t.toothNumber}
            transform={`translate(${t.cx} ${t.cy}) rotate(${t.angleDeg})`}
            onClick={() => onSelectTooth(t.toothNumber)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectTooth(t.toothNumber)
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${label}${inRegion && activeRegionLabel ? `, in ${activeRegionLabel}` : ''}${isActive ? '' : ' (details coming soon)'}`}
            className="cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 rounded-full"
            initial={false}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
            whileFocus={prefersReducedMotion ? undefined : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            {isSelected ? (
              <circle r={Math.max(t.width, t.height) * 1.15} fill="url(#tooth-glow)" aria-hidden="true" />
            ) : inRegion ? (
              <circle r={Math.max(t.width, t.height) * 1.05} fill="url(#tooth-region-glow)" aria-hidden="true" />
            ) : null}

            <motion.rect
              x={-t.width / 2}
              y={-t.height / 2}
              width={t.width}
              height={t.height}
              rx={rx}
              animate={{ fill, stroke }}
              transition={{ duration: 0.3 }}
              strokeWidth={1}
            />

            {crown.point && (
              <motion.polygon
                points={caninePoints(t.width, t.height, crown.point.halfWidth, crown.point.tipExtend, occlusalSign)}
                animate={{ fill, stroke }}
                transition={{ duration: 0.3 }}
                strokeWidth={1}
              />
            )}

            {crown.edgeBar && (
              <rect
                x={-crown.edgeBar.halfWidth * t.width}
                y={occlusalSign * (t.height / 2 - 3) - 1}
                width={crown.edgeBar.halfWidth * 2 * t.width}
                height={2}
                rx={1}
                fill={ACCENT_SHADE}
                aria-hidden="true"
              />
            )}

            {crown.cusps.map((c, i) => (
              <circle
                key={i}
                cx={c.dx * t.width}
                cy={occlusalSign * c.dy * t.height}
                r={c.r * t.width}
                fill={ACCENT_SHADE}
                aria-hidden="true"
              />
            ))}
          </motion.g>
        )
      })}
    </svg>
  )
}
