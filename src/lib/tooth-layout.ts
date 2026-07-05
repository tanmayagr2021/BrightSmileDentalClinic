// Static geometry for the 32-tooth dental chart, computed once from the
// Universal Numbering System order (1-32). Purely positional — no CMS
// content flows through this file, matching the "SVG remains static" brief.
// Layout mirrors a real dental chart: patient's right sits on the viewer's
// left (you are facing the patient), teeth 1-16 form the upper arch left to
// right, teeth 17-32 form the lower arch — but because the anatomical
// numbering continues clockwise around the mouth, the lower arch reads
// right to left on screen (32 leftmost … 17 rightmost).

export type ToothKind = 'incisor-central' | 'incisor-lateral' | 'canine' | 'premolar-1' | 'premolar-2' | 'molar-1' | 'molar-2' | 'molar-3'

const KIND_BY_ARCH_INDEX: ToothKind[] = [
  'molar-3', 'molar-2', 'molar-1', 'premolar-2', 'premolar-1', 'canine', 'incisor-lateral', 'incisor-central',
  'incisor-central', 'incisor-lateral', 'canine', 'premolar-1', 'premolar-2', 'molar-1', 'molar-2', 'molar-3',
]

const KIND_WIDTH: Record<ToothKind, number> = {
  'incisor-central': 26,
  'incisor-lateral': 24,
  canine: 27,
  'premolar-1': 29,
  'premolar-2': 30,
  'molar-1': 36,
  'molar-2': 37,
  'molar-3': 34,
}

const KIND_HEIGHT: Record<ToothKind, number> = {
  'incisor-central': 38,
  'incisor-lateral': 36,
  canine: 40,
  'premolar-1': 36,
  'premolar-2': 36,
  'molar-1': 34,
  'molar-2': 34,
  'molar-3': 32,
}

export const CENTER_X = 300
const ARCH_RX = 235
// ARCH_RY and the two center-Ys are chosen so upper and lower arches never
// cross: at every arch index, cy_upper = UPPER_CENTER_Y + ARCH_RY*cos(angle)
// tops out at UPPER_CENTER_Y + ARCH_RY (angle=0, front teeth, cos=1), which
// must stay below cy_lower's minimum, LOWER_CENTER_Y - ARCH_RY. With the
// values below that's 228 vs 272 — a fixed 44px clearance at every index,
// since cos(angle) is even and multiplies both arches identically.
const ARCH_RY = 78
const UPPER_CENTER_Y = 150
const LOWER_CENTER_Y = 350
const ANGLE_SPAN = 102 // degrees, -ANGLE_SPAN..+ANGLE_SPAN across the 16-tooth arch

export type ToothLayout = {
  toothNumber: number
  kind: ToothKind
  cx: number
  cy: number
  angleDeg: number // rotation so the tooth "points" away from the arch centerline
  width: number
  height: number
  arch: 'upper' | 'lower'
}

// Node's and the browser's Math.cos can differ in the last bit (different
// libm builds behind the same V8), which leaks into the server-rendered SVG
// transform string and trips a hydration mismatch. Round to kill the ULP
// noise — 1e-4 is far below anything visually perceptible here.
const round = (n: number) => Math.round(n * 10_000) / 10_000

// Minimum clear px between adjacent tooth edges along the arch. Deliberately
// generous: teeth are rotated up to ~102°, so an unrotated half-width gap
// alone isn't enough margin against a neighbor's rotated corner.
const TOOTH_GAP = 7

// Equal-angle spacing (t = index/15) badly compresses cx near the arch ends —
// dx/dangle = ARCH_RX*cos(angle) shrinks toward 0 as angle approaches ±90°,
// so index-based spacing let the two outermost molars' rendered shapes
// overlap by more than half their own size. Fix: derive each tooth's
// position from cumulative tooth width instead of index, so horizontal
// spacing is guaranteed by construction, not by the arc's local curvature.
function buildArch(arch: 'upper' | 'lower'): ToothLayout[] {
  const centerY = arch === 'upper' ? UPPER_CENTER_Y : LOWER_CENTER_Y
  const sign = arch === 'upper' ? 1 : -1

  const widths = KIND_BY_ARCH_INDEX.map((k) => KIND_WIDTH[k])
  const totalSpan = widths.reduce((sum, w) => sum + w, 0) + TOOTH_GAP * (widths.length - 1)

  let cursor = 0
  const centerOffsets = widths.map((w) => {
    const center = cursor + w / 2
    cursor += w + TOOTH_GAP
    return center
  })

  return Array.from({ length: 16 }, (_, screenIndex) => {
    const toothNumber = arch === 'upper' ? screenIndex + 1 : 32 - screenIndex
    const kind = KIND_BY_ARCH_INDEX[screenIndex]

    // -1..1 across the arch, 0 = the two central incisors' shared boundary.
    const t = (centerOffsets[screenIndex] - totalSpan / 2) / (totalSpan / 2)
    const cx = CENTER_X + t * ARCH_RX
    const angleDeg = t * ANGLE_SPAN
    const rad = (angleDeg * Math.PI) / 180
    const cy = centerY + sign * ARCH_RY * Math.cos(rad)

    return {
      toothNumber,
      kind,
      cx,
      cy: round(cy),
      angleDeg: arch === 'upper' ? angleDeg : -angleDeg,
      width: KIND_WIDTH[kind],
      height: KIND_HEIGHT[kind],
      arch,
    }
  })
}

export const TOOTH_LAYOUT: ToothLayout[] = [...buildArch('upper'), ...buildArch('lower')].sort(
  (a, b) => a.toothNumber - b.toothNumber
)

export const VIEWBOX = '0 0 600 480'
