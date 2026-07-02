import { CLINIC_NAME, CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function canonicalFor(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

// "Sunday – Friday" → ['Sunday', ..., 'Friday']; "Saturday" → ['Saturday']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function parseDayRange(days: string): string[] {
  const parts = days.split(/[–—-]/).map((s) => s.trim())
  if (parts.length === 1) return parts
  const start = WEEKDAYS.indexOf(parts[0])
  const end = WEEKDAYS.indexOf(parts[1])
  if (start === -1 || end === -1) return parts
  const out: string[] = []
  for (let i = start; i <= end; i++) out.push(WEEKDAYS[i])
  return out
}

// "9:00 AM – 6:00 PM" → { opens: '09:00', closes: '18:00' }
function parseHourRange(hours: string): { opens: string; closes: string } | null {
  const match = hours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–—-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null
  const to24 = (h: string, m: string, ap: string) => {
    let hour = parseInt(h, 10) % 12
    if (ap.toUpperCase() === 'PM') hour += 12
    return `${String(hour).padStart(2, '0')}:${m}`
  }
  return {
    opens: to24(match[1], match[2], match[3]),
    closes: to24(match[4], match[5], match[6]),
  }
}

// Dentist/MedicalBusiness JSON-LD for the clinic as a whole — sitewide, root layout.
export function buildClinicSchema() {
  const openingHoursSpecification = OPENING_HOURS.flatMap((slot) => {
    if (!slot.open) return []
    const range = parseHourRange(slot.hours)
    if (!range) return []
    return [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: parseDayRange(slot.days),
      opens: range.opens,
      closes: range.closes,
    }]
  })

  return {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'MedicalBusiness'],
    name: CLINIC_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/images/logo.jpg`,
    telephone: CLINIC_CONTACT.phone,
    email: CLINIC_CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC_CONTACT.address,
      addressLocality: 'Kathmandu',
      addressCountry: 'NP',
    },
    sameAs: [CLINIC_CONTACT.facebook].filter(Boolean),
    openingHoursSpecification,
  }
}

// Physician JSON-LD for an individual doctor's profile page.
export function buildPhysicianSchema(doctor: {
  full_name: string
  title?: string | null
  slug: string
  profile_image_url?: string | null
  qualification?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.full_name,
    jobTitle: doctor.title ?? undefined,
    image: doctor.profile_image_url ?? undefined,
    url: canonicalFor(`/doctors/${doctor.slug}`),
    medicalSpecialty: 'Dentistry',
    ...(doctor.qualification ? { hasCredential: doctor.qualification } : {}),
    worksFor: {
      '@type': 'Dentist',
      name: CLINIC_NAME,
      url: SITE_URL,
    },
  }
}

export function buildCanonical(path: string) {
  return canonicalFor(path)
}
