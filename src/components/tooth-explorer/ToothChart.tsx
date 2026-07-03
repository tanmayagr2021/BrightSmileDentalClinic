'use client'

import { motion } from 'framer-motion'
import { TOOTH_LAYOUT, VIEWBOX, CENTER_X } from '@/lib/tooth-layout'

export type ToothStatus = 'default' | 'active' | 'selected'

interface ToothChartProps {
  /** tooth_number set that has admin content configured (renders solid vs. faded) */
  activeToothNumbers: Set<number>
  selectedToothNumber: number | null
  onSelectTooth: (toothNumber: number) => void
}

export default function ToothChart({ activeToothNumbers, selectedToothNumber, onSelectTooth }: ToothChartProps) {
  return (
    <svg viewBox={VIEWBOX} className="h-full w-full" role="img" aria-label="Interactive dental chart, 32 teeth">
      <defs>
        <radialGradient id="tooth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C5A059" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bite line */}
      <line x1={CENTER_X - 250} y1={250} x2={CENTER_X + 250} y2={250} stroke="#ffffff" strokeOpacity={0.06} strokeDasharray="2 6" strokeWidth={1.5} />
      <text x={CENTER_X} y={246} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.25} fontSize={10} letterSpacing={2}>
        UPPER ARCH
      </text>
      <text x={CENTER_X} y={266} textAnchor="middle" className="font-heading" fill="#ffffff" fillOpacity={0.25} fontSize={10} letterSpacing={2}>
        LOWER ARCH
      </text>

      {TOOTH_LAYOUT.map((t) => {
        const isSelected = selectedToothNumber === t.toothNumber
        const isActive = activeToothNumbers.has(t.toothNumber)
        return (
          <motion.g
            key={t.toothNumber}
            transform={`translate(${t.cx} ${t.cy}) rotate(${t.angleDeg})`}
            onClick={() => onSelectTooth(t.toothNumber)}
            style={{ cursor: 'pointer' }}
            initial={false}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            <title>{`Tooth #${t.toothNumber}`}</title>
            {isSelected && (
              <circle r={Math.max(t.width, t.height) * 1.15} fill="url(#tooth-glow)" />
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
