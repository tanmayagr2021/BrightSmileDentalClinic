'use client'

import dynamic from 'next/dynamic'

// Photo Sphere Viewer touches the DOM/WebGL at instantiation time — load it
// client-only, same pattern as BrightAILoader.
const PanoramaModal = dynamic(() => import('./PanoramaModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#05080F]">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-gold" />
    </div>
  ),
})

export default function PanoramaModalLoader({
  startSceneId,
  onClose,
}: {
  startSceneId: string
  onClose: () => void
}) {
  return <PanoramaModal startSceneId={startSceneId} onClose={onClose} />
}
