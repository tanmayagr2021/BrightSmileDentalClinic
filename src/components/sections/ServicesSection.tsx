'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { stagger, fadeUp } from '@/lib/animations'
import { useTrackViewOnce } from '@/hooks/useTrackViewOnce'
import { trackEvent } from '@/lib/analytics'
import { pick } from '@/lib/content-client'
import ServiceImagePlaceholder from './ServiceImagePlaceholder'

export type ServiceDisplay = {
  slug: string
  name: string
  shortDescription: string
  subServiceCount: number
  thumbnail_url: string | null
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M4 12L12 4M4 4h8v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ServicesSection({
  services,
  content,
}: {
  services: ServiceDisplay[]
  content: Record<string, string>
}) {
  const viewRef = useTrackViewOnce<HTMLElement>('Services Viewed')
  return (
    <section ref={viewRef} className="relative overflow-hidden bg-ivory py-24 lg:py-32">
      {/* Subtle top gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 lg:mb-20"
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <span className="eyebrow mb-4 inline-flex items-center gap-2.5">
                <span className="inline-block h-px w-6 bg-primary/50" />
                {pick(content, 'home.services.eyebrow', 'What We Offer')}
              </span>
              <h2 className="font-display text-4xl text-dark sm:text-5xl lg:text-6xl tracking-display leading-[1.06]">
                {pick(content, 'home.services.heading', 'Our Services')}
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
                {pick(content, 'home.services.intro', 'Comprehensive dental care under one roof — modern treatments delivered with expertise and a genuinely gentle touch.')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-dark/60 transition-all duration-200 hover:gap-3 hover:text-primary"
              >
                {pick(content, 'home.services.view_all_label', 'View All Services')} <ArrowRight />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Editorial service rows */}
        <div className="border-t border-gray-200">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
            >
              <Link
                href={`/services/${service.slug}`}
                onClick={() => trackEvent('Service CTA Clicked', { service: service.slug })}
                className="group flex items-center gap-6 border-b border-gray-200 py-7 transition-colors duration-300 hover:bg-tint/60 lg:gap-10 lg:px-4 lg:py-8"
                aria-label={`Learn more about ${service.name}`}
              >
                {/* Thumbnail */}
                <div className="relative hidden aspect-square w-14 flex-shrink-0 overflow-hidden rounded-xl sm:block lg:w-20">
                  {service.thumbnail_url ? (
                    <Image src={service.thumbnail_url} alt={service.name} fill className="object-cover object-top" sizes="80px" />
                  ) : (
                    <ServiceImagePlaceholder className="h-full w-full" seed={service.slug} />
                  )}
                </div>

                {/* Large serif number */}
                <span aria-hidden="true" className="w-12 flex-shrink-0 select-none font-display text-3xl font-bold leading-none text-gray-200 transition-colors duration-300 group-hover:text-primary lg:w-16 lg:text-4xl">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Service name */}
                <h3 className="flex-1 font-display text-xl text-dark tracking-display leading-snug sm:text-2xl lg:text-3xl xl:text-4xl">
                  {service.name}
                </h3>

                {/* Short description — desktop only */}
                <p className="hidden w-[22ch] flex-shrink-0 font-body text-sm text-gray-500 leading-relaxed lg:block">
                  {service.shortDescription}
                </p>

                {/* Right: count pill + arrow circle */}
                <div className="ml-auto flex flex-shrink-0 items-center gap-4">
                  <span className="hidden rounded-full border border-gray-200 px-3 py-1 font-heading text-[0.65rem] font-semibold text-gray-600 transition-colors duration-300 group-hover:border-primary/30 group-hover:text-primary/70 sm:block">
                    {service.subServiceCount} treatments
                  </span>
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    <ArrowUpRight />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom assurance strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-gray-100 pt-12"
        >
          {[
            pick(content, 'home.services.assurance_1', 'All treatments NMC-registered'),
            pick(content, 'home.services.assurance_2', 'Modern equipment'),
            pick(content, 'home.services.assurance_3', 'Transparent pricing'),
            pick(content, 'home.services.assurance_4', 'Gentle, comfortable care'),
          ].map((item) => (
            <span key={item} className="flex items-center gap-2 font-body text-sm text-gray-600">
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className="h-3 w-3 flex-shrink-0 text-primary"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
