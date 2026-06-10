'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from 'framer-motion'
import { HOMEPAGE_STATS } from '@/lib/constants'

function Counter({ count, suffix }: { count: number; suffix: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!isInView) return

    const duration = 1600
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * count))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [isInView, count])

  const formatted = display >= 1000 ? display.toLocaleString() : display

  return (
    <span ref={ref}>
      {formatted}{suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="bg-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {HOMEPAGE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center text-center"
            >
              <span className="font-display text-[2.75rem] font-bold leading-none text-primary sm:text-5xl lg:text-6xl">
                <Counter count={stat.count} suffix={stat.suffix} />
              </span>
              <span className="mt-2 font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-white/40 sm:text-xs">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
