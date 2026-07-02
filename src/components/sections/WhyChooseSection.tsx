'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { pick } from '@/lib/content-client'
import type { WhyChooseReasonRow, CertificationRow } from '@/lib/content'

// Indexed positionally (not by DB id) — icons are tied to conceptual order,
// matching the fixed seed order of why_choose_reasons.
function reasonIcon(i: number): React.ReactNode {
  switch (i) {
    case 0:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 18c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M13 17c0-1.8 1-3.3 2.5-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <rect x="2" y="5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M13 8.5l4-2v7l-4-2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M5 9l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M17.4 3.6a4.5 4.5 0 00-6.3 0L10 4.7l-1.1-1A4.5 4.5 0 002.6 10l7.4 7.4 7.4-7.4a4.5 4.5 0 000-6.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      )
    case 3:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="3.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="16.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="3.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="16.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 6.5l4 3M15 6.5l-4 3M5 13.5l4-3M15 13.5l-4-3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 4:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M10 2a5.5 5.5 0 015.5 5.5c0 4.1-5.5 10.5-5.5 10.5S4.5 11.6 4.5 7.5A5.5 5.5 0 0110 2z" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="10" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 6v1.5m0 5V14M7.5 11h3a1.5 1.5 0 000-3H9a1.5 1.5 0 010-3H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
  }
}

const CERT_SHIELD = (
  <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
    <path d="M7 1L2 3.2v4.3c0 3 2.3 5.7 5 6.5 2.7-0.8 5-3.5 5-6.5V3.2L7 1z" fill="#0C3C2D" fillOpacity="0.14" stroke="#0C3C2D" strokeWidth="1.1" strokeLinejoin="round" />
    <path d="M4.5 7l2 2 3-3" stroke="#0C3C2D" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const numLabels = ['01', '02', '03', '04', '05', '06']

export default function WhyChooseSection({
  content,
  reasons,
  certifications,
}: {
  content: Record<string, string>
  reasons: WhyChooseReasonRow[]
  certifications: CertificationRow[]
}) {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Split header */}
        <div className="mb-20 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow mb-4 inline-flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-primary/50" />
              {pick(content, 'home.why_choose.eyebrow', 'The Difference')}
            </span>
            <h2 className="font-display text-4xl text-dark sm:text-5xl lg:text-[3.25rem] tracking-display leading-[1.06]">
              {pick(content, 'home.why_choose.heading_line1', 'The Bright Smile')}<br />{pick(content, 'home.why_choose.heading_line2', 'Difference')}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:pb-2"
          >
            <p className="font-body text-base leading-relaxed text-zinc-600 max-w-lg">
              {pick(content, 'home.why_choose.intro', 'Six reasons why patients across Kathmandu choose Bright Smile — and keep coming back for a lifetime of dental care.')}
            </p>
            <Link
              href="/appointments"
              className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-all hover:gap-3"
            >
              {pick(content, 'home.why_choose.cta_label', 'Book your visit')}
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Reasons — editorial numbered list */}
        <div className="divide-y divide-gray-100">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
              className="group relative grid grid-cols-[3rem_1fr] gap-8 py-8 lg:grid-cols-[6rem_1fr_1fr] lg:gap-12 lg:py-9"
            >
              {/* Hover accent */}
              <div className="pointer-events-none absolute inset-0 -mx-4 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:-mx-6 lg:-mx-8" style={{ background: 'rgba(74,155,111,0.03)' }} aria-hidden="true" />

              {/* Number */}
              <div className="relative flex-shrink-0 pt-0.5">
                <span className="font-display text-4xl font-bold tabular-nums text-gray-100 transition-colors duration-300 group-hover:text-primary lg:text-5xl">
                  {numLabels[i] ?? `0${i + 1}`}
                </span>
              </div>

              {/* Title + Icon */}
              <div className="relative flex items-start gap-3 lg:items-center">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 lg:mt-0">
                  {reasonIcon(i)}
                </div>
                <h3 className="font-heading text-base font-semibold text-dark leading-snug sm:text-[1.05rem]">
                  {reason.title}
                </h3>
              </div>

              {/* Description */}
              <div className="relative col-start-2 lg:col-start-3 lg:col-auto">
                <p className="font-body text-sm leading-relaxed text-zinc-600">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Credentials strip */}
        {certifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 rounded-2xl border border-gray-100 bg-ivory px-7 py-6"
          >
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <p className="font-heading text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gray-600 flex-shrink-0">
                {pick(content, 'home.why_choose.credentials_label', 'Credentials & Registrations')}
              </p>
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center gap-2.5">
                  {CERT_SHIELD}
                  <div>
                    <p className="font-heading text-xs font-semibold text-dark">{cert.title}</p>
                    <p className="font-body text-[0.62rem] text-gray-600">{cert.issuer} · {cert.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}
