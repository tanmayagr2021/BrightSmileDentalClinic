// Static tooth-number groupings for the "Choose Your Tooth" region-browsing mode.
// Derived purely from the existing Universal Numbering System layout in
// tooth-layout.ts — no database concept, no schema change. Regions are
// independent discovery lenses and may overlap (Back is a superset of Wisdom).

export type RegionKey = 'front' | 'back' | 'upper' | 'lower' | 'wisdom' | 'gums'

export const REGION_CHIPS: { key: RegionKey; label: string }[] = [
  { key: 'front', label: 'Front Teeth' },
  { key: 'back', label: 'Back Teeth' },
  { key: 'upper', label: 'Upper Jaw' },
  { key: 'lower', label: 'Lower Jaw' },
  { key: 'wisdom', label: 'Wisdom Tooth Area' },
  { key: 'gums', label: 'Gums' },
]

// Incisors + canines, both arches.
const FRONT = new Set([6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27])
// Molar-3 (wisdom), both arches.
const WISDOM = new Set([1, 16, 17, 32])
const UPPER = new Set(Array.from({ length: 16 }, (_, i) => i + 1))
const LOWER = new Set(Array.from({ length: 16 }, (_, i) => i + 17))
// Premolars + molars, both arches — superset that includes WISDOM.
const BACK = new Set(
  Array.from({ length: 32 }, (_, i) => i + 1).filter((n) => !FRONT.has(n))
)

export function regionToothNumbers(region: RegionKey | null): Set<number> {
  switch (region) {
    case 'front':
      return FRONT
    case 'back':
      return BACK
    case 'upper':
      return UPPER
    case 'lower':
      return LOWER
    case 'wisdom':
      return WISDOM
    default:
      // 'gums' and null: not tooth-specific, no highlight
      return new Set()
  }
}
