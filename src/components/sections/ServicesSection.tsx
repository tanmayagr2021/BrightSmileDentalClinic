'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { stagger, liftIn, fadeUp } from '@/lib/animations'

export type ServiceDisplay = {
  slug: string
  name: string
  shortDescription: string
  subServiceCount: number
}

const SERVICE_CONFIG: Record<string, { accent: string; bg: string; iconBg: string; dot: string }> = {
  'general-dentistry': {
    accent: '#4A9B6F',
    bg: 'from-primary/[0.06] to-transparent',
    iconBg: 'bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  'cosmetic-dentistry': {
    accent: '#0D9488',
    bg: 'from-teal/[0.06] to-transparent',
    iconBg: 'bg-teal/10 text-teal',
    dot: 'bg-teal',
  },
  'orthodontics': {
    accent: '#4A9B6F',
    bg: 'from-primary/[0.05] to-transparent',
    iconBg: 'bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  'oral-surgery': {
    accent: '#1A3D2B',
    bg: 'from-dark/[0.05] to-transparent',
    iconBg: 'bg-dark/8 text-dark',
    dot: 'bg-dark',
  },
  'dental-implants': {
    accent: '#1d4ed8',
    bg: 'from-blue-600/[0.05] to-transparent',
    iconBg: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-600',
  },
  'pediatric-dentistry': {
    accent: '#d97706',
    bg: 'from-amber-500/[0.05] to-transparent',
    iconBg: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
}

const DEFAULT_CONFIG = {
  accent: '#4A9B6F',
  bg: 'from-primary/[0.06] to-transparent',
  iconBg: 'bg-primary/10 text-primary',
  dot: 'bg-primary',
}

const SERVICE_ICONS: Record<string, () => React.ReactElement> = {
  'general-dentistry': () => (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M10 3C7 3 4 6 4 10c0 3 1 5.5 1.5 8 .5 2.5 1 5 1.5 7 .5 1.5 1 2.5 2 2.5s1.5-.5 2-2c.5-1.5.8-3.5.8-5 0-1.5.7-2.5 2.2-2.5s2.2 1 2.2 2.5c0 1.5.3 3.5.8 5 .5 1.5 1 2 2 2s1.5-1 2-2.5c.5-2 1-4.5 1.5-7 .5-2.5 1.5-5 1.5-8 0-4-3-7-6-7-1.5 0-2.5.5-4 1.5C12.5 3.5 11.5 3 10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'cosmetic-dentistry': () => (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M16 4l2.5 7.5H26l-6.5 4.5 2.5 7.5L16 19l-6 4.5 2.5-7.5L6 11.5h7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  'orthodontics': () => (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
      <rect x="4" y="12" width="6" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="11" width="6" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="22" y="12" width="6" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 16h3M19 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'oral-surgery': () => (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 11v10M11 16h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'dental-implants': () => (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M16 4v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 8h10M12 12h8M13 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 22h12l-2 6H12l-2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  'pediatric-dentistry': () => (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M16 5a5 5 0 015 5c0 2-.8 3.8-1.5 5.5C18.5 18 18 20 18 22H14c0-2-.5-4-1.5-6.5C11.8 13.8 11 12 11 10a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 27h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ServicesSection({ services }: { services: ServiceDisplay[] }) {
  return (
    <section className="relative overflow-hidden bg-ivory py-24 lg:py-32">
      {/* Subtle top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 lg:mb-20"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow mb-4 inline-flex items-center gap-2.5">
                <span className="inline-block h-px w-6 bg-primary/50" />
                What We Offer
              </span>
              <h2 className="font-display text-4xl text-dark sm:text-5xl lg:text-6xl tracking-display leading-[1.06]">
                Our Services
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
                Comprehensive dental care under one roof — modern treatments delivered with expertise and a genuinely gentle touch.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl border border-dark/15 px-6 py-3 font-heading text-sm font-semibold text-dark transition-all hover:bg-dark hover:text-white active:scale-[0.98]"
              >
                All Services <ArrowRight />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Service cards grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, i) => {
            const Icon = SERVICE_ICONS[service.slug]
            const config = SERVICE_CONFIG[service.slug] ?? DEFAULT_CONFIG
            const isFeatured = i === 0

            return (
              <motion.div
                key={service.slug}
                variants={liftIn}
                whileHover={{ y: -7, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-all duration-400 ${
                  isFeatured ? 'ring-1 ring-primary/15' : 'ring-1 ring-gray-100/80'
                }`}
              >
                {/* Top accent border */}
                <div
                  className="absolute left-0 right-0 top-0 h-[3px] transition-opacity duration-300"
                  style={{ backgroundColor: config.accent, opacity: 0.6 }}
                />

                {/* Hover gradient background */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.bg} opacity-0 transition-opacity duration-400 group-hover:opacity-100`}
                  aria-hidden="true"
                />

                <div className="relative p-7 lg:p-8">
                  {/* Icon + featured badge row */}
                  <div className="mb-6 flex items-start justify-between">
                    <div
                      className={`flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-2xl ${config.iconBg} transition-transform duration-200 group-hover:scale-105`}
                    >
                      {Icon && <Icon />}
                    </div>
                    {isFeatured && (
                      <span className="rounded-full bg-primary/8 px-2.5 py-1 font-heading text-[0.55rem] font-semibold uppercase tracking-wide text-primary">
                        Most Popular
                      </span>
                    )}
                  </div>

                  {/* Service name */}
                  <h3 className="font-heading text-[1.05rem] font-semibold text-dark leading-snug">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 font-body text-sm leading-relaxed text-gray-500">
                    {service.shortDescription}
                  </p>

                  {/* Treatment count */}
                  <div className="mt-5 flex items-center gap-2.5">
                    <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${config.dot}`} />
                    <span className="font-heading text-[0.65rem] font-semibold text-gray-400 tracking-wide">
                      {service.subServiceCount} treatments available
                    </span>
                    <span className="h-px flex-1 bg-gray-100" />
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-5 inline-flex items-center gap-2 font-heading text-xs font-semibold text-gray-600 transition-all group-hover:gap-3 group-hover:text-dark"
                    style={{ '--accent-color': config.accent } as React.CSSProperties}
                    aria-label={`Learn more about ${service.name}`}
                  >
                    Explore treatment
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      <ArrowRight />
                    </span>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom assurance strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-gray-100 pt-12 text-center"
        >
          {['All treatments NMC-registered', 'Modern equipment', 'Transparent pricing', 'Gentle, comfortable care'].map((item) => (
            <span key={item} className="flex items-center gap-2 font-body text-sm text-gray-400">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 flex-shrink-0 text-primary" aria-hidden="true">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
