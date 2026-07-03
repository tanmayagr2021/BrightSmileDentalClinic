/** @type {import('next').NextConfig} */
const path = require('path')

// Umami's script origin, derived from the env var at build time so the CSP
// stays a strict allowlist without hardcoding any analytics provider/domain.
// Umami Cloud (cloud.umami.is) serves the script from one domain but sends
// collected events to a separate fixed domain, gateway.umami.is — both need
// to be in connect-src or every tracked event gets silently CSP-blocked.
// Self-hosted Umami sends to the same origin as the script, so this is a
// harmless unused allowlist entry in that case.
const umamiOrigin = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
  ? new URL(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).origin
  : null
const umamiConnectOrigins = umamiOrigin
  ? [umamiOrigin, 'https://gateway.umami.is']
  : []

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-site',
  },
  // Full nonce-based CSP is implemented in the security hardening phase.
  // This baseline policy is enforced from day one.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self'${umamiOrigin ? ` ${umamiOrigin}` : ''} 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      `connect-src 'self' https://*.supabase.co https://vitals.vercel-analytics.com${umamiConnectOrigins.length ? ` ${umamiConnectOrigins.join(' ')}` : ''}`,
      "frame-src https://www.openstreetmap.org",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig = {
  // Prevents Next.js from inferring a wrong workspace root when there are
  // multiple lock files detected on the machine.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  // Redirect /admin to /admin/dashboard for clean root access
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      // Phase 3 final information architecture: Tooth Explorer became the
      // flagship "Choose Your Tooth" page, and Trust Wall moved into About.
      {
        source: '/tooth-explorer',
        destination: '/choose-your-tooth',
        permanent: true,
      },
      {
        source: '/trust',
        destination: '/about',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
