'use client'

import dynamic from 'next/dynamic'
import type { TourRoom } from './VirtualTourExperience'

// Photo Sphere Viewer touches the DOM/WebGL at instantiation time — load it
// client-only, same pattern as BrightAILoader.
const PanoramaModal = dynamic(() => import('./PanoramaModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-gold" />
    </div>
  ),
})

export default function PanoramaModalLoader({
  rooms,
  startRoomId,
  onClose,
}: {
  rooms: TourRoom[]
  startRoomId: string
  onClose: () => void
}) {
  return <PanoramaModal rooms={rooms} startRoomId={startRoomId} onClose={onClose} />
}
