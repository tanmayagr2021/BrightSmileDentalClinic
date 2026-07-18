import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCanonical } from '@/lib/schema'
import VirtualTourExperience, { type TourRoom } from '@/components/virtual-tour/VirtualTourExperience'

const PLACEHOLDER_TILES = [
  { icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z', label: 'Reception Area', aspect: 'tall' },
  { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: 'Patient Smiles', aspect: 'wide' },
  { icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', label: 'Treatment Rooms', aspect: 'tall' },
  { icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', label: 'Modern Equipment', aspect: 'wide' },
  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Our Team', aspect: 'tall' },
  { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'Before & After', aspect: 'wide' },
]

function TileInner({ icon, label, index }: { icon: string; label: string; index: number }) {
  return (
    <>
      {/* Dot grid */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]" aria-hidden="true">
        <defs>
          <pattern id={`gallery-dots-${index}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#gallery-dots-${index})`} />
      </svg>

      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="h-32 w-32 rounded-full bg-primary/[0.07] blur-3xl" />
      </div>

      {/* Icon + label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-5">
        <div className="h-14 w-14 flex items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-white/45"
            aria-hidden="true"
          >
            <path d={icon} />
          </svg>
        </div>
        <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/55 text-center">
          {label}
        </span>
      </div>

      {/* Coming soon strip */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 border-t border-white/[0.05] bg-black/10 py-2 backdrop-blur-sm">
        <span className="h-1 w-1 rounded-full bg-primary/50" />
        <span className="font-heading text-[0.65rem] font-semibold tracking-[0.1em] text-white/50">
          Photo coming soon
        </span>
      </div>
    </>
  )
}

const TILE_BASE = 'relative overflow-hidden rounded-2xl transition-all duration-300 hover:ring-1 hover:ring-primary/30'
const TILE_BG = { background: '#0d1425' } as const

function GalleryEmptyState() {
  return (
    <div>
      {/* Row 1 — asymmetric 2 + 1 */}
      <div className="grid grid-cols-3 gap-3 h-[55vh] min-h-[360px]">
        <div className={`col-span-2 ${TILE_BASE}`} style={TILE_BG}>
          <TileInner icon={PLACEHOLDER_TILES[0].icon} label={PLACEHOLDER_TILES[0].label} index={0} />
        </div>
        <div className={`col-span-1 ${TILE_BASE}`} style={TILE_BG}>
          <TileInner icon={PLACEHOLDER_TILES[1].icon} label={PLACEHOLDER_TILES[1].label} index={1} />
        </div>
      </div>

      {/* Row 2 — three equal columns */}
      <div className="mt-3 grid grid-cols-3 gap-3 h-[32vh] min-h-[200px]">
        {PLACEHOLDER_TILES.slice(2, 5).map((tile, idx) => (
          <div key={tile.label} className={`col-span-1 ${TILE_BASE}`} style={TILE_BG}>
            <TileInner icon={tile.icon} label={tile.label} index={idx + 2} />
          </div>
        ))}
      </div>

      {/* Row 3 — full-width panoramic */}
      <div className={`mt-3 w-full aspect-[21/6] ${TILE_BASE}`} style={TILE_BG}>
        <TileInner
          icon={PLACEHOLDER_TILES[5].icon}
          label={PLACEHOLDER_TILES[5].label}
          index={5}
        />
      </div>

      {/* CTA */}
      <div className="mt-16 flex flex-col items-center gap-6 text-center">
        <p className="font-display text-3xl text-white tracking-display">
          Come see us in person.
        </p>
        <p className="font-body text-sm text-white/75">
          Our clinic speaks for itself. Book a visit and tour our space.
        </p>
        <Link
          href="/appointments"
          className="rounded-xl bg-primary px-8 py-4 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark"
        >
          Book a Visit
        </Link>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/gallery') },
  title: 'Gallery',
  description: 'View our dental clinic gallery — our facilities, team, and patient transformations.',
}

export default async function GalleryPage() {
  const supabase = createAdminClient()

  const [{ data: items }, { data: groups }, { data: tourRooms }] = await Promise.all([
    supabase
      .from('gallery')
      .select('*, gallery_groups(id, name, slug)')
      .is('deleted_at', null)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('gallery_groups')
      .select('*')
      .is('deleted_at', null)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('virtual_tour_rooms')
      .select(`
        *,
        thumbnail:media_library!virtual_tour_rooms_thumbnail_media_id_fkey(*),
        panorama:media_library!virtual_tour_rooms_panorama_media_id_fkey(*),
        gallery:virtual_tour_room_gallery(*, media:media_library(*)),
        hotspots:virtual_tour_hotspots!virtual_tour_hotspots_room_id_fkey(*)
      `)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
  ])

  const galleryItems = items ?? []
  const galleryGroups = groups ?? []
  const virtualTourRooms = (tourRooms as TourRoom[]) ?? []

  return (
    <div style={{ background: '#0E1B2E' }} className="min-h-screen">
      {/* Hero — integrated into dark page */}
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
          <span className="inline-block h-px w-6 bg-gold/60" />
          Visual Tour
        </span>
        <h1 className="mt-6 font-display text-6xl text-white sm:text-7xl lg:text-[7rem] tracking-display leading-[0.95]">
          Our<br />Space.
        </h1>
        <p className="mt-5 max-w-md font-body text-base text-white/75 leading-relaxed">
          A look inside our clinic — spaces designed for comfort, equipment built for precision.
          Photos added with patient consent.
        </p>
        <div className="mt-12 h-px bg-white/[0.06]" />
      </div>

      {/* Virtual Clinic Tour — embedded near the top of Gallery, the primary
          public discovery point for the 360 experience (see /virtual-tour
          for the standalone fullscreen route). */}
      {virtualTourRooms.length > 0 && (
        <>
          <div id="virtual-tour" className="scroll-mt-24">
            <VirtualTourExperience rooms={virtualTourRooms} variant="embedded" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-px bg-white/[0.06]" />
          </div>
        </>
      )}

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {galleryItems.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <>
            {/* Group filters */}
            {galleryGroups.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {galleryGroups.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 font-heading text-xs font-semibold text-white/50"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-square"
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
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-6 transition-transform duration-300 group-hover:translate-y-0">
                      <p className="font-body text-xs text-white">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
