'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { fadeUp, stagger, blurFadeIn } from '@/lib/animations'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import type { VirtualTourRoomRow, VirtualTourRoomGalleryRow, VirtualTourHotspotRow, MediaLibraryRow } from '@/types/db'
import PanoramaModalLoader from './PanoramaModalLoader'

export type TourRoom = VirtualTourRoomRow & {
  thumbnail: MediaLibraryRow | null
  panorama: MediaLibraryRow | null
  gallery: (VirtualTourRoomGalleryRow & { media: MediaLibraryRow | null })[]
  hotspots: VirtualTourHotspotRow[]
}

export default function VirtualTourExperience({ rooms }: { rooms: TourRoom[] }) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const withPanorama = rooms.filter((r) => r.panorama && mediaDisplayUrl(r.panorama))

  return (
    <div style={{ background: '#0E1B2E' }} className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold blur-[160px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="eyebrow-dark mb-4 font-heading text-xs font-semibold uppercase tracking-[0.25em] text-gold"
          >
            360° Experience
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={blurFadeIn}
            className="font-display text-4xl text-white sm:text-5xl md:text-6xl"
          >
            Step Inside Our Clinic
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl font-body text-base text-white/60"
          >
            Explore every room in a fully immersive 360° walkthrough — before you ever step through our doors.
          </motion.p>
        </div>
      </section>

      {/* Room selector */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="relative mx-auto max-w-6xl px-6 pb-28"
      >
        {rooms.length === 0 ? (
          <p className="py-24 text-center font-body text-white/40">The virtual tour is being prepared — please check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const thumbUrl = room.thumbnail ? mediaDisplayUrl(room.thumbnail) : null
              const hasPano = room.panorama && mediaDisplayUrl(room.panorama)
              return (
                <motion.button
                  key={room.id}
                  variants={fadeUp}
                  disabled={!hasPano}
                  onClick={() => hasPano && setActiveRoomId(room.id)}
                  whileHover={hasPano ? { y: -6 } : undefined}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left backdrop-blur-sm transition-colors hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={room.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/[0.04] font-body text-xs text-white/30">No preview yet</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B2E] via-transparent to-transparent" />
                    {hasPano && (
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-white">360°</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl text-white">{room.name}</h3>
                    {room.description && (
                      <p className="mt-2 line-clamp-2 font-body text-sm text-white/55">{room.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-wider text-gold">
                      {hasPano ? 'Enter Room' : 'Coming Soon'}
                      {hasPano && (
                        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </motion.section>

      {activeRoomId && withPanorama.length > 0 && (
        <PanoramaModalLoader
          rooms={withPanorama}
          startRoomId={activeRoomId}
          onClose={() => setActiveRoomId(null)}
        />
      )}
    </div>
  )
}
