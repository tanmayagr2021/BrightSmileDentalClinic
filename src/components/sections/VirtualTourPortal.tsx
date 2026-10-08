'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { trackEvent } from '@/lib/analytics'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const TOUR_HREF = '/gallery#virtual-tour'

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <ellipse cx="8" cy="8" rx="6.5" ry="3.1" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="8" cy="8" rx="3.1" ry="6.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface VirtualTourPortalProps {
  imageUrl: string | null
  roomName?: string | null
  variant: 'card' | 'teaser' | 'band'
}

// A compact, image-led "window into the clinic". The homepage uses the
// 'band' variant just below the hero; 'card'/'teaser' are the older in-hero
// placements, kept for reuse. Pulls its photo
// straight from a real Virtual Tour room (never a hardcoded/invented image),
// so if no room has a thumbnail yet, it renders nothing rather than fake it.
export default function VirtualTourPortal({ imageUrl, roomName, variant }: VirtualTourPortalProps) {
  const reduced = usePrefersReducedMotion()
  if (!imageUrl) return null

  const accessibleLabel = 'Step inside before you visit — take the virtual tour of the clinic'
  const alt = roomName ? `Inside Bright Smile Dental Clinic — ${roomName}` : 'Inside Bright Smile Dental Clinic'

  const driftTransition = reduced
    ? undefined
    : { duration: 16, repeat: Infinity, ease: 'easeInOut' as const }
  const driftAnimate = reduced ? undefined : { x: ['0%', '-4.5%', '0%'] }

  if (variant === 'band') {
    return (
      <section className="bg-white py-10 sm:py-14" aria-label="Virtual tour">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <Link
            href={TOUR_HREF}
            onClick={() => trackEvent('Hero Virtual Tour Portal Clicked', { location: 'home_band' })}
            aria-label={accessibleLabel}
            className="group grid overflow-hidden rounded-3xl border border-[#E7E1D6] bg-ivory-waves shadow-soft transition-shadow duration-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 md:grid-cols-[1.35fr_1fr]"
          >
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[17rem]">
              <motion.div className="absolute -inset-x-[6%] inset-y-0" animate={driftAnimate} transition={driftTransition}>
                <Image
                  src={imageUrl}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(min-width: 768px) 55vw, 100vw"
                />
              </motion.div>
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/40 bg-white/80 px-2.5 py-1 font-heading text-[0.6rem] font-bold uppercase tracking-wider text-gold-ink backdrop-blur-sm">
                <CompassIcon className="h-3 w-3" />
                360° Tour
              </span>
            </div>
            <div className="flex flex-col justify-center gap-3 p-7 sm:p-10">
              <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-ink">
                See Where We Work
              </p>
              <p className="font-display text-3xl leading-tight text-ink sm:text-[2.1rem]">
                Step inside before you visit.
              </p>
              <p className="max-w-[38ch] font-body text-sm leading-relaxed text-ink-muted">
                Walk through reception, the waiting area and our treatment rooms in 360°, so the clinic feels familiar before your first appointment.
              </p>
              <span className="mt-2 inline-flex w-fit items-center gap-2 font-heading text-sm font-semibold text-ink transition-all duration-300 group-hover:gap-3 group-hover:text-gold-ink">
                Walk through the clinic
                <ArrowIcon className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    )
  }

  if (variant === 'card') {
    return (
      <Link
        href={TOUR_HREF}
        onClick={() => trackEvent('Hero Virtual Tour Portal Clicked', { location: 'desktop_card' })}
        aria-label={accessibleLabel}
        className="group absolute bottom-5 left-5 z-20 hidden w-[15.5rem] overflow-hidden rounded-2xl border border-gold/25 shadow-glass-dark transition-all duration-300 hover:border-gold/50 hover:shadow-glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1B2E] lg:block xl:w-[17.5rem]"
      >
        <div className="relative h-32 w-full overflow-hidden xl:h-36">
          <motion.div
            className="absolute -inset-x-[6%] inset-y-0"
            animate={driftAnimate}
            transition={driftTransition}
          >
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              sizes="280px"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/10 transition-colors duration-300 group-hover:from-black/80" />

          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-gold/40 bg-black/40 px-2 py-1 font-heading text-[0.55rem] font-bold uppercase tracking-wider text-gold backdrop-blur-sm transition-colors duration-300 group-hover:border-gold/70 group-hover:text-gold-light">
            <CompassIcon className="h-2.5 w-2.5" />
            Tour
          </span>

          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <p className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-gold/90">
              See Where We Work
            </p>
            <p className="mt-1 font-display text-[0.95rem] leading-tight text-white">
              Step inside before you visit.
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 font-heading text-[0.65rem] font-semibold text-white/80 transition-all duration-300 group-hover:gap-2.5 group-hover:text-gold">
              Walk through the clinic
              <ArrowIcon className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={TOUR_HREF}
      onClick={() => trackEvent('Hero Virtual Tour Portal Clicked', { location: 'mobile_teaser' })}
      aria-label={accessibleLabel}
      className="group mt-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-gold/25 bg-white/[0.03] p-2.5 transition-all duration-300 hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1B2E] lg:hidden"
    >
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-28">
        <motion.div
          className="absolute -inset-x-[6%] inset-y-0"
          animate={driftAnimate}
          transition={driftTransition}
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="112px"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/20" />
        <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full border border-gold/40 bg-black/50 px-1.5 py-0.5 font-heading text-[0.5rem] font-bold uppercase tracking-wider text-gold backdrop-blur-sm">
          <CompassIcon className="h-2 w-2" />
          Tour
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-gold/90">
          See Where We Work
        </p>
        <p className="mt-0.5 font-display text-sm leading-tight text-white">
          Step inside before you visit.
        </p>
        <span className="mt-1 inline-flex items-center gap-1.5 font-heading text-[0.65rem] font-semibold text-white/70 transition-all duration-300 group-hover:gap-2.5 group-hover:text-gold">
          Take the tour
          <ArrowIcon className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
