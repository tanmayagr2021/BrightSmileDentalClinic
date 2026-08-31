'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useFocusTrap } from '@/lib/use-focus-trap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { trackEvent } from '@/lib/analytics'
import { EASE_CINEMATIC } from '@/lib/animations'

export type GalleryGridItem = {
  id: string
  image_url: string | null
  alt_text: string | null
  caption: string | null
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function GalleryGrid({ items }: { items: GalleryGridItem[] }) {
  // Only real photos are openable in the lightbox — placeholder tiles stay inert.
  const viewable = items.filter((i) => i.image_url)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  // Portal the lightbox to <body>: the public page is wrapped in a
  // transformed motion.div (template.tsx), which would otherwise become the
  // containing block for `position: fixed` and let the header show through.
  useEffect(() => setMounted(true), [])

  const isOpen = openIndex !== null
  const close = useCallback(() => setOpenIndex(null), [])

  const go = useCallback(
    (delta: number) => {
      setOpenIndex((i) => {
        if (i === null || viewable.length === 0) return i
        return (i + delta + viewable.length) % viewable.length
      })
    },
    [viewable.length]
  )

  useFocusTrap(panelRef, isOpen, close)

  // Arrow-key navigation + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, go])

  const openAt = (id: string) => {
    const idx = viewable.findIndex((v) => v.id === id)
    if (idx === -1) return
    setOpenIndex(idx)
    trackEvent('Gallery Image Opened', { id })
  }

  const current = openIndex !== null ? viewable[openIndex] : null

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const openable = Boolean(item.image_url)
          const Tag = openable ? 'button' : 'div'
          return (
            <Tag
              key={item.id}
              {...(openable
                ? {
                    type: 'button' as const,
                    onClick: () => openAt(item.id),
                    'aria-label': `View ${item.alt_text ?? 'clinic photo'} larger`,
                  }
                : {})}
              className={`group relative block w-full overflow-hidden rounded-2xl bg-gray-100 aspect-square ${
                openable
                  ? 'cursor-zoom-in transition-shadow hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1B2E]'
                  : ''
              }`}
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.alt_text ?? 'Clinic photo'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-tint">
                  <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-gray-300" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 15l5-4 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {item.caption && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-6 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="font-body text-xs text-white">{item.caption}</p>
                </div>
              )}
            </Tag>
          )
        })}
      </div>

      {mounted && createPortal(
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            aria-modal="true"
            role="dialog"
            aria-label={current.alt_text ?? 'Gallery image'}
          >
            {/* Backdrop */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute inset-0 h-full w-full cursor-zoom-out bg-black/95 backdrop-blur-md"
            />

            <div ref={panelRef} className="relative z-10 flex max-h-full w-full max-w-5xl flex-col items-center">
              <span className="fixed left-4 top-4 z-20 font-heading text-xs font-semibold tracking-wide text-white/70">
                {openIndex! + 1} / {viewable.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="fixed right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Image */}
              <motion.div
                key={current.id}
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0 : 0.4, ease: EASE_CINEMATIC }}
                className="relative flex max-h-[78vh] w-full items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.image_url!}
                  alt={current.alt_text ?? 'Clinic photo'}
                  className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                />
              </motion.div>

              {current.caption && (
                <p className="mt-4 text-center font-body text-sm text-white/80">{current.caption}</p>
              )}

              {/* Prev / Next — fixed to the viewport edges so they stay
                  on-screen at every width (the panel isn't always narrower
                  than the viewport). */}
              {viewable.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous image"
                    className="fixed left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition-colors hover:bg-black/80 sm:left-6"
                  >
                    <Chevron dir="left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next image"
                    className="fixed right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition-colors hover:bg-black/80 sm:right-6"
                  >
                    <Chevron dir="right" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  )
}
