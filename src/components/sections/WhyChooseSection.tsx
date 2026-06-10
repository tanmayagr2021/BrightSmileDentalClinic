'use client'

import { motion } from 'framer-motion'
import { stagger, fadeUp, liftIn } from '@/lib/animations'
import { WHY_CHOOSE_STATIC, CERTIFICATIONS_STATIC } from '@/lib/constants'

function ReasonIcon({ id }: { id: string }) {
  switch (id) {
    case 'experienced-team':
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="18" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 19c0-2.2 1.3-4 3-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'modern-equipment':
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <rect x="2" y="6" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 10l4-2v8l-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'personalised-care':
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'specialist-network':
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="4.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="19.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="4.5" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="19.5" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.5 8l4 3M17.5 8l-4 3M6.5 16l4-3M17.5 16l-4-3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'convenient-location':
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'transparent-pricing':
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8h8M8 12h5M8 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 14.5l1.5 1.5-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

const CERT_ICON = (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
    <path d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z" fill="#4A9B6F" fillOpacity="0.12" stroke="#4A9B6F" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M5.5 8l2 2 3.5-3.5" stroke="#4A9B6F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function WhyChooseSection() {
  const reasons = WHY_CHOOSE_STATIC.filter((r) => r.visible).sort((a, b) => a.sortOrder - b.sortOrder)
  const certs = CERTIFICATIONS_STATIC.filter((c) => c.visible).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section className="bg-tint py-24 lg:py-32">
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
            Why Choose Us
            <span className="inline-block h-px w-5 bg-primary" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            The Bright Smile Difference
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 mx-auto max-w-2xl font-body text-base text-gray-500 leading-relaxed">
            Six reasons why patients across Kathmandu choose Bright Smile — and keep coming back.
          </motion.p>
        </motion.div>

        {/* 6-reason grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.id}
              variants={liftIn}
              whileHover={{ y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-lg hover:shadow-gray-200/60 transition-shadow duration-300"
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100 rounded-t-2xl" aria-hidden="true" />

              {/* Icon */}
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
                <ReasonIcon id={reason.id} />
              </div>

              <h3 className="font-heading text-base font-semibold text-dark mb-2">{reason.title}</h3>
              <p className="font-body text-sm text-gray-500 leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Certifications strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 rounded-2xl border border-primary/12 bg-white/70 px-7 py-5"
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 flex-shrink-0">
              Credentials
            </p>
            {certs.map((cert) => (
              <div key={cert.id} className="flex items-center gap-2">
                {CERT_ICON}
                <div>
                  <p className="font-heading text-xs font-semibold text-dark">{cert.title}</p>
                  <p className="font-body text-[0.62rem] text-gray-400">{cert.issuer} · {cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
