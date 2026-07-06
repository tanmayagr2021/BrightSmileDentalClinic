'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import ToothChart, { SAGE } from './ToothChart'
import { REGION_CHIPS, regionToothNumbers, type RegionKey } from '@/lib/tooth-regions'
import { fadeUp, blurFadeIn, EASE_OUT } from '@/lib/animations'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import type { ToothRow, ToothFaqRow, ToothImageRow, MediaLibraryRow } from '@/types/db'

export type PublicTooth = ToothRow & {
  faqs: ToothFaqRow[]
  images: (ToothImageRow & { media: MediaLibraryRow | null })[]
  tooth_doctors: { doctor: { id: string; full_name: string; slug: string; title: string | null; profile_image_url: string | null; color_hex: string | null; initials: string | null } | null }[]
  tooth_services: { service: { id: string; name: string; slug: string } | null }[]
}

function FaqItem({ faq, index }: { faq: ToothFaqRow; index: number }) {
  const [open, setOpen] = useState(false)
  const panelId = `tooth-faq-panel-${faq.id}-${index}`
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold rounded-xl"
      >
        <span className="font-heading text-sm font-medium text-white">{faq.question}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="flex-shrink-0 text-gold" aria-hidden="true">
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panelId} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE_OUT }} className="overflow-hidden">
            <p className="px-4 pb-4 font-body text-sm text-white/60">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ToothExplorerExperience({ teeth }: { teeth: PublicTooth[] }) {
  const prefersReducedMotion = useReducedMotion()
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null)
  const activeToothNumbers = useMemo(() => new Set(teeth.map((t) => t.tooth_number)), [teeth])
  const toothNames = useMemo(() => Object.fromEntries(teeth.map((t) => [t.tooth_number, t.name])), [teeth])
  const highlighted = useMemo(() => regionToothNumbers(activeRegion), [activeRegion])
  const activeRegionChip = REGION_CHIPS.find((c) => c.key === activeRegion)
  const tooth = teeth.find((t) => t.tooth_number === selectedNumber) ?? null

  const beforeImg = tooth?.images.find((i) => i.image_type === 'before')
  const afterImg = tooth?.images.find((i) => i.image_type === 'after')
  const galleryImgs = tooth?.images.filter((i) => i.image_type === 'gallery') ?? []

  return (
    <div style={{ background: '#0E1B2E' }} className="min-h-screen">
      <section className="relative overflow-hidden px-6 pb-10 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold blur-[160px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p initial="hidden" animate="visible" variants={fadeUp} className="mb-4 font-heading text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Understand Your Smile
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={blurFadeIn} className="font-display text-4xl text-white sm:text-5xl md:text-6xl">
            Where does it hurt?
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="mx-auto mt-5 max-w-xl font-body text-base text-white/60">
            Tap the tooth — or the general area — that&apos;s bothering you. We&apos;ll show you what&apos;s likely going on and who can help.
          </motion.p>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-28 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        {/* Chart */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 lg:sticky lg:top-28">
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Browse by area">
            {REGION_CHIPS.map((chip) => {
              const active = activeRegion === chip.key
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setActiveRegion((r) => (r === chip.key ? null : chip.key))}
                  aria-pressed={active}
                  className="rounded-full border px-3 py-1.5 font-heading text-xs font-medium transition-colors"
                  style={{
                    borderColor: active ? SAGE : 'rgba(255,255,255,0.15)',
                    backgroundColor: active ? 'rgba(156,175,136,0.15)' : 'rgba(255,255,255,0.03)',
                    color: active ? SAGE : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>

          <ToothChart
            activeToothNumbers={activeToothNumbers}
            selectedToothNumber={selectedNumber}
            onSelectTooth={(n) => setSelectedNumber(n)}
            toothNames={toothNames}
            regionToothNumbers={highlighted}
            activeRegionLabel={activeRegionChip?.label}
          />

          {activeRegion === 'gums' ? (
            <p className="mt-2 text-center font-body text-xs text-white/60">
              Gum health affects every tooth. For bleeding, swelling, or sensitivity, our periodontal team can help — meet{' '}
              <Link href="/doctors/dr-ameena-pradhan" className="text-gold underline underline-offset-2 hover:text-gold/80">
                Dr. Ameena Pradhan
              </Link>
              .
            </p>
          ) : activeRegionChip ? (
            <p className="mt-2 text-center font-body text-xs text-white/60">
              Gold = selected tooth. Soft green = the area you&apos;re browsing.
            </p>
          ) : (
            <p className="mt-2 text-center font-body text-xs text-white/60">Gold marks your selected tooth — tap any tooth to begin.</p>
          )}
        </div>

        {/* Detail panel */}
        <div className="min-h-[420px]" role="region" aria-live="polite" aria-atomic="true" aria-label="Selected tooth details">
          <AnimatePresence mode="wait">
            {tooth ? (
              <motion.div
                key={tooth.id}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="space-y-6"
              >
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-heading text-[0.65rem] font-semibold uppercase tracking-wider text-gold">
                    Tooth #{tooth.tooth_number} · FDI {tooth.fdi_number}
                  </span>
                  <h2 className="mt-3 font-display text-3xl text-white">{tooth.name}</h2>
                  {tooth.description && <p className="mt-3 font-body text-base text-white/65">{tooth.description}</p>}
                </div>

                {(tooth.duration_text || tooth.recovery_text) && (
                  <div className="flex flex-wrap gap-3">
                    {tooth.duration_text && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-white/60">Treatment Duration</p>
                        <p className="mt-1 font-heading text-sm font-semibold text-white">{tooth.duration_text}</p>
                      </div>
                    )}
                    {tooth.recovery_text && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-white/60">Recovery</p>
                        <p className="mt-1 font-heading text-sm font-semibold text-white">{tooth.recovery_text}</p>
                      </div>
                    )}
                  </div>
                )}

                {tooth.problems && (
                  <div>
                    <h3 className="mb-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-white/60">Common Problems</h3>
                    <p className="font-body text-sm text-white/65">{tooth.problems}</p>
                  </div>
                )}
                {tooth.treatments && (
                  <div>
                    <h3 className="mb-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-white/60">Treatments</h3>
                    <p className="font-body text-sm text-white/65">{tooth.treatments}</p>
                  </div>
                )}

                {(beforeImg || afterImg) && (
                  <div>
                    <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-white/60">Before &amp; After</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ label: 'Before', img: beforeImg }, { label: 'After', img: afterImg }].map(({ label, img }) => {
                        const url = img?.media ? mediaDisplayUrl(img.media) : null
                        return (
                          <div key={label} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                            {url ? (
                              <Image src={url} alt={`${label} ${tooth.name}`} fill className="object-cover" sizes="200px" />
                            ) : (
                              <span className="flex h-full items-center justify-center font-body text-[0.65rem] text-white/60">No image</span>
                            )}
                            <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 font-heading text-[0.6rem] font-semibold uppercase text-white backdrop-blur-sm">{label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {galleryImgs.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {galleryImgs.map((g) => {
                      const url = g.media ? mediaDisplayUrl(g.media) : null
                      return url ? (
                        <div key={g.id} className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                          <Image src={url} alt={tooth.name} fill className="object-cover" sizes="100px" />
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {tooth.tooth_doctors.filter((d) => d.doctor).length > 0 && (
                  <div>
                    <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-white/60">Specialists for This Tooth</h3>
                    <div className="flex flex-wrap gap-3">
                      {tooth.tooth_doctors.filter((d) => d.doctor).map(({ doctor }) => (
                        <Link
                          key={doctor!.id}
                          href={`/doctors/${doctor!.slug}`}
                          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4 transition-colors hover:border-gold/40"
                        >
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-full font-heading text-[0.6rem] font-bold text-white"
                            style={{ backgroundColor: doctor!.color_hex ?? '#4A9B6F' }}
                          >
                            {doctor!.initials ?? doctor!.full_name.slice(0, 2)}
                          </span>
                          <span className="font-heading text-xs font-semibold text-white">{doctor!.full_name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {tooth.tooth_services.filter((s) => s.service).length > 0 && (
                  <div>
                    <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-white/60">Related Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {tooth.tooth_services.filter((s) => s.service).map(({ service }) => (
                        <Link
                          key={service!.id}
                          href={`/services/${service!.slug}`}
                          className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gold transition-colors hover:bg-gold/20"
                        >
                          {service!.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {tooth.faqs.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-white/60">Frequently Asked Questions</h3>
                    <div className="space-y-2">
                      {tooth.faqs.map((f, i) => <FaqItem key={f.id} faq={f} index={i} />)}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 px-8 text-center"
              >
                <p className="font-display text-2xl text-white/70">Select a tooth to begin</p>
                <p className="mt-2 max-w-xs font-body text-sm text-white/60">Tap on any highlighted tooth in the chart to see detailed information.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
