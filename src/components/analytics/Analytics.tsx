'use client'

import { Suspense, useEffect } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { ANALYTICS_ENABLED, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID, trackPageview } from '@/lib/analytics'

// Auto-track is disabled on the script tag below — Umami's built-in
// history.pushState patch fires before Next.js finishes updating the route,
// which can attribute a pageview to the page being left rather than the one
// being entered. Tracking explicitly on pathname change (including the
// first render, for the initial pageview) is accurate for the App Router.
function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    trackPageview(pathname + (query ? `?${query}` : ''))
  }, [pathname, searchParams])

  return null
}

export default function Analytics() {
  if (!ANALYTICS_ENABLED) return null

  return (
    <>
      {/* beforeInteractive here is intentional and correct per Next.js docs —
          App Router explicitly supports it in the root layout (this component
          is only ever mounted there), unlike the Pages Router where it's
          restricted to pages/_document.js. It gets the Umami script executing
          well ahead of the first RouteTracker effect, so window.umami is
          reliably ready in time for the initial pageview. The lint rule below
          predates App Router support for this strategy. */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script
        src={UMAMI_SCRIPT_URL}
        data-website-id={UMAMI_WEBSITE_ID}
        data-auto-track="false"
        data-do-not-track="true"
        strategy="beforeInteractive"
      />
      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
    </>
  )
}
