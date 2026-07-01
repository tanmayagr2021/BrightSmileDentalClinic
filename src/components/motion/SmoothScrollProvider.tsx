'use client'

import { ReactLenis, type LenisRef } from 'lenis/react'
import { cancelFrame, frame } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface SmoothScrollProviderProps {
  children: React.ReactNode
}

// Drives Lenis off Framer Motion's own frame loop so scroll and every
// scroll-linked transform (parallax, progress bars) tick on the same clock —
// running them on separate rAFs is what causes the classic 1-frame jitter.
export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return

    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp)
    }

    frame.update(update, true)
    return () => cancelFrame(update)
  }, [reduced])

  // Reduced motion: skip Lenis entirely and fall back to native scroll.
  if (reduced) return <>{children}</>

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.1,
        duration: 1.2,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
      }}
    >
      {children}
    </ReactLenis>
  )
}
