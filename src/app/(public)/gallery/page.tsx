import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'

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
          <div className="rounded-2xl bg-tint border border-dashed border-primary/30 p-12 text-center">
            <p className="font-body text-sm text-gray-500">Photos are being collected and will be published soon.</p>
            <Link href="/appointments" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-heading text-sm font-semibold text-white hover:bg-primary-dark">
              Book an Appointment
            </Link>
          </div>
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
