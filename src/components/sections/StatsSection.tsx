'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView, motion } from 'framer-motion'
import { HOMEPAGE_STATS } from '@/lib/constants'

function Counter({ count, suffix }: { count: number; suffix: string }) {
  // Start at actual count so SSR/no-JS users always see the real value.
  // Animation resets to 0 and counts up when the section enters the viewport.
  const [display, setDisplay] = useState(count)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const animated = useRef(false)

  useEffect(() => {
    if (!isInView || animated.current) return
    animated.current = true
    const duration = 1800
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * count))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, count])

  const formatted = display >= 1000 ? display.toLocaleString() : display

  return <span ref={ref}>{formatted}{suffix}</span>
}

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #081912 0%, #1A3D2B 55%, #0f2e1e 100%)' }}>
      {/* Architectural grid overlay */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]" aria-hidden="true">
        <defs>
          <pattern id="stats-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stats-grid)" />
      </svg>

      {/* Radial glow accents */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-48 w-48 translate-x-1/2 translate-y-1/2 rounded-full bg-teal/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-2 gap-0 sm:grid-cols-4">
          {HOMEPAGE_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              className="group relative flex flex-col items-center justify-center py-10 text-center"
            >
              {/* Vertical separator */}
              {i > 0 && (
                <span className="pointer-events-none absolute left-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent sm:block" aria-hidden="true" />
              )}

              {/* Number */}
              <span className="font-display text-[3rem] font-bold leading-none text-primary sm:text-[3.5rem] lg:text-[4.5rem] tabular-nums">
                <Counter count={stat.count} suffix={stat.suffix} />
              </span>

              {/* Thin accent line */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
                className="mx-auto mt-3 block h-px w-8 origin-left bg-primary/40"
                aria-hidden="true"
              />

              <span className="mt-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40 sm:text-xs">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
