// Central source of truth for static clinic data.
// Long-term: contact info + hours should be fetched from site_settings table.
// These values are used as fallbacks during SSG and in components.

export const CLINIC_NAME = 'Bright Smile Dental Clinic Pvt. Ltd.'
export const CLINIC_NAME_SHORT = 'Bright Smile'
export const CLINIC_TAGLINE = 'Creating Smiles, Changing Lives'
export const CLINIC_SUBTITLE = 'Dental Clinic Pvt. Ltd.'

export const CLINIC_CONTACT = {
  phone: '+977-1-4XXXXXX',
  phoneWhatsApp: '+977-98XXXXXXXX',
  email: 'info@brightsmiledentalclinic.com.np',
  emailAppointments: 'appointments@brightsmiledentalclinic.com.np',
  address: 'Nagpokhari, Naxal',
  addressFull: 'Nagpokhari, Naxal, Kathmandu, Nepal',
  googleMapsUrl: '',
  facebook: '',
  instagram: '',
}

export const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Our Doctors', href: '/doctors' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export const FOOTER_QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Our Doctors', href: '/doctors' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book Appointment', href: '/appointments' },
] as const

export const OPENING_HOURS = [
  { days: 'Sunday – Friday', hours: '9:00 AM – 6:00 PM', open: true },
  { days: 'Saturday', hours: '9:00 AM – 1:00 PM', open: true },
] as const
