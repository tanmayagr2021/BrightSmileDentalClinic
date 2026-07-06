'use client'

import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { VirtualTourPlugin, type VirtualTourNode } from '@photo-sphere-viewer/virtual-tour-plugin'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import { useFocusTrap } from '@/lib/use-focus-trap'
import type { TourRoom } from './VirtualTourExperience'

export default function PanoramaModal({
  rooms,
  startRoomId,
  onClose,
}: {
  rooms: TourRoom[]
  startRoomId: string
  onClose: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [currentRoomId, setCurrentRoomId] = useState(startRoomId)
  const [loadError, setLoadError] = useState(false)

  useFocusTrap(panelRef, true, onClose)

  useEffect(() => {
    if (!containerRef.current) return

    const nodes: VirtualTourNode[] = rooms.map((room) => ({
      id: room.id,
      panorama: mediaDisplayUrl(room.panorama!)!,
      name: room.name,
      thumbnail: room.thumbnail ? (mediaDisplayUrl(room.thumbnail) ?? undefined) : undefined,
      caption: room.name,
      links: room.hotspots
        .filter((h) => rooms.some((r) => r.id === h.target_room_id))
        .map((h) => ({
          nodeId: h.target_room_id,
          name: h.label ?? undefined,
          position: { yaw: `${h.yaw}deg`, pitch: `${h.pitch}deg` },
        })),
    }))

    // Respect prefers-reduced-motion: continuous auto-rotation is exactly the
    // kind of non-essential motion WCAG 2.3.3 asks sites to suppress.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const viewer = new Viewer({
      container: containerRef.current,
      defaultZoomLvl: 0,
      navbar: ['zoom', 'move', 'caption', 'fullscreen'],
      lang: { loadError: "This view couldn't load. Please try again." },
      plugins: [
        MarkersPlugin,
        ...(prefersReducedMotion ? [] : [AutorotatePlugin.withConfig({ autostartDelay: 4000, autorotateSpeed: '1rpm' })]),
        VirtualTourPlugin.withConfig({
          positionMode: 'manual',
          renderMode: '3d',
          nodes,
          startNodeId: startRoomId,
          transitionOptions: { showLoader: true, speed: '20rpm', effect: 'fade', rotation: !prefersReducedMotion },
        }),
      ],
    })

    viewerRef.current = viewer

    const tourPlugin = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin
    tourPlugin.addEventListener('node-changed', ({ node }) => {
      setCurrentRoomId(node.id)
      setLoadError(false)
    })
    viewer.addEventListener('panorama-error', () => setLoadError(true))

    // React 18 Strict Mode double-invokes this effect in dev only,
    // destroying this "phantom" viewer instance immediately after creating
    // it. The plugin's own setCurrentNode->loadNode async chain is still in
    // flight at that point; destroy() deletes internal state the chain
    // still needs, causing an unhandled rejection partway through it — this
    // is dev-only noise (Strict Mode never double-invokes in production)
    // confirmed not to affect the real (second) instance's own render.
    // Deferring destroy to let that chain settle first was tried and
    // rejected: it delays disposing the phantom instance's <img>/texture
    // loader long enough to abort the *real* instance's identical panorama
    // request too (the browser coalesces concurrent identical-URL image
    // loads), leaving the viewer stuck on "Loading" — a worse, user-visible
    // regression. So destroy stays synchronous (proven correct), and only
    // this specific known-benign rejection is silenced from the console.
    const silenceKnownStrictModeRace = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : ''
      if (msg.includes("reading 'loadNode'") || msg.includes("reading 'clear'")) e.preventDefault()
    }
    window.addEventListener('unhandledrejection', silenceKnownStrictModeRace)

    return () => {
      viewer.destroy()
      viewerRef.current = null
      // The phantom instance's rejection fires asynchronously, after this
      // synchronous cleanup runs — defer removing the listener by one
      // macrotask (not tied to the load path, so safe to defer) so it's
      // still attached when that rejection actually arrives.
      setTimeout(() => window.removeEventListener('unhandledrejection', silenceKnownStrictModeRace), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRetry = () => {
    const plugin = viewerRef.current?.getPlugin(VirtualTourPlugin) as VirtualTourPlugin | undefined
    setLoadError(false)
    plugin?.setCurrentNode(currentRoomId, { forceUpdate: true })
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const currentRoom = rooms.find((r) => r.id === currentRoomId)

  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label={`360° virtual tour${currentRoom ? ` — ${currentRoom.name}` : ''}`} className="fixed inset-0 z-[80] bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Close virtual tour"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>

      {/* Room label */}
      {currentRoom && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/50 px-4 py-2 backdrop-blur-sm">
          <span className="font-heading text-xs font-semibold uppercase tracking-wider text-white">{currentRoom.name}</span>
        </div>
      )}

      {/* Branded error + retry — the library's own built-in overlay has no
          retry action and isn't dismissible, so this sits on top of it. */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0A1128]/95 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-gold" aria-hidden="true">
              <path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 003.82 21h16.36a2 2 0 001.71-2.96L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-display text-xl text-white">This room couldn't load</p>
          <p className="max-w-sm font-body text-sm text-white/60">
            The 360° view didn't come through. Check your connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="mt-2 rounded-xl bg-gold px-6 py-3 font-heading text-sm font-semibold text-[#0A1128] transition-colors hover:bg-gold/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Room dock */}
      {rooms.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-sm" role="group" aria-label="Switch room">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                const plugin = viewerRef.current?.getPlugin(VirtualTourPlugin) as VirtualTourPlugin | undefined
                plugin?.setCurrentNode(room.id)
              }}
              aria-pressed={currentRoomId === room.id}
              className={`flex-shrink-0 whitespace-nowrap rounded-xl px-3 py-2 font-heading text-[0.65rem] font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                currentRoomId === room.id ? 'bg-gold text-[#0A1128]' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
