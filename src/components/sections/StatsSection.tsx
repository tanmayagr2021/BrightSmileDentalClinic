'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView, motion } from 'framer-motion'

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

type Stat = { count: number; suffix: string; label: string }

export default function StatsSection({ stats }: { stats: Stat[] }) {
  return (
    <section className="relative overflow-hidden bg-[#0E1B2E]">

      {/* Subtle dot-grid texture */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stat-dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stat-dot-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className={`grid gap-0 ${stats.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {stats.map((stat, i) => (
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
                <span
                  className="pointer-events-none absolute left-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent sm:block"
                  aria-hidden="true"
                />
              )}

              {/* Number + superscript suffix */}
              <div className="inline-flex items-start">
                <span className="font-display text-6xl font-bold leading-none text-white tabular-nums sm:text-7xl lg:text-[6rem]">
                  <Counter count={stat.count} suffix="" />
                </span>
                {stat.suffix && (
                  <span
                    className="ml-1 font-display text-3xl font-bold leading-none text-gold"
                    style={{ paddingTop: '0.35rem' }}
                  >
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Accent line */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
                className="mx-auto mt-4 block h-px w-12 origin-left bg-gold/60"
                aria-hidden="true"
              />

              <span className="mt-4 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
