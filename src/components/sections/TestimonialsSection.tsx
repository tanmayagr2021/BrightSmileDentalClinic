'use client'

import { motion } from 'framer-motion'
import { fadeUp, stagger, scaleIn } from '@/lib/animations'
import { TESTIMONIALS_STATIC } from '@/lib/constants'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
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

function QuoteIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-primary/20" aria-hidden="true">
      <path
        d="M4 20c0-5.5 3.5-10 9-12l1.5 2.5C11 12 9.5 14.5 9 17h5v7H4v-4zm15 0c0-5.5 3.5-10 9-12l1.5 2.5C26 12 24.5 14.5 24 17h5v7H19v-4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="bg-tint py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
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
          <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} filled />
            ))}
            <span className="ml-2 font-body text-sm text-gray-500">
              5.0 · Trusted by 1,000+ patients
            </span>
          </motion.div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS_STATIC.map((t) => (
            <motion.div
              key={t.name}
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-7 shadow-sm shadow-gray-100 transition-shadow hover:shadow-lg hover:shadow-gray-200"
            >
              <div className="absolute right-6 top-6 text-primary/20">
                <QuoteIcon />
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <StarIcon key={i} filled />
                ))}
              </div>

              <p className="font-body text-sm leading-relaxed text-gray-600">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-gray-50 pt-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-white">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-dark">{t.name}</p>
                  <p className="font-body text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
