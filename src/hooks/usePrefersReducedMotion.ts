'use client'

import { useEffect, useState } from 'react'

// JS-driven effects (Lenis, magnetic hover, parallax) ignore the global CSS
// reduced-motion override, so each one checks this directly.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
