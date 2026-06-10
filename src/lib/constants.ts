// Central source of truth for static clinic data.
// Long-term: contact info + hours should be fetched from site_settings table.
// These values are used as fallbacks during SSG and in components.

export const CLINIC_NAME = 'Bright Smile Dental Clinic Pvt. Ltd.'
export const CLINIC_NAME_SHORT = 'Bright Smile'
export const CLINIC_TAGLINE = 'Creating Smiles, Changing Lives'
export const CLINIC_SUBTITLE = 'Dental Clinic Pvt. Ltd.'

export const CLINIC_CONTACT = {
  phone: '+977-1-4419594',
  phoneWhatsApp: '+977-9851058733',
  email: 'drsachin1108@gmail.com',
  emailAppointments: 'brightsmiledentalclinic1111@gmail.com',
  address: 'Nagpokhari, Naxal',
  addressFull: 'Nagpokhari, Naxal, Kathmandu, Nepal',
  googleMapsUrl: '',
  facebook: 'https://www.facebook.com/brightsmilenepal/',
  instagram: '',
} as const

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

export const HOMEPAGE_STATS = [
  { count: 1000, suffix: '+', label: 'Happy Patients' },
  { count: 10, suffix: '+', label: 'Years of Service' },
  { count: 20, suffix: '+', label: 'Treatments Offered' },
  { count: 6, suffix: '', label: 'Expert Doctors' },
] as const

export const DOCTORS_STATIC = [
  {
    name: 'Dr. Sachin Agrawal',
    qualification: 'BDS',
    nmc: 'NMC 3216',
    role: 'General & Dental Surgeon',
    initials: 'SA',
    bg: '#1A3D2B',
    bookable: true,  // Available for appointment booking
  },
  {
    name: 'Dr. Ameena Pradhan',
    qualification: 'MDS',
    nmc: 'NMC 3013',
    role: 'Periodontist',
    initials: 'AP',
    bg: '#3d8560',
    bookable: false, // Specialist / consultant only
  },
  {
    name: 'Dr. Binita Adhikari',
    qualification: 'BDS',
    nmc: 'NMC 2687',
    role: 'General & Dental Surgeon',
    initials: 'BA',
    bg: '#4A9B6F',
    bookable: true,  // Available for appointment booking
  },
  {
    name: 'Dr. Sabin Giri',
    qualification: 'BDS',
    nmc: 'NMC 3914',
    role: 'Extractions & Dental Surgery',
    initials: 'SG',
    bg: '#1A3D2B',
    bookable: false,
  },
  {
    name: 'Dr. Shashi Bhushan Singh',
    qualification: 'BDS',
    nmc: 'NMC 3449',
    role: 'Dental Implants',
    initials: 'SS',
    bg: '#3d8560',
    bookable: false,
  },
  {
    name: 'Dr. Rinky Nyachhyon',
    qualification: 'BDS',
    nmc: 'NMC 3201',
    role: 'Oral Medicine & Radiology',
    initials: 'RN',
    bg: '#4A9B6F',
    bookable: false,
  },
] as const

export const SERVICE_CATEGORIES_STATIC = [
  {
    slug: 'general-dentistry',
    name: 'General Dentistry',
    description: 'Routine checkups, cleanings, fillings, and preventive care to keep your smile healthy for life.',
  },
  {
    slug: 'cosmetic-dentistry',
    name: 'Cosmetic Dentistry',
    description: 'Teeth whitening, veneers, bonding, and complete smile makeovers for the confidence you deserve.',
  },
  {
    slug: 'orthodontics',
    name: 'Orthodontics',
    description: 'Modern braces and clear aligners to straighten teeth and correct bite issues at any age.',
  },
  {
    slug: 'oral-surgery',
    name: 'Oral Surgery',
    description: 'Expert extractions, wisdom teeth removal, and surgical care performed with precision and compassion.',
  },
  {
    slug: 'dental-implants',
    name: 'Dental Implants',
    description: 'Permanent, natural-looking tooth replacements that restore your bite, appearance, and confidence.',
  },
  {
    slug: 'pediatric-dentistry',
    name: 'Pediatric Dentistry',
    description: 'Gentle, child-friendly dental care designed to build healthy habits and positive associations.',
  },
] as const

export const FAQS_STATIC = [
  {
    q: 'How often should I visit the dentist?',
    a: 'We recommend a visit every 6 months for routine checkups and professional cleanings. Patients with specific conditions such as gum disease or a history of cavities may benefit from more frequent appointments.',
  },
  {
    q: 'Do you accept walk-in patients?',
    a: 'We work primarily by appointment to minimise waiting times and ensure each patient receives full attention. For dental emergencies, call us directly — we will do our best to accommodate you the same day.',
  },
  {
    q: 'Is teeth whitening safe?',
    a: 'Yes. Professional whitening supervised by our dentists uses clinically tested products that are safe for your enamel. We assess your suitability during a consultation to ensure the best results.',
  },
  {
    q: 'At what age should my child first see a dentist?',
    a: 'We recommend the first visit by your child\'s first birthday, or within 6 months of the first tooth appearing. Early visits help establish healthy habits and detect any issues while they are easy to treat.',
  },
  {
    q: 'How much do treatments cost?',
    a: 'Costs vary by treatment. We provide a clear, detailed estimate before starting any procedure. Contact us or book a consultation — we are happy to discuss your needs and available options.',
  },
  {
    q: 'What should I do in a dental emergency?',
    a: 'Call us immediately at +977-1-4419594. For knocked-out teeth, keep the tooth moist (in milk or between your cheek and gum) and come to us as quickly as possible. Prompt action significantly improves outcomes.',
  },
] as const

export const TESTIMONIALS_STATIC = [
  {
    name: 'Priya Sharma',
    location: 'Kathmandu',
    text: 'Exceptional care from the entire team. The doctors explained every step and made sure I was comfortable throughout. My smile has genuinely transformed!',
    rating: 5,
  },
  {
    name: 'Rajesh Thapa',
    location: 'Lalitpur',
    text: 'I had not visited a dentist in years and was quite nervous. The team was incredibly patient and professional — I left feeling relieved and well cared for.',
    rating: 5,
  },
  {
    name: 'Sushila Maharjan',
    location: 'Bhaktapur',
    text: 'The pediatric dentist is wonderful with children. My kids actually look forward to their appointments now. Clean, modern clinic with a warm, welcoming atmosphere.',
    rating: 5,
  },
] as const
