// Rule-based intent engine: zero API cost, all responses grounded in clinic data.
// Runs server-side only; no external network calls.

import {
  CLINIC_CONTACT,
  OPENING_HOURS,
  DOCTORS_STATIC,
  SERVICE_CATEGORIES_STATIC,
  FAQS_STATIC,
} from '@/lib/constants'

export type BotResponse = {
  text: string
  navigateTo?: string
  quickReplies?: string[]
  isMedicalHistoryTrigger?: boolean
}

// ── Helpers ────────────────────────────────────────────────────

function lc(s: string) { return s.toLowerCase() }

function has(msg: string, ...terms: string[]): boolean {
  const m = lc(msg)
  return terms.some((t) => m.includes(lc(t)))
}

// Word-boundary version, for short, collision-prone terms like "hi" that
// plain substring matching would falsely trigger on (e.g. "hi" inside
// "Shashi" was swallowing every question about Dr. Shashi into the
// greeting intent, since the greeting check runs before the doctor checks).
function hasWord(msg: string, ...terms: string[]): boolean {
  const m = lc(msg)
  return terms.some((t) => new RegExp(`\\b${lc(t)}\\b`).test(m))
}

// ── Intent resolution ──────────────────────────────────────────

type Intent =
  | 'greeting'
  | 'book'
  | 'hours'
  | 'location'
  | 'contact'
  | 'pricing'
  | 'emergency'
  | 'medical_history'
  | 'anxiety'
  | 'service_general'
  | 'service_cosmetic'
  | 'service_orthodontics'
  | 'service_surgery'
  | 'service_implants'
  | 'service_pediatric'
  | 'services_all'
  | 'doctors_all'
  | 'doctor_sachin'
  | 'doctor_binita'
  | 'doctor_sabin'
  | 'doctor_shashi'
  | 'doctor_rinky'
  | 'doctor_ranjita'
  | 'doctor_isfa'
  | 'doctor_dikshya'
  | 'doctor_barun'
  | 'whitening'
  | 'root_canal'
  | 'braces'
  | 'extraction'
  | 'xray'
  | 'cleaning'
  | 'about'
  | 'gallery'
  | 'testimonials'
  | 'faq'
  | 'thank'
  | 'bye'
  | 'unknown'

function detectIntent(msg: string): Intent {
  // Greeting: 'hi'/'hey' use word-boundary matching since they're short
  // enough to false-positive inside unrelated words (e.g. "Shashi").
  if (
    has(msg, 'hello', 'namaste', 'good morning', 'good afternoon', 'good evening', 'howdy', 'hiya') ||
    hasWord(msg, 'hi', 'hey')
  )
    return 'greeting'

  // Thank you / bye
  if (has(msg, 'thank', 'thanks', 'thank you', 'appreciate', 'helpful')) return 'thank'
  if (has(msg, 'bye', 'goodbye', 'see you', 'take care', 'later')) return 'bye'

  // Emergency
  if (has(msg, 'emergency', 'urgent', 'severe pain', 'knocked out', 'swelling', 'bleeding', 'accident', 'broken tooth', 'chipped tooth', 'abscess'))
    return 'emergency'

  // Medical history
  if (has(msg, 'medical history', 'health form', 'medical form', 'health information', 'fill in', 'fill out', 'pre-appointment', 'before my visit'))
    return 'medical_history'

  // Dental anxiety
  if (has(msg, 'anxious', 'anxiety', 'scared', 'nervous', 'afraid', 'fear', 'phobia', 'dental fear', 'terrified'))
    return 'anxiety'

  // Pricing / costs
  if (has(msg, 'price', 'cost', 'how much', 'fee', 'charge', 'expensive', 'afford', 'payment', 'insurance'))
    return 'pricing'

  // Specific doctors: checked before generic service keywords, since a
  // doctor mention should win even when their name/specialty overlaps with
  // a generic term (e.g. "gum specialist" contains "gum", which would
  // otherwise match the general-dentistry service check first).
  if (has(msg, 'sachin', 'dr sachin', 'dr. sachin', 'agrawal')) return 'doctor_sachin'
  if (has(msg, 'binita', 'dr binita', 'dr. binita', 'adhikari')) return 'doctor_binita'
  if (has(msg, 'sabin', 'dr sabin', 'dr. sabin', 'giri')) return 'doctor_sabin'
  if (has(msg, 'shashi', 'dr shashi', 'dr. shashi', 'singh', 'implantologist')) return 'doctor_shashi'
  if (has(msg, 'rinky', 'dr rinky', 'dr. rinky', 'nyachhyon', 'radiolog', 'oral medicine')) return 'doctor_rinky'
  if (has(msg, 'ranjita', 'dr ranjita', 'dr. ranjita', 'shrestha', 'gorkhali', 'periodont', 'gum specialist')) return 'doctor_ranjita'
  if (has(msg, 'isfa', 'dr isfa', 'dr. isfa', 'haque', 'maxillofacial', 'oral surgeon', 'oral and maxillofacial')) return 'doctor_isfa'
  if (has(msg, 'dikshya', 'dr dikshya', 'dr. dikshya', 'bhusal')) return 'doctor_dikshya'
  if (has(msg, 'barun', 'dr barun', 'dr. barun', 'kumar sah')) return 'doctor_barun'

  // Specific services first (more specific before general)
  if (has(msg, 'whiten', 'whitening', 'bleach')) return 'whitening'
  if (has(msg, 'root canal', 'rct', 'nerve')) return 'root_canal'
  if (has(msg, 'brace', 'braces', 'aligner', 'aligners', 'orthodont', 'straighten', 'crooked', 'clear aligner', 'retainer'))
    return 'braces'
  if (has(msg, 'extract', 'extraction', 'wisdom tooth', 'wisdom teeth', 'pull out', 'remove tooth', 'surgical removal'))
    return 'extraction'
  if (has(msg, 'implant', 'implants', 'missing tooth', 'missing teeth', 'titanium', 'all on 4', 'all on 6'))
    return 'service_implants'
  if (has(msg, 'child', 'children', 'kid', 'kids', 'pediatric', 'paediatric', 'toddler', 'baby teeth', 'first visit'))
    return 'service_pediatric'
  if (has(msg, 'cosmetic', 'veneer', 'bonding', 'smile makeover', 'smile design', 'aesthetic'))
    return 'service_cosmetic'
  if (has(msg, 'surgery', 'oral surgery', 'surgical', 'biopsy', 'frenectomy', 'cyst'))
    return 'service_surgery'
  if (has(msg, 'general dentistry', 'routine', 'check-up', 'checkup', 'check up', 'filling', 'cavity', 'gum', 'scaling'))
    return 'service_general'
  if (has(msg, 'x-ray', 'xray', 'x ray', 'digital imaging', 'radiology', 'scan'))
    return 'xray'
  if (has(msg, 'clean', 'cleaning', 'scale', 'scaling', 'polish', 'plaque', 'tartar'))
    return 'cleaning'

  // Services overview
  if (has(msg, 'service', 'services', 'treatment', 'treatments', 'what do you offer', 'what can you do', 'offer', 'speciality', 'specialties'))
    return 'services_all'

  // Doctors overview
  if (has(msg, 'doctor', 'doctors', 'dentist', 'dentists', 'specialist', 'specialists', 'staff', 'team', 'who', 'surgeon', 'meet'))
    return 'doctors_all'

  // Booking
  if (has(msg, 'book', 'appointment', 'schedule', 'reserve', 'slot', 'available', 'availability', 'visit', 'come in', 'consultation', 'consult'))
    return 'book'

  // Hours
  if (has(msg, 'hour', 'hours', 'open', 'closed', 'when', 'timing', 'time', 'sunday', 'saturday', 'monday', 'weekend', 'weekday'))
    return 'hours'

  // Location
  if (has(msg, 'where', 'address', 'location', 'find you', 'directions', 'naxal', 'nagpokhari', 'kathmandu', 'map', 'navigate', 'how to get'))
    return 'location'

  // Contact
  if (has(msg, 'contact', 'call', 'phone', 'number', 'email', 'whatsapp', 'reach', 'message', 'facebook', 'social'))
    return 'contact'

  // Gallery / clinic
  if (has(msg, 'gallery', 'photos', 'pictures', 'clinic look', 'see the clinic', 'what does', 'equipment', 'facility', 'facilities'))
    return 'gallery'

  // About / story
  if (has(msg, 'about', 'story', 'history', 'founded', 'established', 'when did', 'background', 'mission', 'vision', 'values'))
    return 'about'

  // Testimonials / reviews
  if (has(msg, 'review', 'reviews', 'testimonial', 'testimonials', 'patient feedback', 'rating', 'feedback', 'experience'))
    return 'testimonials'

  // FAQ
  if (has(msg, 'faq', 'frequently asked', 'common question', 'walk in', 'walk-in'))
    return 'faq'

  return 'unknown'
}

// ── Response builders ──────────────────────────────────────────

const SERVICES_REPLIES = ['General Dentistry', 'Cosmetic Dentistry', 'Book an appointment']

function buildResponse(intent: Intent): BotResponse {
  const doctors = DOCTORS_STATIC.filter((d) => d.visible)
  const bookable = doctors.filter((d) => d.bookable)
  const hours = OPENING_HOURS.map((h) => `${h.days}: ${h.hours}`).join(' · ')

  switch (intent) {
    case 'greeting':
      return {
        text: "Hello! Welcome to Bright Smile Dental Clinic. I'm here to help you find the right care, explore our services, or book an appointment. What can I help you with today?",
        quickReplies: ['Book an appointment', 'Our services', 'Meet our doctors', 'Clinic hours'],
      }

    case 'thank':
      return {
        text: "You're very welcome! Don't hesitate to reach out if you have any more questions. We look forward to seeing you at the clinic.",
        quickReplies: ['Book an appointment', 'Contact us', 'Our services'],
      }

    case 'bye':
      return {
        text: 'Take care! We look forward to welcoming you at Bright Smile Dental Clinic. Feel free to chat anytime.',
        quickReplies: ['Book an appointment', 'Contact us'],
      }

    case 'emergency':
      return {
        text: `For a dental emergency, please call us immediately at **${CLINIC_CONTACT.phone}** or WhatsApp **${CLINIC_CONTACT.phoneWhatsApp}**. We do our best to see emergency patients the same day. If you have a knocked-out tooth, keep it moist (in milk or saliva) and come in as quickly as possible.`,
        quickReplies: ['Call now', 'WhatsApp us', 'Our location'],
      }

    case 'medical_history':
      return {
        text: "You can fill in a secure medical history form right here, it only takes 2-3 minutes and helps our team prepare for your visit. Shall I open the form for you?",
        isMedicalHistoryTrigger: true,
        quickReplies: ['Yes, open the form', 'Book an appointment', 'Contact us'],
      }

    case 'anxiety':
      return {
        text: "Dental anxiety is very common, and our team is highly experienced in helping nervous patients feel at ease. Please let us know when you book so we can take extra time, explain each step clearly, and go at your pace. You're in gentle hands here.",
        navigateTo: '/appointments',
        quickReplies: ['Book an appointment', 'Meet our doctors', 'Contact us'],
      }

    case 'pricing': {
      return {
        text: "We don't publish prices publicly because every treatment is tailored to the individual. We always give you a clear, detailed estimate before anything begins. No surprises, no hidden costs, ever. Call us at **" + CLINIC_CONTACT.phone + "** or book a consultation to discuss your needs.",
        navigateTo: '/appointments',
        quickReplies: ['Book a consultation', 'Our services', 'Contact us'],
      }
    }

    case 'book':
      return {
        text: `You can book an appointment online or call us at **${CLINIC_CONTACT.phone}**. Our bookable doctors are: ${bookable.map((d) => d.shortName).join(', ')}. Appointments start as pending and our team will confirm the same day.`,
        navigateTo: '/appointments',
        quickReplies: ['Book online now', 'Call us', 'Meet our doctors'],
      }

    case 'hours':
      return {
        text: `Our clinic is open **${hours}**. We're closed on public holidays, please call ahead to confirm on those days. Walk-ins are welcome but an appointment ensures you're seen promptly.`,
        quickReplies: ['Book an appointment', 'Our location', 'Contact us'],
      }

    case 'location':
      return {
        text: `We're located at **Nagpokhari, Naxal, Kathmandu**, a central, easily accessible area. You can open directions in Google Maps by clicking below, or call us at **${CLINIC_CONTACT.phone}** for specific guidance.`,
        navigateTo: '/contact',
        quickReplies: ['Get directions', 'Call us', 'Our hours'],
      }

    case 'contact':
      return {
        text: `You can reach us by phone at **${CLINIC_CONTACT.phone}**, WhatsApp at **${CLINIC_CONTACT.phoneWhatsApp}**, or email at **${CLINIC_CONTACT.email}**. We're also on Facebook (Bright Smile Nepal) and Instagram (@brightsmiles_np). Our team typically responds within a few hours during clinic hours.`,
        navigateTo: '/contact',
        quickReplies: ['Clinic hours', 'Our location', 'Book an appointment'],
      }

    case 'services_all': {
      const names = SERVICE_CATEGORIES_STATIC.filter((s) => s.visible).map((s) => s.name).join(', ')
      return {
        text: `We offer a full range of dental care including: **${names}**. Each service is delivered by our experienced team, covering all areas of dentistry, with the latest equipment. Which area would you like to know more about?`,
        navigateTo: '/services',
        quickReplies: ['General Dentistry', 'Cosmetic Dentistry', 'Dental Implants', 'Orthodontics'],
      }
    }

    case 'service_general': {
      const svc = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === 'general-dentistry')!
      return {
        text: `Our **General Dentistry** services cover the full spectrum of everyday dental care: ${svc.subServices.slice(0, 4).map((s) => s.name).join(', ')}, and more. We take a gentle, thorough approach for patients of all ages.`,
        navigateTo: '/services/general-dentistry',
        quickReplies: [...SERVICES_REPLIES],
      }
    }

    case 'service_cosmetic': {
      const svc = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === 'cosmetic-dentistry')!
      return {
        text: `Our **Cosmetic Dentistry** services include ${svc.subServices.map((s) => s.name).join(', ')}. We can design anything from a simple whitening to a full smile makeover, always natural-looking and tailored to you.`,
        navigateTo: '/services/cosmetic-dentistry',
        quickReplies: ['Teeth Whitening', 'Dental Veneers', 'Book a consultation'],
      }
    }

    case 'service_orthodontics': {
      return {
        text: `Our **Orthodontics** services include metal braces, ceramic braces, clear aligners, and retainers, for patients of all ages. Treatment typically takes 12–24 months depending on complexity. Book a consultation for a personalised plan.`,
        navigateTo: '/services/orthodontics',
        quickReplies: ['Clear Aligners', 'Metal Braces', 'Book a consultation'],
      }
    }

    case 'braces':
      return {
        text: `We offer **metal braces, ceramic braces, and clear aligners** (virtually invisible, removable). Clear aligners work well for mild to moderate cases; complex cases may benefit more from braces. A consultation will determine which is right for you. Treatment typically takes 12–24 months.`,
        navigateTo: '/services/orthodontics',
        quickReplies: ['Book a consultation', 'Orthodontics overview', 'Pricing info'],
      }

    case 'service_surgery': {
      return {
        text: `Our **Oral Surgery** services, performed by Dr. Isfa Banu Haque, our oral and maxillofacial surgeon, include wisdom tooth removal, complex extractions, minor surgical procedures, frenectomies, and cyst removal. All procedures are done under local anaesthetic with comprehensive aftercare support.`,
        navigateTo: '/services/oral-surgery',
        quickReplies: ['Wisdom tooth removal', 'Book an appointment', 'Meet Dr. Isfa'],
      }
    }

    case 'service_implants': {
      return {
        text: `**Dental Implants** are permanent, natural-looking tooth replacements and the gold standard in modern dentistry. We offer single implants, multiple implants, implant-supported bridges, and All-on-4/All-on-6 full-arch solutions. Dr. Shashi Bhushan Singh is our resident implant specialist.`,
        navigateTo: '/services/dental-implants',
        quickReplies: ['Single implant', 'All-on-4', 'Meet Dr. Shashi', 'Book a consultation'],
      }
    }

    case 'service_pediatric': {
      return {
        text: `We love treating children at Bright Smile! Our **Pediatric Dentistry** team uses a patient, gentle tell-show-do approach to make every visit positive. We recommend the first visit by your child\'s first birthday, or within 6 months of the first tooth appearing.`,
        navigateTo: '/services/pediatric-dentistry',
        quickReplies: ["Children's fillings", 'Fluoride treatment', 'Book an appointment'],
      }
    }

    case 'whitening':
      return {
        text: `Our **Professional Teeth Whitening** is clinically supervised for safe, noticeably brighter results, far superior to over-the-counter products. We assess suitability during a consultation to ensure the best outcome for your enamel and shade goals.`,
        navigateTo: '/services/cosmetic-dentistry',
        quickReplies: ['Book a consultation', 'Cosmetic Dentistry', 'Pricing info'],
      }

    case 'root_canal':
      return {
        text: `**Root Canal Treatment (RCT)** at Bright Smile is performed with precision and care. Most patients are surprised at how comfortable the procedure is under local anaesthetic. It relieves pain, clears infection, and saves your natural tooth. Recovery is typically straightforward.`,
        navigateTo: '/services/general-dentistry',
        quickReplies: ['Book an appointment', 'General Dentistry', 'Contact us'],
      }

    case 'extraction':
      return {
        text: `Routine extractions are handled by Dr. Sabin Giri, while more complex cases such as **wisdom tooth removal** are handled by Dr. Isfa Banu Haque, our oral and maxillofacial surgeon. Procedures are performed under local anaesthetic and include detailed aftercare instructions to ensure smooth recovery.`,
        navigateTo: '/services/oral-surgery',
        quickReplies: ['Wisdom tooth removal', 'Book an appointment', 'All doctors'],
      }

    case 'xray':
      return {
        text: `We use **digital X-rays** which provide high-resolution images instantly with significantly lower radiation than traditional film. Our radiologist Dr. Rinky Nyachhyon specialises in oral medicine and dental radiology, ensuring accurate, detailed diagnosis.`,
        navigateTo: '/doctors/dr-rinky-nyachhyon',
        quickReplies: ['Meet Dr. Rinky', 'Book an appointment', 'Our services'],
      }

    case 'cleaning':
      return {
        text: `Professional **dental cleaning and scaling** removes plaque, tartar, and surface stains that brushing can\'t reach. We recommend cleaning every 6 months for most patients. It\'s one of the most effective ways to prevent gum disease and cavities.`,
        navigateTo: '/services/general-dentistry',
        quickReplies: ['Book a cleaning', 'General Dentistry', 'Our hours'],
      }

    case 'doctors_all': {
      const list = doctors.map((d) => `**${d.shortName}**, ${d.role}`).join(', ')
      return {
        text: `Our experienced team covers all areas of dentistry: ${list}. Bookable online: ${bookable.map((d) => d.shortName).join(' and ')}. Specialist appointments are arranged through the clinic.`,
        navigateTo: '/doctors',
        quickReplies: ['Dr. Sachin Agrawal', 'Dr. Binita Adhikari', 'Book an appointment'],
      }
    }

    case 'doctor_sachin': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-sachin-agrawal')!
      return {
        text: `**${d.name}** (${d.qualification}, ${d.nmc}) is our founder and lead dentist with ${d.experience} of clinical experience. He specialises in ${d.specializations.slice(0, 3).join(', ')}. Dr. Sachin is available for online booking.`,
        navigateTo: '/doctors/dr-sachin-agrawal',
        quickReplies: ['Book with Dr. Sachin', 'All doctors', 'Our services'],
      }
    }

    case 'doctor_binita': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-binita-adhikari')!
      return {
        text: `**${d.name}** (${d.qualification}, ${d.nmc}) is one of our lead dentists with ${d.experience} of experience, known for her gentle, anxiety-easing approach and focus on correcting malaligned teeth. She specialises in ${d.specializations.slice(0, 3).join(', ')}. Available for online booking.`,
        navigateTo: '/doctors/dr-binita-adhikari',
        quickReplies: ['Book with Dr. Binita', 'All doctors', 'Our services'],
      }
    }

    case 'doctor_sabin': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-sabin-giri')!
      return {
        text: `**${d.name}** (${d.qualification}, ${d.nmc}) is a general dental practitioner focused on ${d.specializations.slice(0, 3).join(', ').toLowerCase()}. His expertise ensures safe, efficient treatment with minimal discomfort. Appointments via clinic.`,
        navigateTo: '/doctors/dr-sabin-giri',
        quickReplies: ['Extractions', 'Book an appointment', 'Contact us'],
      }
    }

    case 'doctor_shashi': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-shashi-bhushan-singh')!
      return {
        text: `**${d.name}** (${d.qualification}, ${d.nmc}) is a general dental practitioner with expertise in ${d.specializations.slice(0, 3).join(', ')}, and ${d.experience} in practice. He offers single implants through to full-arch rehabilitation. Appointments via clinic.`,
        navigateTo: '/doctors/dr-shashi-bhushan-singh',
        quickReplies: ['Dental Implants', 'Book an appointment', 'All doctors'],
      }
    }

    case 'doctor_rinky': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-rinky-nyachhyon')!
      return {
        text: `**${d.name}** (${d.qualification}, ${d.nmc}) specialises in ${d.specializations.slice(0, 3).join(', ')} with ${d.experience} of experience. She uses advanced digital imaging for accurate, early diagnosis. Appointments via clinic.`,
        navigateTo: '/doctors/dr-rinky-nyachhyon',
        quickReplies: ['Digital X-rays', 'All doctors', 'Book an appointment'],
      }
    }

    case 'doctor_ranjita': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-ranjita-shrestha-gorkhali')!
      return {
        text: `**${d.name}** (${d.nmc}) is our periodontist, specialising in ${d.specializations.slice(0, 3).join(', ')}. Appointments via clinic.`,
        navigateTo: '/doctors/dr-ranjita-shrestha-gorkhali',
        quickReplies: ['Gum treatment', 'All doctors', 'Book an appointment'],
      }
    }

    case 'doctor_isfa': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-isfa-banu-haque')!
      return {
        text: `**${d.name}** (${d.nmc}) is our oral and maxillofacial surgeon, specialising in ${d.specializations.slice(0, 3).join(', ')}. Appointments via clinic.`,
        navigateTo: '/doctors/dr-isfa-banu-haque',
        quickReplies: ['Oral surgery', 'All doctors', 'Book an appointment'],
      }
    }

    case 'doctor_dikshya': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-dikshya-bhusal')!
      return {
        text: `**${d.name}** (${d.nmc}) is a general dental practitioner at Bright Smile Dental Clinic. Appointments via clinic.`,
        navigateTo: '/doctors/dr-dikshya-bhusal',
        quickReplies: ['All doctors', 'Our services', 'Book an appointment'],
      }
    }

    case 'doctor_barun': {
      const d = DOCTORS_STATIC.find((x) => x.slug === 'dr-barun-kumar-sah')!
      return {
        text: `**${d.name}** (${d.nmc}) is a dentist at Bright Smile Dental Clinic. Appointments via clinic.`,
        navigateTo: '/doctors/dr-barun-kumar-sah',
        quickReplies: ['All doctors', 'Our services', 'Book an appointment'],
      }
    }

    case 'gallery':
      return {
        text: "Our gallery showcases the clinic's reception, patient lounge, treatment rooms, and advanced equipment. Take a look to get a feel for our clean, modern, comfortable environment before your visit.",
        navigateTo: '/gallery',
        quickReplies: ['View gallery', 'Book an appointment', 'Our location'],
      }

    case 'about':
      return {
        text: `Bright Smile Dental Clinic was founded in 2006 by Dr. Sachin Agrawal with a single mission: exceptional dental care delivered with genuine warmth. We've grown into one of Kathmandu's most trusted clinics, with an experienced team of dentists covering all areas of dentistry, modern digital equipment, and over 10,000 happy patients served.`,
        navigateTo: '/about',
        quickReplies: ['Meet our team', 'Our services', 'Book an appointment'],
      }

    case 'testimonials':
      return {
        text: "Our patients are our best advocates! We have hundreds of happy patients from across Kathmandu and beyond. You can read some of their stories on our testimonials page, rated 5 stars across the board.",
        navigateTo: '/testimonials',
        quickReplies: ['Read testimonials', 'Book an appointment', 'Meet our doctors'],
      }

    case 'faq': {
      const sample = FAQS_STATIC.slice(0, 2)
      return {
        text: `Some common questions: **"${sample[0].q}"**: ${sample[0].a.slice(0, 80)}… You'll find answers to all our frequently asked questions on the FAQ page.`,
        navigateTo: '/faq',
        quickReplies: ['View all FAQs', 'Book an appointment', 'Contact us'],
      }
    }

    case 'unknown':
    default:
      return {
        text: `I'm not sure I caught that. Here are some things I can help you with! You can also call us directly at **${CLINIC_CONTACT.phone}** and our team will be happy to assist.`,
        quickReplies: ['Book an appointment', 'Our services', 'Meet our doctors', 'Clinic hours'],
      }
  }
}

// ── Public API ─────────────────────────────────────────────────

export function processMessage(userMessage: string): BotResponse {
  const intent = detectIntent(userMessage)
  return buildResponse(intent)
}
