// Temporary, CMS-replaceable stand-in for a service's photo. Shown whenever
// `thumbnail_url` is null — swaps out automatically once an admin uploads a
// real image via the Service Image field in /admin/services. Built as an
// inline SVG (matching this codebase's existing convention of hand-drawn
// decorative SVGs for hero grids/glows) rather than a placeholder photo
// asset, since none exists in this project yet.
export default function ServiceImagePlaceholder({ className = '', seed = 'default' }: { className?: string; seed?: string }) {
  const patternId = `svc-placeholder-grid-${seed}`
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-ivory to-cream ${className}`}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#C9A24B" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/60 shadow-sm sm:h-20 sm:w-20">
        <svg viewBox="0 0 64 64" className="h-8 w-8 opacity-70 sm:h-10 sm:w-10" aria-hidden="true">
          <path
            d="M32 10c-6.5 0-9.5 3.8-13 3.8-3.2 0-5.5-1.8-8-1.8-3.6 0-6 3.2-6 8.4 0 10.6 5.2 24.6 9.4 30.8 2 3 3.8 4.8 6.2 4.8 2.6 0 3.6-1.8 5.4-1.8s2.8 1.8 5.4 1.8c2.4 0 4.2-1.8 6.2-4.8 4.2-6.2 9.4-20.2 9.4-30.8 0-5.2-2.4-8.4-6-8.4-2.5 0-4.8 1.8-8 1.8-3.5 0-6.5-3.8-10.6-3.8z"
            fill="none"
            stroke="#C9A24B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
