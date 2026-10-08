'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import ToothChart, { SAGE } from './ToothChart'
import { REGION_CHIPS, regionToothNumbers, type RegionKey } from '@/lib/tooth-regions'
import { fadeUp, blurFadeIn, EASE_OUT } from '@/lib/animations'
import type { ToothRow } from '@/types/db'

export type PublicTooth = ToothRow

export default function ToothExplorerExperience({ teeth }: { teeth: PublicTooth[] }) {
  const prefersReducedMotion = useReducedMotion()
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null)
  const activeToothNumbers = useMemo(() => new Set(teeth.map((t) => t.tooth_number)), [teeth])
  const toothNames = useMemo(() => Object.fromEntries(teeth.map((t) => [t.tooth_number, t.name])), [teeth])
  const highlighted = useMemo(() => regionToothNumbers(activeRegion), [activeRegion])
  const activeRegionChip = REGION_CHIPS.find((c) => c.key === activeRegion)
  const tooth = teeth.find((t) => t.tooth_number === selectedNumber) ?? null

  return (
    <div className="min-h-screen bg-ivory-page">
      <section className="relative overflow-hidden px-6 pb-10 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold blur-[160px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p initial="hidden" animate="visible" variants={fadeUp} className="mb-4 font-heading text-xs font-semibold uppercase tracking-[0.25em] text-gold-ink">
            Understand Your Smile
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={blurFadeIn} className="font-display text-4xl text-ink sm:text-5xl md:text-6xl">
            Where does it hurt?
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="mx-auto mt-5 max-w-xl font-body text-base text-ink-muted">
            Tap the tooth — or the general area — that&apos;s bothering you. We&apos;ll show you what&apos;s likely going on and who can help.
          </motion.p>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-28 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        {/* Chart */}
        <div className="rounded-3xl border border-[#E7E1D6] bg-tint p-6 shadow-soft lg:sticky lg:top-28">
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
                    borderColor: active ? SAGE : 'rgba(20,32,46,0.15)',
                    backgroundColor: active ? 'rgba(156,175,136,0.18)' : '#FFFFFF',
                    color: active ? '#4F6340' : '#4A5565',
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
            <p className="mt-2 text-center font-body text-xs text-ink-muted">
              Gum health affects every tooth. For bleeding, swelling, or sensitivity, our periodontal team can help, meet{' '}
              <Link href="/doctors/dr-ranjita-shrestha-gorkhali" className="text-gold-ink underline underline-offset-2 hover:text-gold-ink">
                Dr. Ranjita Shrestha
              </Link>
              .
            </p>
          ) : activeRegionChip ? (
            <p className="mt-2 text-center font-body text-xs text-ink-muted">
              Gold = selected tooth. Soft green = the area you&apos;re browsing.
            </p>
          ) : (
            <p className="mt-2 text-center font-body text-xs text-ink-muted">Gold marks your selected tooth — tap any tooth to begin.</p>
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
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-heading text-[0.65rem] font-semibold uppercase tracking-wider text-gold-ink">
                    Tooth #{tooth.tooth_number} · FDI {tooth.fdi_number}
                  </span>
                  <h2 className="mt-3 font-display text-3xl text-ink">{tooth.name}</h2>
                  {tooth.description && <p className="mt-3 font-body text-base text-ink-muted">{tooth.description}</p>}
                </div>

                {tooth.problems && (
                  <div>
                    <h3 className="mb-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-ink-muted">Common Problems</h3>
                    <p className="font-body text-sm text-ink-muted">{tooth.problems}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-ink/10 px-8 text-center"
              >
                <p className="font-display text-2xl text-ink-muted">Select a tooth to begin</p>
                <p className="mt-2 max-w-xs font-body text-sm text-ink-muted">Tap on any highlighted tooth in the chart to see detailed information.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
