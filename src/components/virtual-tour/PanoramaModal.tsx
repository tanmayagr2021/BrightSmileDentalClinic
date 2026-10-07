'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Viewer } from '@photo-sphere-viewer/core'
import { VirtualTourPlugin, type VirtualTourLink, type VirtualTourNode } from '@photo-sphere-viewer/virtual-tour-plugin'
import { VisibleRangePlugin } from '@photo-sphere-viewer/visible-range-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'
import { TOUR_SCENES, getTourScene, type TourScene } from '@/data/virtual-tour'
import { pixelToPosition, scenePanoData, sceneMaxFov } from '@/lib/virtual-tour-geometry'

type Status = 'loading' | 'ready' | 'error' | 'unsupported'

const deg = (d: number) => (d * Math.PI) / 180

function sceneRanges(scene: TourScene) {
  const half = scene.hfov / 2
  const top = pixelToPosition(scene, [0, 0]).pitch
  const bottom = pixelToPosition(scene, [0, scene.height]).pitch
  return { horizontal: [deg(-half), deg(half)] as [number, number], vertical: [deg(bottom), deg(top)] as [number, number] }
}

function initialPosition(scene: TourScene) {
  const { yaw, pitch } = pixelToPosition(scene, scene.initialView)
  return { yaw: deg(yaw), pitch: deg(pitch) }
}

// In-scene navigation marker: a small ringed chevron with its destination
// underneath. Rendered by VirtualTourPlugin (2d mode) at the hotspot's spot in
// the photo, so it sits on the doorway/floor it leads through.
function buildHotspotElement(link: VirtualTourLink, onActivate: (link: VirtualTourLink) => void): HTMLElement {
  const label: string = link.data?.label ?? ''
  const el = document.createElement('div')
  el.setAttribute('role', 'button')
  el.setAttribute('tabindex', '0')
  el.setAttribute('aria-label', `Go to ${link.data?.targetName ?? label}`)
  el.className = 'tour-hotspot group relative outline-none'
  el.innerHTML = `
    <span class="tour-hotspot-ring flex h-full w-full items-center justify-center rounded-full border border-white/70 bg-[#0A1128]/45 text-white shadow-[0_4px_18px_rgba(0,0,0,0.35)] backdrop-blur-[3px] transition-all duration-200 group-hover:scale-110 group-hover:border-gold group-hover:bg-[#0A1128]/70 group-hover:text-gold group-focus-visible:scale-110 group-focus-visible:border-gold group-focus-visible:text-gold group-focus-visible:ring-2 group-focus-visible:ring-gold group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/40">
      <svg viewBox="0 0 16 16" fill="none" class="h-4 w-4" aria-hidden="true"><path d="M3.5 10l4.5-4.5 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
  `
  const caption = document.createElement('span')
  caption.className =
    'pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0A1128]/60 px-2.5 py-1 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-[3px] transition-colors group-hover:text-gold'
  caption.textContent = label
  el.appendChild(caption)
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onActivate(link)
    }
  })
  return el
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function PanoramaModal({
  startSceneId,
  onClose,
}: {
  startSceneId: string
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const pluginRef = useRef<VirtualTourPlugin | null>(null)
  const historyRef = useRef<string[]>([])
  const goingBackRef = useRef(false)
  // Scene whose image is currently being fetched — so a load failure can name
  // the scene that failed, not the one still on screen.
  const loadingIdRef = useRef<string | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const startScene = getTourScene(startSceneId) ?? TOUR_SCENES[0]
  const [currentId, setCurrentId] = useState<string>(startScene.id)
  const [previousId, setPreviousId] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [failedId, setFailedId] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(true)
  const [overviewOpen, setOverviewOpen] = useState(false)
  const overviewOpenRef = useRef(false)
  overviewOpenRef.current = overviewOpen
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)

  const currentScene = getTourScene(currentId) ?? startScene
  const previousScene = previousId ? getTourScene(previousId) : undefined

  const goTo = useCallback((sceneId: string, fromLink?: VirtualTourLink) => {
    setOverviewOpen(false)
    setShowHint(false)
    pluginRef.current?.setCurrentNode(sceneId, undefined, fromLink).catch(() => {
      // Aborted by a newer navigation — nothing to do. Real load failures
      // surface through the viewer's panorama-error event.
    })
  }, [])

  const goBack = useCallback(() => {
    const prev = historyRef.current[historyRef.current.length - 1]
    if (!prev) return
    goingBackRef.current = true
    goTo(prev)
  }, [goTo])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const aspect = () => container.clientWidth / Math.max(1, container.clientHeight)

    const nodes: VirtualTourNode[] = TOUR_SCENES.map((scene) => ({
      id: scene.id,
      name: scene.name,
      panorama: scene.src,
      panoData: scenePanoData(scene),
      links: scene.hotspots
        .filter((h) => getTourScene(h.target))
        .map((h) => {
          const p = pixelToPosition(scene, h.at)
          return { nodeId: h.target, position: { yaw: `${p.yaw}deg`, pitch: `${p.pitch}deg` }, data: { label: h.label, targetName: getTourScene(h.target)?.name } }
        }),
    }))

    const applySceneLimits = (scene: TourScene, viewer: Viewer) => {
      const range = viewer.getPlugin(VisibleRangePlugin) as VisibleRangePlugin
      const maxFov = sceneMaxFov(scene, aspect())
      viewer.setOptions({ maxFov, minFov: Math.max(18, maxFov * 0.45) })
      // setOptions keeps the current field of view even when it's now wider
      // than this photo allows (e.g. arriving from a wider scene, or after
      // rotating a phone) — pull it back inside so no black edge shows.
      // (The zoom dynamic only recomputes the FOV when its value changes,
      // and it's already clamped at 0 here — hence the nudge.)
      if (viewer.state.vFov > maxFov + 0.01) {
        viewer.zoom(1)
        viewer.zoom(0)
      }
      const r = sceneRanges(scene)
      range.setHorizontalRange(r.horizontal)
      range.setVerticalRange(r.vertical)
    }

    let viewer: Viewer
    try {
      viewer = new Viewer({
        container,
        navbar: false,
        loadingTxt: '',
        keyboard: 'always',
        mousewheelCtrlKey: false,
        defaultZoomLvl: 0,
        defaultYaw: initialPosition(startScene).yaw,
        defaultPitch: initialPosition(startScene).pitch,
        maxFov: sceneMaxFov(startScene, aspect()),
        minFov: Math.max(18, sceneMaxFov(startScene, aspect()) * 0.45),
        lang: { loadError: '' },
        plugins: [
          VisibleRangePlugin,
          VirtualTourPlugin.withConfig({
            positionMode: 'manual',
            renderMode: '2d',
            nodes,
            startNodeId: startScene.id,
            showLinkTooltip: false,
            arrowStyle: {
              size: { width: 44, height: 44 },
              element: (link: VirtualTourLink) => buildHotspotElement(link, (l) => goTo(l.nodeId, l)),
            },
            // Only warm the scene each hotspot leads to after the current one
            // is showing, and only the first (primary) link — never the
            // whole tour up front.
            preload: (node, link) => node.links?.[0]?.nodeId === link.nodeId,
            transitionOptions: (toNode) => {
              const scene = getTourScene(toNode.id)!
              // Free the camera while the old view fades out, and size the
              // zoom range for the incoming photo. Changing maxFov keeps the
              // current field of view, so the outgoing scene doesn't jump.
              const range = viewer.getPlugin(VisibleRangePlugin) as VisibleRangePlugin
              range.setHorizontalRange(null)
              range.setVerticalRange(null)
              const maxFov = sceneMaxFov(scene, aspect())
              viewer.setOptions({ maxFov, minFov: Math.max(18, maxFov * 0.45) })
              return {
                showLoader: false,
                effect: 'fade',
                speed: prefersReducedMotion ? 450 : 750,
                rotation: !prefersReducedMotion,
                rotateTo: initialPosition(scene),
                zoomTo: 0,
              }
            },
          }),
        ],
      })
    } catch {
      // WebGL unavailable (very old browser, disabled GPU, some in-app webviews).
      setStatus('unsupported')
      return
    }

    viewerRef.current = viewer
    const plugin = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin
    pluginRef.current = plugin

    let current: string = startScene.id
    plugin.addEventListener('node-changed', ({ node }) => {
      const scene = getTourScene(node.id)
      if (!scene) return
      if (node.id !== current) {
        if (goingBackRef.current) historyRef.current.pop()
        else historyRef.current.push(current)
      }
      goingBackRef.current = false
      current = node.id
      setCurrentId(node.id)
      setPreviousId(historyRef.current[historyRef.current.length - 1] ?? null)
      setStatus('ready')
      setHasLoaded(true)
      applySceneLimits(scene, viewer)
    })

    viewer.addEventListener('panorama-load', ({ panorama }) => {
      loadingIdRef.current = TOUR_SCENES.find((s) => s.src === panorama)?.id ?? null
    })
    let lastLoadErrorAt = 0
    viewer.addEventListener('panorama-error', () => {
      lastLoadErrorAt = Date.now()
      setFailedId(loadingIdRef.current)
      // Our own branded overlay (with Try again / Back / Exit) replaces the
      // library's built-in one, which has no actions.
      viewer.hideError()
      goingBackRef.current = false
      setStatus('error')
    })
    viewer.addEventListener('size-updated', () => {
      const scene = getTourScene(current)
      if (scene && viewer.state.ready) applySceneLimits(scene, viewer)
    })
    // Any real interaction (not the viewer's own programmatic rotations)
    // means the visitor has found the controls.
    const dismissHint = () => setShowHint(false)
    container.addEventListener('pointerdown', dismissHint, { once: true })
    container.addEventListener('wheel', dismissHint, { once: true, passive: true })

    // React 18 Strict Mode double-invokes this effect in dev only, destroying
    // the first "phantom" viewer while the plugin's async node-loading chain
    // is still in flight; that chain then rejects on the deleted datasource.
    // Dev-only noise — destroy() must stay synchronous (deferring it aborts
    // the real instance's identical image request), so only this specific
    // known-benign rejection is silenced.
    const silenceKnownStrictModeRace = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : ''
      if (msg.includes("reading 'loadNode'") || msg.includes("reading 'clear'")) e.preventDefault()
      // The plugin starts the first scene without catching its promise, so a
      // failed image load also surfaces as an unhandled rejection. It's
      // already shown to the visitor via the overlay above — don't log twice.
      else if (Date.now() - lastLoadErrorAt < 1000) e.preventDefault()
    }
    window.addEventListener('unhandledrejection', silenceKnownStrictModeRace)

    return () => {
      container.removeEventListener('pointerdown', dismissHint)
      container.removeEventListener('wheel', dismissHint)
      viewer.destroy()
      viewerRef.current = null
      pluginRef.current = null
      setTimeout(() => window.removeEventListener('unhandledrejection', silenceKnownStrictModeRace), 0)
    }
    // Viewer is created once per open; scene changes go through the plugin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hint fades on its own if the visitor doesn't touch anything.
  useEffect(() => {
    if (!showHint || status !== 'ready') return
    const t = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(t)
  }, [showHint, status])

  // Lock page scroll behind the tour.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Fullscreen is requested on the whole tour panel (not just the canvas) so
  // the controls stay visible. iPhone Safari has no element fullscreen, so
  // the button is hidden there rather than shown broken.
  useEffect(() => {
    setCanFullscreen(!!document.fullscreenEnabled)
    const onChange = () => setIsFullscreen(document.fullscreenElement === panelRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else panelRef.current?.requestFullscreen().catch(() => {})
  }

  // Focus management: focus Exit on open, keep Tab inside the tour (querying
  // live, since hotspots are added/removed as scenes change), Escape closes
  // the overview first, then the tour. Focus returns to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('[data-tour-exit]')?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) return // browser exits fullscreen itself
        if (overviewOpenRef.current) setOverviewOpen(false)
        else onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el.closest('.psv-container'))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      opener?.focus?.()
    }
  }, [])

  // A failure while walking somewhere new leaves the visitor where they were;
  // a failure on the very first scene leaves nothing to go back to.
  const failedWhileMoving = hasLoaded && failedId !== null && failedId !== currentId

  const reload = (sceneId: string) => {
    setStatus('loading')
    pluginRef.current?.setCurrentNode(sceneId, { forceUpdate: true }).catch(() => {})
  }
  const retry = () => reload(failedId ?? currentId)

  const controlBtn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#0A1128]/55 text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      // Keep the site's smooth-scroll (Lenis) from acting on wheel/touch
      // gestures meant for the panorama.
      data-lenis-prevent
      aria-label={`Virtual tour of Bright Smile Dental Clinic — ${currentScene.name}`}
      className="fixed inset-0 z-[10000] h-[100dvh] w-full overflow-hidden bg-[#05080F]"
    >
      {/* z-0 gives the viewer its own stacking context so its internal
          layers (loader, overlay, link markers) can't rise above the tour UI. */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Blurred preview of the first scene while its full image streams in. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${hasLoaded ? 'opacity-0' : 'opacity-100'}`}
      >
        <Image src={startScene.thumb} alt="" fill sizes="100vw" className="scale-110 object-cover blur-xl brightness-75" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-gold" />
        </div>
      </div>

      {/* Top bar: where you are + exit */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 bg-gradient-to-b from-black/55 via-black/20 to-transparent px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div aria-live="polite" className="min-w-0">
          <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/90">Bright Smile Dental Clinic</p>
          <p key={currentScene.id} className="mt-1 animate-fade-in truncate font-display text-xl text-white sm:text-2xl">
            {currentScene.name}
          </p>
        </div>
        <button
          type="button"
          data-tour-exit
          onClick={onClose}
          className={`pointer-events-auto flex-shrink-0 ${controlBtn}`}
          aria-label="Exit virtual tour"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* First-visit hint */}
      <div
        aria-hidden={!showHint}
        className={`pointer-events-none absolute left-1/2 top-[calc(max(1rem,env(safe-area-inset-top))+4.75rem)] z-10 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 transition-opacity duration-500 ${showHint && status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center gap-3 rounded-full bg-[#0A1128]/65 px-4 py-2.5 backdrop-blur-md">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0 text-gold" aria-hidden="true">
            <path d="M8 12h8M8 12l2.5-2.5M8 12l2.5 2.5M16 12l-2.5-2.5M16 12l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-body text-xs text-white/90 sm:text-sm">Drag to look around · tap a marker to walk through</p>
        </div>
      </div>

      {/* Bottom bar: back (left), view controls (right) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-black/50 via-black/15 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 sm:px-6 sm:pb-6">
        <div className="min-w-0">
          {previousScene && (
            <button
              type="button"
              onClick={goBack}
              className="pointer-events-auto flex h-11 max-w-full items-center gap-2 rounded-full border border-white/15 bg-[#0A1128]/55 pl-3 pr-4 font-heading text-xs font-semibold text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={`Back to ${previousScene.name}`}
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0" aria-hidden="true"><path d="M10 3.5L5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="truncate">{previousScene.name}</span>
            </button>
          )}
        </div>

        <div className="pointer-events-auto relative flex flex-shrink-0 items-center gap-2">
          <button type="button" onClick={() => viewerRef.current?.zoomOut()} className={`hidden sm:flex ${controlBtn}`} aria-label="Zoom out">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <button type="button" onClick={() => viewerRef.current?.zoomIn()} className={`hidden sm:flex ${controlBtn}`} aria-label="Zoom in">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M3.5 8h9M8 3.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          {canFullscreen && (
            <button type="button" onClick={toggleFullscreen} className={controlBtn} aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'} aria-pressed={isFullscreen}>
              {isFullscreen ? (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M6 2.5V6H2.5M10 2.5V6h3.5M6 13.5V10H2.5M10 13.5V10h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOverviewOpen((o) => !o)}
            className={controlBtn}
            aria-label="All areas of the clinic"
            aria-expanded={overviewOpen}
            aria-controls="tour-overview"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true"><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="2.5" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>
          </button>

          {/* Secondary overview — a shortcut, not the main way around. */}
          {overviewOpen && (
            <div
              id="tour-overview"
              role="group"
              aria-label="Jump to an area"
              className="absolute bottom-full right-0 mb-3 w-[min(17rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0A1128]/85 p-2 shadow-2xl backdrop-blur-xl"
            >
              {TOUR_SCENES.map((scene) => {
                const active = scene.id === currentId
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => (active ? setOverviewOpen(false) : goTo(scene.id))}
                    aria-current={active ? 'location' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${active ? 'bg-white/10' : 'hover:bg-white/[0.06]'}`}
                  >
                    <span className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image src={scene.thumb} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className={`font-heading text-xs font-semibold ${active ? 'text-gold' : 'text-white/85'}`}>{scene.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {(status === 'error' || status === 'unsupported') && (
        <div role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0A1128]/95 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-gold" aria-hidden="true">
              <path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 003.82 21h16.36a2 2 0 001.71-2.96L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {status === 'unsupported' ? (
            <>
              <p className="font-display text-xl text-white">The tour can&apos;t run in this browser</p>
              <p className="max-w-sm font-body text-sm text-white/60">It needs WebGL, which this browser has turned off. The photos in our gallery show the same rooms.</p>
            </>
          ) : (
            <>
              <p className="font-display text-xl text-white">Unable to load this view</p>
              <p className="max-w-sm font-body text-sm text-white/60">Check your connection and try again.</p>
            </>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {status === 'error' && (
              <button type="button" onClick={retry} className="rounded-xl bg-gold px-6 py-3 font-heading text-sm font-semibold text-[#0A1128] transition-colors hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Try again
              </button>
            )}
            {status === 'error' && failedWhileMoving && (
              <button type="button" onClick={() => reload(currentId)} className="rounded-xl border border-white/20 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                Back to {currentScene.name}
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-xl border border-white/20 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              Exit tour
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
