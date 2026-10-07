// The clinic walkthrough — single source of truth for every scene, link and
// starting view in the Virtual Tour. Add/remove scenes here only.
//
// Every scene is one of the photographer's panoramas in ASSETS/New/Pana
// (`source` is the exact original filename), converted to WebP by
// scripts/build-virtual-tour-assets.mjs. None of them is a full 360°×180°
// photo sphere: they are partial panoramas, so each declares the horizontal
// angle it covers (`hfov`) and the viewer locks panning to that arc.
//
// All positions are in the image's own pixel coordinates ([x, y], measured on
// the source file), read directly off the photo — e.g. the marble door in the
// lounge, the chair in a treatment room — so they stay tied to something
// visible rather than to an abstract yaw/pitch.
//
// `hfov` values are visual estimates (the files carry no lens/stitching
// metadata). Raise one if that scene looks horizontally squashed, lower it if
// it looks stretched — hotspots stay pinned to the same objects either way.

export type TourSceneId =
  | 'entrance-reception'
  | 'waiting-area'
  | 'treatment-room-1'
  | 'treatment-room-2'
  | 'treatment-room-3'

export type TourHotspot = {
  target: TourSceneId
  label: string
  /** [x, y] in source-image pixels */
  at: [number, number]
}

export type TourScene = {
  id: TourSceneId
  name: string
  /** Original file in ASSETS/New/Pana, verbatim */
  source: string
  src: string
  thumb: string
  width: number
  height: number
  /** Horizontal angle covered by the image, in degrees (estimated) */
  hfov: number
  /** Where the camera faces on arrival, [x, y] in source-image pixels */
  initialView: [number, number]
  hotspots: TourHotspot[]
}

export const TOUR_START: TourSceneId = 'entrance-reception'

export const TOUR_SCENES: TourScene[] = [
  {
    id: 'entrance-reception',
    name: 'Entrance & Reception',
    source: 'entrance reception .png',
    src: '/virtual-tour/entrance-reception.webp',
    thumb: '/virtual-tour/entrance-reception-thumb.webp',
    width: 1920,
    height: 819,
    hfov: 180,
    // Looking down the lounge at the clinic sign and the front desk.
    initialView: [760, 400],
    hotspots: [
      // Open floor between the two rugs, heading into the lounge.
      { target: 'waiting-area', label: 'Waiting lounge', at: [780, 640] },
      // The marble door beside the poster wall — same marble door with the
      // long bar handle seen from inside Treatment Room 1.
      { target: 'treatment-room-1', label: 'Treatment Room 1', at: [650, 430] },
      // The corridor between the two glass doors past the front desk. Which
      // glass door opens onto which room isn't visible in any photo, so both
      // links sit in the corridor rather than on a specific door.
      { target: 'treatment-room-2', label: 'Treatment Room 2', at: [958, 395] },
      { target: 'treatment-room-3', label: 'Treatment Room 3', at: [958, 470] },
    ],
  },
  {
    id: 'waiting-area',
    name: 'Waiting Lounge',
    source: '+waiting area .png',
    src: '/virtual-tour/waiting-area.webp',
    thumb: '/virtual-tour/waiting-area-thumb.webp',
    width: 2171,
    height: 724,
    hfov: 180,
    // The clinic sign and patient-information wall, front desk to the right.
    initialView: [1000, 330],
    hotspots: [
      // Floor in front of the reception desk.
      { target: 'entrance-reception', label: 'Reception', at: [1200, 560] },
      { target: 'treatment-room-1', label: 'Treatment Room 1', at: [875, 420] },
      // Between the two glass doors (see note on the entrance scene).
      { target: 'treatment-room-2', label: 'Treatment Room 2', at: [1398, 330] },
      { target: 'treatment-room-3', label: 'Treatment Room 3', at: [1398, 400] },
    ],
  },
  {
    id: 'treatment-room-1',
    name: 'Treatment Room 1',
    source: 'chair 1.png',
    src: '/virtual-tour/treatment-room-1.webp',
    thumb: '/virtual-tour/treatment-room-1-thumb.webp',
    width: 1536,
    height: 1024,
    hfov: 100,
    initialView: [950, 560],
    hotspots: [
      // The marble door back to the lounge.
      { target: 'waiting-area', label: 'Back to the lounge', at: [1272, 470] },
    ],
  },
  {
    id: 'treatment-room-2',
    name: 'Treatment Room 2',
    source: 'chair 2.png',
    src: '/virtual-tour/treatment-room-2.webp',
    thumb: '/virtual-tour/treatment-room-2-thumb.webp',
    width: 1672,
    height: 941,
    hfov: 130,
    initialView: [850, 480],
    hotspots: [
      // The room's exit is behind the camera and not in the photo, so the
      // way back sits on the floor in the foreground.
      { target: 'waiting-area', label: 'Back to the lounge', at: [836, 840] },
    ],
  },
  {
    id: 'treatment-room-3',
    name: 'Treatment Room 3',
    source: 'cair 3.png',
    src: '/virtual-tour/treatment-room-3.webp',
    thumb: '/virtual-tour/treatment-room-3-thumb.webp',
    width: 1774,
    height: 887,
    hfov: 150,
    initialView: [900, 520],
    hotspots: [
      // Photographed from the doorway itself (marble frame at both edges);
      // the way back is behind the camera, so it sits in the foreground.
      { target: 'waiting-area', label: 'Back to the lounge', at: [1300, 800] },
    ],
  },
]

export function getTourScene(id: string): TourScene | undefined {
  return TOUR_SCENES.find((s) => s.id === id)
}
