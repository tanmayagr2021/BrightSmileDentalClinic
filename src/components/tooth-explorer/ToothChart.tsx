'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TOOTH_LAYOUT, VIEWBOX, CENTER_X } from '@/lib/tooth-layout'

export type ToothStatus = 'default' | 'active' | 'selected'

interface ToothChartProps {
  /** tooth_number set that has admin content configured (renders solid vs. faded) */
  activeToothNumbers: Set<number>
  selectedToothNumber: number | null
  onSelectTooth: (toothNumber: number) => void
  /** tooth_number -> display name, for meaningful accessible labels. Falls back to "Tooth #N". */
  toothNames?: Record<number, string>
}

export default function ToothChart({ activeToothNumbers, selectedToothNumber, onSelectTooth, toothNames }: ToothChartProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <svg viewBox={VIEWBOX} className="h-full w-full" aria-label="Interactive dental chart, 32 teeth. Use Tab to move between teeth and Enter or Space to select one.">
      <defs>
        <radialGradient id="tooth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C5A059" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bite line */}
      <line x1={CENTER_X - 250} y1={250} x2={CENTER_X + 250} y2={250} stroke="#ffffff" strokeOpacity={0.06} strokeDasharray="2 6" strokeWidth={1.5} aria-hidden="true" />
      <text x={CENTER_X} y={246} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.25} fontSize={10} letterSpacing={2} aria-hidden="true">
        UPPER ARCH
      </text>
      <text x={CENTER_X} y={266} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.25} fontSize={10} letterSpacing={2} aria-hidden="true">
        LOWER ARCH
      </text>

      {TOOTH_LAYOUT.map((t) => {
        const isSelected = selectedToothNumber === t.toothNumber
        const isActive = activeToothNumbers.has(t.toothNumber)
        const label = toothNames?.[t.toothNumber] ?? `Tooth ${t.toothNumber}`
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
            aria-label={`${label}${isActive ? '' : ' (details coming soon)'}`}
            className="cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 rounded-full"
            initial={false}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.12 }}
            whileFocus={prefersReducedMotion ? undefined : { scale: 1.12 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            {isSelected && (
              <circle r={Math.max(t.width, t.height) * 1.15} fill="url(#tooth-glow)" aria-hidden="true" />
            )}
            <motion.rect
              x={-t.width / 2}
              y={-t.height / 2}
              width={t.width}
              height={t.height}
              rx={t.width * 0.32}
              animate={{
                fill: isSelected ? '#C5A059' : isActive ? '#F0F7F2' : 'rgba(255,255,255,0.14)',
                stroke: isSelected ? '#C5A059' : 'rgba(255,255,255,0.35)',
              }}
              transition={{ duration: 0.3 }}
              strokeWidth={1}
            />
          </motion.g>
        )
      })}
    </svg>
  )
}
