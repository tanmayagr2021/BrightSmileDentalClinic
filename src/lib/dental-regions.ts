// Pure utility — safe to import in both Server and Client components.
// Regions are derived from a doctor's existing `specializations` field;
// no schema change required.

export const SPECIALTY_TO_REGIONS: Record<string, string[]> = {
  'General Dentistry':        ['full-arch'],
  'Cosmetic Dentistry':       ['upper-front', 'lower-front'],
  'Teeth Whitening':          ['upper-front', 'lower-front'],
  'Smile Design':             ['upper-front', 'lower-front'],
  'Orthodontics':             ['full-arch', 'orthodontics'],
  'Dental Implants':          ['implants', 'upper-left', 'upper-right', 'lower-left', 'lower-right'],
  'Oral Surgery':             ['surgical'],
  'Wisdom Tooth Removal':     ['surgical'],
  'Periodontics':             ['periodontics', 'full-arch'],
  'Endodontics':              ['upper-front', 'lower-front'],
  'Pedodontics':              ['full-arch'],
  'Pediatric Dentistry':      ['full-arch'],
  'Restorative Dentistry':    ['full-arch'],
  'Prosthodontics':           ['implants', 'upper-left', 'upper-right', 'lower-left', 'lower-right'],
  'Preventive Care':          ['full-arch', 'periodontics'],
  'Oral Medicine':            ['full-arch'],
  'Oral Radiology':           ['full-arch'],
}

export function regionsFromSpecializations(specializations: string[]): string[] {
  const set = new Set<string>()
  for (const s of specializations) {
    const regions = SPECIALTY_TO_REGIONS[s]
    if (regions) regions.forEach((r) => set.add(r))
  }
  if (set.size === 0) set.add('full-arch')
  return [...set]
}
