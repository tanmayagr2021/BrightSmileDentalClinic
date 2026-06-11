/**
 * Seed script — inserts initial testimonials and FAQs into Supabase.
 * Idempotent: checks if tables are empty before inserting.
 *
 * Run with:
 *   node --env-file=.env.local scripts/seed-content.mjs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Run: node --env-file=.env.local scripts/seed-content.mjs')
  process.exit(1)
}

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
}

const TESTIMONIALS = [
  {
    patient_name: 'Priya Sharma',
    rating: 5,
    review_text: 'Exceptional care from the entire team. The doctors explained every step and made sure I was comfortable throughout. My smile has genuinely transformed.',
    treatment_type: 'Smile Makeover',
    source: 'manual',
    status: 'approved',
    approved_at: new Date().toISOString(),
    is_featured: true,
    sort_order: 1,
  },
  {
    patient_name: 'Rajesh Thapa',
    rating: 5,
    review_text: 'I had not visited a dentist in years and was quite nervous. The team was incredibly patient and professional — I left feeling relieved and well cared for.',
    treatment_type: 'Comprehensive Check-up',
    source: 'manual',
    status: 'approved',
    approved_at: new Date().toISOString(),
    is_featured: false,
    sort_order: 2,
  },
  {
    patient_name: 'Sushila Maharjan',
    rating: 5,
    review_text: 'The paediatric dentist is wonderful with children. My kids actually look forward to their appointments now. Clean, modern clinic with a warm, welcoming team.',
    treatment_type: 'Pediatric Dentistry',
    source: 'manual',
    status: 'approved',
    approved_at: new Date().toISOString(),
    is_featured: false,
    sort_order: 3,
  },
  {
    patient_name: 'Bikash Rai',
    rating: 5,
    review_text: 'Had a dental implant done here. The procedure was smooth and recovery much faster than I expected. Very happy with the completely natural-looking result.',
    treatment_type: 'Dental Implant',
    source: 'manual',
    status: 'approved',
    approved_at: new Date().toISOString(),
    is_featured: false,
    sort_order: 4,
  },
  {
    patient_name: 'Anita Karmacharya',
    rating: 5,
    review_text: 'Dr. Sachin took his time explaining my full treatment plan. Professional, clean, and genuinely caring. Highly recommend for anyone looking for quality dental care.',
    treatment_type: 'Root Canal Treatment',
    source: 'manual',
    status: 'approved',
    approved_at: new Date().toISOString(),
    is_featured: false,
    sort_order: 5,
  },
]

const FAQS = [
  {
    question: 'How often should I visit the dentist?',
    answer: 'We recommend a visit every 6 months for routine checkups and professional cleanings. Patients with specific conditions such as gum disease or a history of cavities may benefit from more frequent appointments.',
    category: 'general',
    is_visible: true,
    sort_order: 1,
  },
  {
    question: 'Do you accept walk-in patients?',
    answer: 'We work primarily by appointment to minimise waiting times and ensure each patient receives full attention. For dental emergencies, call us directly — we will do our best to accommodate you the same day.',
    category: 'general',
    is_visible: true,
    sort_order: 2,
  },
  {
    question: 'Is teeth whitening safe?',
    answer: 'Yes. Professional whitening supervised by our dentists uses clinically tested products that are safe for your enamel. We assess suitability during a consultation to ensure the best outcome.',
    category: 'cosmetic',
    is_visible: true,
    sort_order: 3,
  },
  {
    question: 'At what age should my child first see a dentist?',
    answer: "We recommend the first visit by your child's first birthday, or within 6 months of the first tooth appearing. Early visits build healthy habits and allow any issues to be caught while they are simple to treat.",
    category: 'paediatric',
    is_visible: true,
    sort_order: 4,
  },
  {
    question: 'How much do treatments cost?',
    answer: 'Costs vary by treatment. We provide a clear, detailed estimate before starting any procedure. Contact us or book a consultation — we are happy to discuss your needs and options.',
    category: 'general',
    is_visible: true,
    sort_order: 5,
  },
  {
    question: 'What should I do in a dental emergency?',
    answer: 'Call us immediately at +977-1-4419594. For knocked-out teeth, keep the tooth moist (in milk or between cheek and gum) and come to us as quickly as possible.',
    category: 'emergency',
    is_visible: true,
    sort_order: 6,
  },
  {
    question: 'Am I suitable for dental implants?',
    answer: 'Most adults with healthy gums and adequate bone density are suitable candidates. A consultation including dental X-rays will determine your eligibility.',
    category: 'implants',
    is_visible: true,
    sort_order: 7,
  },
  {
    question: 'I am anxious about dental treatment. Can you help?',
    answer: 'Absolutely. Our team is experienced with anxious patients. Please let us know before your appointment so we can take extra time and adjust our approach to your comfort.',
    category: 'general',
    is_visible: true,
    sort_order: 8,
  },
]

async function countRows(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id`, {
    headers: { ...AUTH_HEADERS, 'Prefer': 'count=exact' },
  })
  const count = parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0', 10)
  return count
}

async function insertRows(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Insert into ${table} failed: ${text}`)
  }
  return await res.json()
}

async function main() {
  console.log('Bright Smile — Content Seed Script')
  console.log('────────────────────────────────────')

  // Testimonials
  const testimonialCount = await countRows('testimonials')
  if (testimonialCount > 0) {
    console.log(`  testimonials already has ${testimonialCount} rows — skipping`)
  } else {
    const inserted = await insertRows('testimonials', TESTIMONIALS)
    console.log(`  Inserted ${inserted.length} testimonials`)
  }

  // FAQs
  const faqCount = await countRows('faqs')
  if (faqCount > 0) {
    console.log(`  faqs already has ${faqCount} rows — skipping`)
  } else {
    const inserted = await insertRows('faqs', FAQS)
    console.log(`  Inserted ${inserted.length} FAQs`)
  }

  console.log('')
  console.log('────────────────────────────────────')
  console.log('Content seed complete!')
  console.log('')
  console.log('    Next: node --env-file=.env.local scripts/seed-content.mjs')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
