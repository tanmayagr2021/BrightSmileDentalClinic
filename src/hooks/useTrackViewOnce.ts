'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

// Fires an analytics event the first time the attached element scrolls into
// view, then disconnects — for "X section viewed" style events that should
// only ever count once per page visit.
export function useTrackViewOnce<T extends HTMLElement = HTMLDivElement>(
  eventName: string,
  data?: Record<string, unknown>
) {
  const ref = useRef<T>(null)
  const fired = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || fired.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true
          trackEvent(eventName, data)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName])

  return ref
}
