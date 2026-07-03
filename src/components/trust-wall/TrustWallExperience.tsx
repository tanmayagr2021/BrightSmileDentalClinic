'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeUp, blurFadeIn, stagger, lineReveal } from '@/lib/animations'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import type { TrustWallModule, TrustWallCategory } from '@/types/db'
import type { PublicTrustItem } from '@/app/(public)/trust/page'

const MODULES: { key: TrustWallModule; label: string; eyebrow: string; blurb: string }[] = [
  {
    key: 'trust-certifications',
    label: 'Trust & Certifications',
    eyebrow: 'Recognized Excellence',
    blurb: 'Awards, registrations, and memberships that reflect our clinical standing.',
  },
  {
    key: 'technology',
    label: 'Technology',
    eyebrow: 'Modern Equipment',
    blurb: 'The instruments and systems behind precise, comfortable care.',
  },
  {
    key: 'clinical-standards',
    label: 'Clinical Standards',
    eyebrow: 'Safety First',
    blurb: 'Sterilization protocols and research-backed practices we hold ourselves to.',
  },
]

const CATEGORY_ICON: Record<TrustWallCategory, string> = {
  award: 'M12 15a5 5 0 100-10 5 5 0 000 10zM8.5 14l-2 6.5L12 18l5.5 2.5-2-6.5',
  certification: 'M9 12l2 2 4-4M12 3l1.9 1.6 2.4-.3.6 2.4 2.2 1.1-.9 2.3.9 2.3-2.2 1.1-.6 2.4-2.4-.3L12 21l-1.9-1.6-2.4.3-.6-2.4-2.2-1.1.9-2.3-.9-2.3 2.2-1.1.6-2.4 2.4.3z',
  membership: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-2.13a4 4 0 100-8 4 4 0 000 8zm7 8v-2a4 4 0 00-3-3.87',
  equipment: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.4-3.4a4 4 0 01-5.6 5.6L6.6 20.4a2 2 0 01-2.8-2.8L12.7 8.7a4 4 0 015.6-5.6l-3.4 3.4z',
  sterilization: 'M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z',
  technology: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  research: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  verification: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
}

function TrustCard({ item, index }: { item: PublicTrustItem; index: number }) {
  const url = item.image ? mediaDisplayUrl(item.image) : null
  return (
    <motion.div
      variants={fadeUp}
      className="group relative flex-shrink-0 w-[300px] snap-start overflow-hidden rounded-3xl border border-white/10 p-6 backdrop-blur-md transition-all hover:border-gold/40"
      style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))' }}
    >
      {/* Timeline dot + connector */}
      <div className="absolute -top-3 left-6 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_12px_2px_rgba(197,160,89,0.6)]" />
      </div>

      <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-white/[0.04]">
        {url ? (
          <Image src={url} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="300px" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9 text-white/25">
              <path d={CATEGORY_ICON[item.category]} />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2">
          <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-gold">{item.category}</span>
          {item.year && <span className="font-body text-[0.65rem] text-white/35">· {item.year}</span>}
        </div>
        <h3 className="mt-1.5 font-display text-lg text-white">{item.title}</h3>
        {item.issuer && <p className="mt-0.5 font-body text-xs text-white/45">{item.issuer}</p>}
        {item.description && <p className="mt-2 font-body text-sm text-white/60 line-clamp-3">{item.description}</p>}
      </div>
    </motion.div>
  )
}

export default function TrustWallExperience({ items }: { items: PublicTrustItem[] }) {
  return (
    <div style={{ background: '#0E1B2E' }} className="min-h-screen">
      <section className="relative overflow-hidden px-6 pb-16 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold blur-[160px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p initial="hidden" animate="visible" variants={fadeUp} className="mb-4 font-heading text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Why Patients Trust Us
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={blurFadeIn} className="font-display text-4xl text-white sm:text-5xl md:text-6xl">
            Trust, Technology &amp; Standards
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="mx-auto mt-5 max-w-xl font-body text-base text-white/60">
            Every award, protocol, and instrument we use is chosen for one reason — your safety and your smile.
          </motion.p>
        </div>
      </section>

      {MODULES.map((mod, mi) => {
        const modItems = items.filter((i) => i.module === mod.key)
        if (modItems.length === 0) return null
        return (
          <motion.section
            key={mod.key}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="relative mx-auto max-w-6xl px-6 pb-24"
          >
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <motion.p variants={fadeUp} className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  {mod.eyebrow}
                </motion.p>
                <motion.h2 variants={fadeUp} className="mt-2 font-display text-3xl text-white">
                  {mod.label}
                </motion.h2>
                <motion.p variants={fadeUp} className="mt-2 max-w-md font-body text-sm text-white/50">
                  {mod.blurb}
                </motion.p>
              </div>
              <motion.span variants={fadeUp} className="hidden shrink-0 font-heading text-[0.65rem] font-semibold text-white/30 sm:inline">
                {String(mi + 1).padStart(2, '0')} / {String(MODULES.length).padStart(2, '0')}
              </motion.span>
            </div>

            {/* Timeline connector line */}
            <motion.div variants={lineReveal} className="mb-4 h-px w-full bg-gradient-to-r from-gold/50 via-white/10 to-transparent" />

            <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 -mx-1 px-1">
              {modItems.map((item, idx) => (
                <TrustCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          </motion.section>
        )
      })}

      {items.length === 0 && (
        <p className="px-6 pb-32 text-center font-body text-white/40">Our credentials are being updated — please check back soon.</p>
      )}
    </div>
  )
}
