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
const ARCH_RY = 128
const UPPER_CENTER_Y = 178
const LOWER_CENTER_Y = 322
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

function archIndexToAngle(index: number) {
  const t = index / 15 // 0..1
  return -ANGLE_SPAN + t * (2 * ANGLE_SPAN)
}

// Node's and the browser's Math.sin/cos can differ in the last bit (different
// libm builds behind the same V8), which leaks into the server-rendered SVG
// transform string and trips a hydration mismatch. Round to kill the ULP
// noise — 1e-4 is far below anything visually perceptible here.
const round = (n: number) => Math.round(n * 10_000) / 10_000

function buildArch(arch: 'upper' | 'lower'): ToothLayout[] {
  const centerY = arch === 'upper' ? UPPER_CENTER_Y : LOWER_CENTER_Y
  const sign = arch === 'upper' ? 1 : -1

  return Array.from({ length: 16 }, (_, screenIndex) => {
    const toothNumber = arch === 'upper' ? screenIndex + 1 : 32 - screenIndex
    const kind = KIND_BY_ARCH_INDEX[screenIndex]
    const angleDeg = archIndexToAngle(screenIndex)
    const rad = (angleDeg * Math.PI) / 180
    const cx = CENTER_X + ARCH_RX * Math.sin(rad)
    const cy = centerY + sign * ARCH_RY * Math.cos(rad)

    return {
      toothNumber,
      kind,
      cx: round(cx),
      cy: round(cy),
      angleDeg: round(arch === 'upper' ? angleDeg : -angleDeg),
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
