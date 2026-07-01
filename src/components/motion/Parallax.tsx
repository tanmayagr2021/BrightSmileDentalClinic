'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface ParallaxProps {
  children: React.ReactNode
  /** Fraction of travel, kept small (5–15%) for a layered feel without being distracting. */
  strength?: number
  className?: string
}

export default function Parallax({ children, strength = 0.1, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ['0%', '0%'] : [`-${strength * 100}%`, `${strength * 100}%`]
  )

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
