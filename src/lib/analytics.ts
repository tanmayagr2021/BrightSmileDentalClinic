// Umami analytics — privacy-first, no cookies, env-driven. Every helper here
// is a safe no-op when analytics isn't configured or the script hasn't
// loaded yet (ad-blockers, slow network), so call sites never need to guard.

export const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
export const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
export const UMAMI_DASHBOARD_URL = process.env.NEXT_PUBLIC_UMAMI_DASHBOARD_URL

export const ANALYTICS_ENABLED = Boolean(UMAMI_SCRIPT_URL && UMAMI_WEBSITE_ID)

type UmamiGlobal = {
  track: (nameOrView: string | ((props: Record<string, unknown>) => Record<string, unknown>), data?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    umami?: UmamiGlobal
  }
}

// Fire a custom event. Never throws — a tracking failure must never break
// the feature it's attached to.
export function trackEvent(name: string, data?: Record<string, unknown>) {
  try {
    window.umami?.track(name, data)
  } catch {
    // no-op
  }
}

// Fire a pageview for a specific path — used by the route-change tracker
// instead of Umami's built-in auto-track, which doesn't reliably see
// Next.js App Router client-side navigations.
export function trackPageview(url: string) {
  try {
    window.umami?.track((props) => ({ ...props, url }))
  } catch {
    // no-op
  }
}
