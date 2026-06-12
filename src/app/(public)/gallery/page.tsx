import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'

const PLACEHOLDER_TILES = [
  { icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z', label: 'Reception Area', aspect: 'tall' },
  { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: 'Patient Smiles', aspect: 'wide' },
  { icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', label: 'Treatment Rooms', aspect: 'tall' },
  { icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', label: 'Modern Equipment', aspect: 'wide' },
  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Our Team', aspect: 'tall' },
  { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'Before & After', aspect: 'wide' },
]

function GalleryEmptyState() {
  return (
    <div>
      {/* Intro text */}
      <div className="mb-12 max-w-xl">
        <p className="font-body text-base text-gray-500 leading-relaxed">
          Our gallery is growing — photos of our clinic, team and patient transformations
          are published with full consent. Check back soon, or come see us in person.
        </p>
      </div>

      {/* Placeholder tile grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 lg:gap-4">
        {PLACEHOLDER_TILES.map((tile, i) => (
          <div
            key={tile.label}
            className={`group relative overflow-hidden rounded-2xl border border-gray-100 transition-all duration-300 hover:border-primary/20 hover:shadow-card-hover ${
              tile.aspect === 'tall' ? 'aspect-[3/4]' : 'aspect-[4/3]'
            } ${i === 1 ? 'sm:col-span-1' : ''}`}
            style={{ background: `linear-gradient(${145 + i * 15}deg, #0A1F14 0%, #1A3D2B 100%)` }}
          >
            {/* Dot grid */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden="true">
              <defs>
                <pattern id={`gallery-dots-${i}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.8" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#gallery-dots-${i})`} />
            </svg>

            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <div className="h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            </div>

            {/* Icon + label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white/30" aria-hidden="true">
                  <path d={tile.icon} />
                </svg>
              </div>
              <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/22">
                {tile.label}
              </span>
            </div>

            {/* Coming soon label */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-black/20 py-1.5 backdrop-blur-sm">
              <span className="h-1 w-1 rounded-full bg-primary/60" />
              <span className="font-heading text-[0.52rem] font-semibold tracking-[0.12em] text-white/30">
                Photo coming soon
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-14 flex flex-col items-center gap-4 text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          Want to see the clinic in person?
        </p>
        <Link
          href="/appointments"
          className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-primary/30 active:scale-[0.97]"
        >
          Book a Visit
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'View our dental clinic gallery — our facilities, team, and patient transformations.',
}

export default async function GalleryPage() {
  const supabase = createAdminClient()

  const [{ data: items }, { data: groups }] = await Promise.all([
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
  ])

  const galleryItems = items ?? []
  const galleryGroups = groups ?? []

  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Our Space
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">Gallery</h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            A look inside our modern clinic and the smiles we create every day.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {galleryItems.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <>
            {/* Group filters — only show if items exist in multiple groups */}
            {galleryGroups.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {galleryGroups.map((g) => (
                  <span key={g.id} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-heading text-xs font-semibold text-gray-600">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
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
