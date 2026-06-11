'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp, stagger, scaleIn, blurFadeIn } from '@/lib/animations'
import { TESTIMONIALS_STATIC } from '@/lib/constants'
import type { TestimonialRow } from '@/types/db'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.4l-3.6 1.9.7-4-2.9-2.8 4-.6z"
        fill={filled ? '#4A9B6F' : 'none'}
        stroke={filled ? '#4A9B6F' : '#d1d5db'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function QuoteIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-8 w-8' : 'h-5 w-5'
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`${cls} text-primary/15`} aria-hidden="true">
      <path
        d="M4 20c0-5.5 3.5-10 9-12l1.5 2.5C11 12 9.5 14.5 9 17h5v7H4v-4zm15 0c0-5.5 3.5-10 9-12l1.5 2.5C26 12 24.5 14.5 24 17h5v7H19v-4z"
        fill="currentColor"
      />
    </svg>
  )
}

function VideoPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-[#1a3d2b] to-[#0f2419] aspect-[4/3] flex flex-col items-center justify-center gap-3">
      {/* Play button */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
        <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-0.5" aria-hidden="true">
          <path d="M8 5l11 7-11 7V5z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-heading text-xs font-semibold text-white/70">Patient Story Video</p>
        <p className="font-body text-[0.6rem] text-white/35 mt-0.5">Coming soon</p>
      </div>
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.03]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-white/[0.03]" aria-hidden="true" />
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur-sm">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="font-heading text-[0.55rem] font-semibold text-white/60">Video Testimonial</span>
      </div>
    </div>
  )
}

function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }
  return (
    <div className={`${sizes[size]} flex flex-shrink-0 items-center justify-center rounded-full bg-primary font-heading font-bold text-white`}>
      {initials}
    </div>
  )
}

// Normalise both static and DB shapes into a common display format
type DisplayTestimonial = {
  id: string
  name: string
  rating: number
  text: string
  treatment: string | null
}

function normaliseDB(t: TestimonialRow): DisplayTestimonial {
  return {
    id: t.id,
    name: t.patient_name,
    rating: t.rating,
    text: t.review_text,
    treatment: t.treatment_type ?? null,
  }
}

function normaliseStatic(t: typeof TESTIMONIALS_STATIC[number]): DisplayTestimonial {
  return {
    id: t.id,
    name: t.name,
    rating: t.rating,
    text: t.text,
    treatment: t.treatment ?? null,
  }
}

export default function TestimonialsSection({ testimonials }: { testimonials?: TestimonialRow[] }) {
  const allTestimonials: DisplayTestimonial[] = testimonials && testimonials.length > 0
    ? testimonials.map(normaliseDB)
    : TESTIMONIALS_STATIC.filter((t) => t.visible).sort((a, b) => a.sortOrder - b.sortOrder).map(normaliseStatic)

  const featured = allTestimonials[0]
  const rest = allTestimonials.slice(1, 4)

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <motion.span variants={fadeUp} className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Patient Stories
            <span className="inline-block h-px w-5 bg-primary" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            What Our Patients Say
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-5 flex items-center justify-center gap-2.5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled />
              ))}
            </div>
            <span className="font-heading text-sm font-semibold text-dark">5.0</span>
            <span className="font-body text-sm text-gray-400">· Trusted by 1,000+ patients across Kathmandu</span>
          </motion.div>
        </motion.div>

        {/* Featured testimonial */}
        {featured && (
          <motion.div
            variants={blurFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="relative mb-8 overflow-hidden rounded-3xl border border-primary/12 bg-gradient-to-br from-tint via-white to-tint p-8 sm:p-10 lg:p-12"
          >
            {/* Large quote mark */}
            <div className="absolute right-8 top-8" aria-hidden="true">
              <QuoteIcon size="lg" />
            </div>

            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: featured.rating }).map((_, i) => (
                    <StarIcon key={i} filled />
                  ))}
                </div>

                {featured.treatment && (
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                    {featured.treatment}
                  </span>
                )}

                <blockquote>
                  <p className="font-display text-xl text-dark leading-relaxed sm:text-2xl tracking-display">
                    &ldquo;{featured.text}&rdquo;
                  </p>
                </blockquote>

                <div className="mt-7 flex items-center gap-4">
                  <InitialsAvatar name={featured.name} size="lg" />
                  <div>
                    <p className="font-heading text-base font-semibold text-dark">{featured.name}</p>
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <div className="flex items-center gap-1.5 rounded-xl border border-primary/15 bg-white px-3 py-2">
                      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-primary" aria-hidden="true">
                        <path d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z" fill="#4A9B6F" fillOpacity="0.12" stroke="#4A9B6F" strokeWidth="1.2" strokeLinejoin="round" />
                        <path d="M5.5 8l2 2 3.5-3.5" stroke="#4A9B6F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-heading text-[0.6rem] font-semibold text-primary">Verified Patient</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video placeholder */}
              <VideoPlaceholder />
            </div>
          </motion.div>
        )}

        {/* Secondary testimonials grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rest.map((t) => (
            <motion.div
              key={t.id}
              variants={scaleIn}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-shadow duration-300"
            >
              <div className="absolute right-5 top-5" aria-hidden="true">
                <QuoteIcon size="sm" />
              </div>

              <div>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} filled />
                  ))}
                </div>

                {t.treatment && (
                  <span className="mb-3 inline-block rounded-full bg-tint px-2.5 py-1 font-heading text-[0.58rem] font-semibold uppercase tracking-wide text-primary">
                    {t.treatment}
                  </span>
                )}

                <p className="font-body text-sm leading-relaxed text-gray-600">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-gray-50 pt-5">
                <InitialsAvatar name={t.name} size="sm" />
                <div>
                  <p className="font-heading text-sm font-semibold text-dark">{t.name}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Second video placeholder slot */}
          <motion.div variants={scaleIn}>
            <VideoPlaceholder />
          </motion.div>
        </motion.div>

        {/* View all CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-all hover:text-primary-dark"
          >
            Read all patient stories
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
