'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, scaleIn } from '@/lib/animations'
import { SERVICE_CATEGORIES_STATIC } from '@/lib/constants'

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
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ServicesSection() {
  const services = SERVICE_CATEGORIES_STATIC.filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section className="bg-tint py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            What We Offer
            <span className="inline-block h-px w-5 bg-primary" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Our Services
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl font-body text-base text-gray-500 leading-relaxed">
            Comprehensive dental care under one roof — modern treatments delivered with
            expertise and a genuinely gentle touch.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.slug]
            return (
              <motion.div
                key={service.slug}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
                className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-sm shadow-gray-100 transition-shadow hover:shadow-xl hover:shadow-gray-200/60"
              >
                {/* Icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-tint text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                  {Icon && <Icon />}
                </div>

                <h3 className="font-heading text-base font-semibold text-dark">
                  {service.name}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-gray-500">
                  {service.shortDescription}
                </p>

                {/* Sub-service count */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="font-heading text-[0.65rem] font-semibold text-gray-400">
                    {service.subServices.length} treatments
                  </span>
                  <span className="h-px flex-1 bg-gray-100" />
                </div>

                <Link
                  href={`/services/${service.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 font-heading text-xs font-semibold text-primary transition-all group-hover:gap-3"
                  aria-label={`Learn more about ${service.name}`}
                >
                  Learn more <ArrowRight />
                </Link>

                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-3xl bg-tint/60 transition-colors group-hover:bg-primary/5" aria-hidden="true" />
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-xl border border-dark/20 px-8 py-3.5 font-heading text-sm font-semibold text-dark transition-all hover:bg-dark hover:text-white active:scale-[0.98]"
          >
            View All Services <ArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
