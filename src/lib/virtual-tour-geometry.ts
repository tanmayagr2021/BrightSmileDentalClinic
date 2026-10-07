import type { TourScene } from '@/data/virtual-tour'

// Geometry for showing a partial (non-360°) panorama on Photo Sphere
// Viewer's sphere: the image is placed, centred, on a virtual full-size
// equirectangular canvas whose width is set by the scene's horizontal FOV.

export type PanoData = {
  fullWidth: number
  fullHeight: number
  croppedWidth: number
  croppedHeight: number
  croppedX: number
  croppedY: number
}

export function scenePanoData(scene: TourScene): PanoData {
  const fullWidth = Math.round((scene.width * 360) / scene.hfov)
  const fullHeight = Math.round(fullWidth / 2)
  return {
    fullWidth,
    fullHeight,
    croppedWidth: scene.width,
    croppedHeight: scene.height,
    croppedX: Math.round((fullWidth - scene.width) / 2),
    croppedY: Math.max(0, Math.round((fullHeight - scene.height) / 2)),
  }
}

/** Vertical angle covered by the image, in degrees. */
export function sceneVfov(scene: TourScene): number {
  return (scene.height / scenePanoData(scene).fullHeight) * 180
}

/** Source-image pixel → viewer position, in degrees (yaw 0 = image centre). */
export function pixelToPosition(scene: TourScene, [x, y]: [number, number]) {
  const d = scenePanoData(scene)
  return {
    yaw: ((x + d.croppedX) / d.fullWidth) * 360 - 180,
    pitch: 90 - ((y + d.croppedY) / d.fullHeight) * 180,
  }
}

const deg = (r: number) => (r * 180) / Math.PI
const rad = (d: number) => (d * Math.PI) / 180

/**
 * Widest vertical field of view (degrees) at which a viewport of the given
 * aspect ratio still fits entirely inside the image — so zooming out never
 * reveals the black void around a partial panorama. A small margin covers
 * the slight bowing of the perspective projection near the edges.
 */
export function sceneMaxFov(scene: TourScene, aspect: number): number {
  const margin = 0.94
  const byHeight = sceneVfov(scene) * margin
  const h = Math.min(scene.hfov * margin, 170)
  const byWidth = deg(2 * Math.atan(Math.tan(rad(h / 2)) / aspect))
  return Math.max(20, Math.min(byHeight, byWidth))
}
