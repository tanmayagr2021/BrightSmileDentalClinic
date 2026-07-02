'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

const THRESHOLDS = [25, 50, 75, 100]

// Fires "Scroll Depth" once per threshold per page visit. Mount once per
// page — intended for the homepage per the analytics spec.
export default function ScrollDepthTracker() {
  const fired = useRef<Set<number>>(new Set())

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = (window.scrollY / scrollable) * 100

      for (const threshold of THRESHOLDS) {
        if (pct >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold)
          trackEvent('Scroll Depth', { percent: threshold })
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}
