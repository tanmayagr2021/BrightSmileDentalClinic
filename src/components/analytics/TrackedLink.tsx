'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { trackEvent } from '@/lib/analytics'

// Wraps next/link with a click-tracked analytics event — lets Server
// Component pages attach click tracking without passing a function prop
// across the server/client boundary (which Next.js disallows).
export default function TrackedLink({
  event,
  data,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { event: string; data?: Record<string, unknown> }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent(event, data)
        onClick?.(e)
      }}
    />
  )
}
