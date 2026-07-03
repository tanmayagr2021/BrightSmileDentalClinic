import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCanonical } from '@/lib/schema'
import VirtualTourExperience, { type TourRoom } from '@/components/virtual-tour/VirtualTourExperience'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/virtual-tour') },
  title: 'Virtual Clinic Tour — 360° Walkthrough',
  description:
    'Step inside Bright Smile Dental Clinic before you visit. Explore our reception, treatment rooms, and equipment with an immersive 360° virtual tour.',
}

export default async function VirtualTourPage() {
  const supabase = createAdminClient()

  const { data: rooms } = await supabase
    .from('virtual_tour_rooms')
    .select(`
      *,
      thumbnail:media_library!virtual_tour_rooms_thumbnail_media_id_fkey(*),
      panorama:media_library!virtual_tour_rooms_panorama_media_id_fkey(*),
      gallery:virtual_tour_room_gallery(*, media:media_library(*)),
      hotspots:virtual_tour_hotspots!virtual_tour_hotspots_room_id_fkey(*)
    `)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  return <VirtualTourExperience rooms={(rooms as TourRoom[]) ?? []} />
}
