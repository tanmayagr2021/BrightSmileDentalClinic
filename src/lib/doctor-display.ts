import type { DoctorRow } from '@/types/db'

export function doctorColor(d: Pick<DoctorRow, 'color_hex'>) {
  return d.color_hex ?? '#D4A56A'
}

export function doctorInitials(d: Pick<DoctorRow, 'initials' | 'full_name'>) {
  return d.initials ?? d.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2)
}
