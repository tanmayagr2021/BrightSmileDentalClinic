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

function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }
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
    <>
      {/* ─── Part 1 — Dark editorial feature ─────────────────────────────── */}
      <section className="bg-[#0A1128] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section header — left-aligned */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="mb-3 inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.15em] text-gold"
            >
              <span className="inline-block h-px w-5 bg-gold" aria-hidden="true" />
              Patient Stories
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl text-white sm:text-5xl lg:text-6xl tracking-display leading-[1.06]"
            >
              What Our Patients Say
            </motion.h2>
          </motion.div>

          {/* Featured testimonial — pure typography, no card */}
          {featured && (
            <motion.div
              variants={blurFadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="relative mb-16"
            >
              {/* Large decorative opening quote mark */}
              <div
                className="pointer-events-none select-none font-display leading-none text-primary/20"
                style={{ fontSize: '8rem', lineHeight: 1, marginBottom: '-2.5rem' }}
                aria-hidden="true"
              >
                &ldquo;
              </div>

              <blockquote>
                <p className="font-display text-2xl text-white leading-relaxed tracking-display sm:text-3xl lg:text-4xl">
                  {featured.text}
                </p>
              </blockquote>

              {/* Stars */}
              <div className="mt-8 flex gap-1">
                {Array.from({ length: featured.rating }).map((_, i) => (
                  <svg key={i} viewBox="0 0 16 16" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.4l-3.6 1.9.7-4-2.9-2.8 4-.6z"
                      fill="#4A9B6F"
                      stroke="#4A9B6F"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
              </div>

              {/* Patient info row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <InitialsAvatar name={featured.name} size="md" />
                <p className="font-heading text-base font-semibold text-white">{featured.name}</p>

                {featured.treatment && (
                  <span className="rounded-full bg-primary/15 px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-primary">
                    {featured.treatment}
                  </span>
                )}

                {/* Verified Patient badge */}
                <div className="flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true">
                    <path
                      d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z"
                      fill="#4A9B6F"
                      fillOpacity="0.2"
                      stroke="#4A9B6F"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5 8l2 2 3.5-3.5"
                      stroke="#4A9B6F"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-heading text-xs font-semibold text-primary">Verified Patient</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Trust metrics — inline horizontal strip */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="border-t border-white/10 pt-10"
          >
            <div className="flex flex-wrap items-center">
              {[
                { value: '5.0', label: 'Rating' },
                { value: '1,000+', label: 'Patients' },
                { value: 'Est. 2013', label: 'Kathmandu' },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-8 inline-block h-8 w-px bg-white/[0.12]" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-display text-2xl leading-none text-white">{item.value}</p>
                    <p className="mt-1 font-heading text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─── Part 2 — Secondary testimonials on white ─────────────────────── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

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
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-200/50"
              >
                <div>
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <StarIcon key={i} filled />
                    ))}
                  </div>

                  <p className="font-body text-sm leading-relaxed text-gray-600">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {t.treatment && (
                    <span className="mt-4 inline-block rounded-full bg-[#F0F9FF] px-2.5 py-1 font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                      {t.treatment}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-gray-50 pt-5">
                  <InitialsAvatar name={t.name} size="sm" />
                  <p className="font-heading text-sm font-semibold text-dark">{t.name}</p>
                </div>
              </motion.div>
            ))}
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
    </>
  )
}
