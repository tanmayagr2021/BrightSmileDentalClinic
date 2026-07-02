'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

// Fires an analytics event once when mounted — for "X Viewed" events on
// server-rendered detail pages, where the event can't be attached inline
// (event handlers/effects can't live in a Server Component).
export default function TrackOnMount({ event, data }: { event: string; data?: Record<string, unknown> }) {
  useEffect(() => {
    trackEvent(event, data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  return null
}
