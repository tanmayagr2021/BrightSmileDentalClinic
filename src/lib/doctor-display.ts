import type { DoctorRow } from '@/types/db'

const channel = (c: number) => {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/**
 * Doctor and staff colours sit behind white initials and labels. Colours
 * picked in the admin (or the brand golds/greens) are often too light for
 * that, so darken in small steps until white text clears 4.5:1. Colours that
 * already pass come back unchanged.
 */
export function readableOnWhiteText(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
  for (let step = 0; step < 40; step++) {
    const lum = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    if (1.05 / (lum + 0.05) >= 4.5) break
    ;[r, g, b] = [r, g, b].map((c) => Math.round(c * 0.94))
  }
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

export function doctorColor(d: Pick<DoctorRow, 'color_hex'>) {
  return readableOnWhiteText(d.color_hex ?? '#9A6C36')
}

export function doctorInitials(d: Pick<DoctorRow, 'initials' | 'full_name'>) {
  return d.initials ?? d.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2)
}
