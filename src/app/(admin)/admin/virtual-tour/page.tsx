import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import VirtualTourClient from './VirtualTourClient'
import type { VirtualTourRoomRow, VirtualTourRoomGalleryRow, VirtualTourHotspotRow, MediaLibraryRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export type RoomWithRelations = VirtualTourRoomRow & {
  thumbnail: MediaLibraryRow | null
  panorama: MediaLibraryRow | null
  gallery: (VirtualTourRoomGalleryRow & { media: MediaLibraryRow | null })[]
  hotspots: VirtualTourHotspotRow[]
}

export default async function AdminVirtualTourPage() {
  await requireAdmin()

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
    .order('sort_order', { ascending: true })

  return (
    <>
      <div className="mx-6 mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-body text-xs text-amber-900">
        The public Virtual Tour no longer reads these rooms. Its scenes, hotspots and starting views are now defined in{' '}
        <code className="font-mono">src/data/virtual-tour.ts</code> and change with a code deploy. Edits made here won&apos;t appear on the website.
      </div>
      <VirtualTourClient initialRooms={(rooms as RoomWithRelations[]) ?? []} />
    </>
  )
}
