// Central source of truth for static clinic data.
// CMS-READY ARCHITECTURE: Every collection has `visible` and `sortOrder` fields.
// Future: each export will be replaced by a Supabase table fetch.
// `visible` → admin toggle | `sortOrder` → drag-to-reorder

export const CLINIC_NAME = 'Bright Smile Dental Clinic Pvt. Ltd.'
export const CLINIC_NAME_SHORT = 'Bright Smile'
export const CLINIC_TAGLINE = 'Creating Smiles, Changing Lives'
export const CLINIC_SUBTITLE = 'Dental Clinic Pvt. Ltd.'

export const CLINIC_CONTACT = {
  phone: '+977-1-4519594',
  phoneWhatsApp: '+91 8073047214',
  email: 'brightsmiledentalclinic1111@gmail.com',
  emailAppointments: 'brightsmiledentalclinic1111@gmail.com',
  address: 'Nagpokhari, Naxal',
  addressFull: 'Nagpokhari, Naxal, Kathmandu, Nepal',
  googleMapsUrl: 'https://maps.app.goo.gl/1zc3q43cxKxpcoEM6',
  facebook: 'https://www.facebook.com/brightsmilenepal/',
  instagram: 'https://www.instagram.com/brightsmiles_np',
} as const

export const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Choose Your Tooth', href: '/choose-your-tooth' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export const FOOTER_QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export const OPENING_HOURS = [
  { days: 'Sunday – Friday', hours: '9:00 AM – 6:00 PM', open: true },
  { days: 'Saturday', hours: '9:00 AM – 1:00 PM', open: true },
] as const

export const HOMEPAGE_STATS = [
  { count: 10000, suffix: '+', label: 'Patients Treated' },
  { count: 20, suffix: '+', label: 'Years of Service & Experience' },
  { count: 6, suffix: '', label: 'Expert Doctors' },
] as const

// ─── Doctors ─────────────────────────────────────────────────
// Future: fetch from `doctors` + `doctor_qualifications` tables

export type DoctorType = 'lead' | 'specialist'

export type Doctor = {
  slug: string
  name: string
  shortName: string
  qualification: string
  nmc: string
  role: string
  type: DoctorType
  bookable: boolean
  initials: string
  color: string
  bio: string
  specializations: string[]
  languages: string[]
  experience: string
  education: string
  visible: boolean
  sortOrder: number
}

export const DOCTORS_STATIC: Doctor[] = [
  {
    slug: 'dr-sachin-agrawal',
    name: 'Dr. Sachin Agrawal',
    shortName: 'Dr. Sachin',
    qualification: 'BDS',
    nmc: 'NMC 3216',
    role: 'Lead Dentist',
    type: 'lead',
    bookable: true,
    initials: 'SA',
    color: '#14202E',
    bio: 'Dr. Sachin Agrawal founded Bright Smile Dental Clinic and has led it for 24 years. His clinical work centres on general dentistry, root canal treatment, prosthetic work, dental implants and clear aligner therapy, and as lead dentist he makes sure every patient\'s treatment plan is explained clearly before any work begins.',
    specializations: ['General Dentistry', 'Root Canal Treatment', 'Prosthetic Works', 'Clear Aligners', 'Dental Implants'],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '24 years',
    education: 'Manipal Academy of Higher Education',
    visible: true,
    sortOrder: 1,
  },
  {
    slug: 'dr-binita-adhikari',
    name: 'Dr. Binita Adhikari',
    shortName: 'Dr. Binita',
    qualification: 'BDS',
    nmc: 'NMC 2687',
    role: 'Lead Dentist',
    type: 'lead',
    bookable: true,
    initials: 'BA',
    color: '#3d8560',
    bio: 'Dr. Binita Adhikari is a lead dentist at Bright Smile Dental Clinic. Her areas of focus include restorative and cosmetic dentistry, orthodontics and clear aligner treatment, with particular expertise in correcting malaligned teeth. In her 26 years at Bright Smile, she has built a gentle, patient-focused approach that eases dental anxiety and builds lasting confidence in every smile.',
    specializations: ['Restorative Dentistry', 'Cosmetic Dentistry', 'Orthodontics', 'Clear Aligners', 'Correction of Malaligned Teeth'],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '26 years',
    education: 'BDS, College of Dental Surgery, Manipal Academy of Higher Education',
    visible: true,
    sortOrder: 2,
  },
  {
    slug: 'dr-ranjita-shrestha-gorkhali',
    name: 'Dr. Ranjita Shrestha (Gorkhali)',
    shortName: 'Dr. Ranjita',
    qualification: '',
    nmc: 'NMC 11303',
    role: 'Periodontist',
    type: 'specialist',
    bookable: false,
    initials: 'RS',
    color: '#4A9B6F',
    bio: 'Dr. Ranjita Shrestha (Gorkhali) is a periodontist at Bright Smile Dental Clinic with over 20 years of experience in the treatment of gum disease and the supporting structures of the teeth. NMC registered (NMC 11303).',
    specializations: ['Periodontics'],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '20+ years',
    education: '',
    visible: true,
    sortOrder: 3,
  },
  {
    slug: 'dr-sabin-giri',
    name: 'Dr. Sabin Giri',
    shortName: 'Dr. Sabin',
    qualification: 'BDS',
    nmc: 'NMC 3914',
    role: 'General Dental Practitioner',
    type: 'specialist',
    bookable: false,
    initials: 'SG',
    color: '#14202E',
    bio: 'Dr. Sabin Giri is a general dental practitioner at Bright Smile Dental Clinic, focused on tooth extractions. His expertise ensures safe, efficient treatment with minimal discomfort and clear aftercare guidance.',
    specializations: ['Extractions'],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '20+ years',
    education: 'Pioneer Dental College, Bangladesh',
    visible: true,
    sortOrder: 4,
  },
  {
    slug: 'dr-shashi-bhushan-singh',
    name: 'Dr. Shashi Bhushan Singh',
    shortName: 'Dr. Shashi',
    qualification: 'BDS',
    nmc: 'NMC 3449',
    role: 'General Dental Practitioner',
    type: 'specialist',
    bookable: false,
    initials: 'SS',
    color: '#3d8560',
    bio: 'Dr. Shashi Bhushan Singh is a general dental practitioner at Bright Smile Dental Clinic with expertise in dental implants, bone grafting and sinus lift surgery, restoring smiles and function with lasting clinical precision.',
    specializations: ['Implants', 'Bone Grafting', 'Sinus Lift Surgeries'],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '24 years',
    education: 'BDS, College of Dental Surgery, Manipal Academy of Higher Education',
    visible: true,
    sortOrder: 5,
  },
  {
    slug: 'dr-isfa-banu-haque',
    name: 'Dr. Isfa Banu Haque',
    shortName: 'Dr. Isfa',
    qualification: '',
    nmc: 'NMC 5130',
    role: 'Oral & Maxillofacial Surgeon',
    type: 'specialist',
    bookable: false,
    initials: 'IH',
    color: '#14202E',
    bio: 'Dr. Isfa Banu Haque is an oral and maxillofacial surgeon at Bright Smile Dental Clinic, specialising in surgical extractions and a full range of major and minor oral surgical procedures. NMC registered (NMC 5130).',
    specializations: ['Surgical Extractions', 'Major Oral Surgical Procedures', 'Minor Oral Surgical Procedures'],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '',
    education: '',
    visible: true,
    sortOrder: 6,
  },
  {
    slug: 'dr-dikshya-bhusal',
    name: 'Dr. Dikshya Bhusal',
    shortName: 'Dr. Dikshya',
    qualification: '',
    nmc: 'NMC 40381',
    role: 'General Dental Practitioner',
    type: 'specialist',
    bookable: false,
    initials: 'DB',
    color: '#3d8560',
    bio: 'Dr. Dikshya Bhusal is a general dental practitioner at Bright Smile Dental Clinic. NMC registered (NMC 40381).',
    specializations: [],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '',
    education: '',
    visible: true,
    sortOrder: 7,
  },
  {
    slug: 'dr-rinky-nyachhyon',
    name: 'Dr. Rinky Nyachhyon',
    shortName: 'Dr. Rinky',
    qualification: 'MDS',
    nmc: 'NMC 3201',
    role: 'Oral Medicine & Radiologist',
    type: 'specialist',
    bookable: false,
    initials: 'RN',
    color: '#4A9B6F',
    bio: 'Dr. Rinky Nyachhyon specialises in oral medicine and dental radiology, playing a key role in accurate diagnosis. Her clinical focus includes the diagnosis and treatment of oral lesions, including precancerous and cancerous lesions, and she uses advanced digital imaging to detect conditions early, supporting effective treatment planning across every specialty at Bright Smile.',
    specializations: ['Oral Medicine', 'Dental Radiology', 'Oral Diagnosis', 'Oral Pathology', 'Diagnosis & Treatment of Oral Lesions', 'Precancerous & Cancerous Lesions'],
    languages: ['Nepali', 'Hindi', 'English'],
    experience: '24 years',
    education: 'MDS, Oral Medicine and Radiology, Manipal College of Dental Sciences, Mangalore',
    visible: true,
    sortOrder: 8,
  },
  {
    slug: 'dr-barun-kumar-sah',
    name: 'Dr. Barun Kumar Sah',
    shortName: 'Dr. Barun',
    qualification: '',
    nmc: 'NMC 11453',
    role: 'Dentist',
    type: 'specialist',
    bookable: false,
    initials: 'BS',
    color: '#14202E',
    bio: 'Dr. Barun Kumar Sah is a dentist at Bright Smile Dental Clinic. NMC registered (NMC 11453).',
    specializations: [],
    languages: [],
    experience: '',
    education: '',
    visible: true,
    sortOrder: 9,
  },
]

// ─── Services ─────────────────────────────────────────────────
// Future: fetch from `services` + `service_categories` tables

export type ServiceSubItem = {
  name: string
  description: string
}

export type ProcessStep = {
  step: number
  title: string
  description: string
}

export type ServiceCategory = {
  slug: string
  name: string
  shortDescription: string
  description: string
  subServices: ServiceSubItem[]
  benefits: string[]
  processSteps: ProcessStep[]
  faqs: { q: string; a: string }[]
  visible: boolean
  sortOrder: number
}

export const SERVICE_CATEGORIES_STATIC: ServiceCategory[] = [
  {
    slug: 'general-dentistry',
    name: 'General Dentistry',
    shortDescription: 'Preventive care and routine treatments for lifelong oral health.',
    description: 'Our general dentistry services form the foundation of a healthy smile. From routine check-ups to restorative treatments, our experienced team delivers comprehensive care for patients of all ages with a gentle, unhurried approach.',
    subServices: [
      { name: 'Comprehensive Dental Exams', description: 'Full oral health assessment including gum, tooth and soft tissue evaluation.' },
      { name: 'Professional Cleaning', description: 'Removal of plaque, tartar and surface stains for a fresh, clean smile.' },
      { name: 'Tooth-Coloured Fillings', description: 'Natural-looking composite resin fillings that blend seamlessly with your teeth.' },
      { name: 'Teeth Whitening', description: 'Brighten your smile with professional teeth whitening.' },
      { name: 'Tooth Extractions', description: 'Gentle removal of damaged or impacted teeth when necessary.' },
      { name: 'Gum Care & Scaling', description: 'Scaling and root planing to treat early-stage gum disease and prevent progression.' },
    ],
    benefits: [
      'Prevention of costly future treatments',
      'Early detection of oral health issues',
      'Relief from pain and discomfort',
      'Improved overall health through oral care',
    ],
    processSteps: [
      { step: 1, title: 'Initial Assessment', description: 'A comprehensive exam including X-rays to understand your oral health baseline.' },
      { step: 2, title: 'Treatment Planning', description: 'We discuss your options, explain costs transparently, and agree on your care plan.' },
      { step: 3, title: 'Comfortable Treatment', description: 'Treatment delivered with a gentle technique and local anaesthetic where needed.' },
      { step: 4, title: 'Aftercare Guidance', description: 'Clear written instructions and a follow-up to ensure optimal healing and results.' },
    ],
    faqs: [
      { q: 'How often should I come for a check-up?', a: 'Every 6 months for most patients. Those with specific conditions may benefit from more frequent visits.' },
      { q: 'Does a filling hurt?', a: 'We use local anaesthetic to ensure comfort throughout. You may experience mild sensitivity for a day or two afterwards.' },
    ],
    visible: true,
    sortOrder: 1,
  },
  {
    slug: 'cosmetic-dentistry',
    name: 'Cosmetic Dentistry',
    shortDescription: 'Smile transformations that boost your confidence.',
    description: 'We believe everyone deserves to love their smile. Our cosmetic dental services range from simple teeth whitening to complete smile makeovers, all designed to enhance your natural appearance while protecting your oral health.',
    subServices: [
      { name: 'Professional Teeth Whitening', description: 'Clinically supervised whitening for noticeably brighter results.' },
      { name: 'Dental Veneers', description: 'Ultra-thin porcelain shells that correct shape, colour and minor alignment issues.' },
      { name: 'Composite Bonding', description: 'Tooth-coloured resin applied to repair chips, gaps or discolouration.' },
      { name: 'Smile Design', description: 'A planned, holistic approach to redesigning your entire smile.' },
      { name: 'Gum Contouring', description: 'Reshaping of the gum line to create a more balanced, aesthetic smile.' },
    ],
    benefits: [
      'Dramatically improved smile aesthetics',
      'Boosted self-confidence',
      'Long-lasting, natural-looking results',
      'Minimal enamel removal with modern techniques',
    ],
    processSteps: [
      { step: 1, title: 'Smile Consultation', description: 'We listen to your goals and assess your current smile thoroughly.' },
      { step: 2, title: 'Treatment Planning', description: 'We discuss expected outcomes and treatment options, with transparent costs.' },
      { step: 3, title: 'Precision Treatment', description: 'Treatment delivered over planned appointments with careful attention to detail.' },
      { step: 4, title: 'Smile Reveal', description: 'Final review and polishing, then enjoy your new smile.' },
    ],
    faqs: [
      { q: 'Is teeth whitening safe?', a: 'Yes. Professional whitening uses clinically tested, enamel-safe formulas under direct dentist supervision.' },
      { q: 'How long do veneers last?', a: 'Porcelain veneers typically last 10–15 years with good oral hygiene and regular dental visits.' },
    ],
    visible: true,
    sortOrder: 2,
  },
  {
    slug: 'orthodontics',
    name: 'Orthodontics',
    shortDescription: 'Straighter smiles at any age, from braces to clear aligners.',
    description: 'Orthodontic treatment at Bright Smile uses modern techniques to straighten teeth, correct bite issues and improve oral health for patients of all ages. Whether you prefer traditional braces or discreet clear aligners, we have the right solution.',
    subServices: [
      { name: 'Metal Braces', description: 'Highly effective and durable, ideal for complex cases and younger patients.' },
      { name: 'Ceramic Braces', description: 'Tooth-coloured brackets for a less noticeable appearance during treatment.' },
      { name: 'Clear Aligners', description: 'Virtually invisible, removable trays that gradually shift teeth into alignment.' },
      { name: 'Retainers', description: 'Custom retainers to maintain your results after active treatment.' },
      { name: 'Space Maintainers', description: 'Paediatric devices to preserve spacing for developing adult teeth.' },
    ],
    benefits: [
      'Corrected bite and improved jaw function',
      'Easier cleaning with straighter, well-spaced teeth',
      'Boosted confidence and aesthetics',
      'Treatment options suitable for all ages',
    ],
    processSteps: [
      { step: 1, title: 'Orthodontic Assessment', description: 'X-rays, photographs and impressions taken to plan your treatment accurately.' },
      { step: 2, title: 'Treatment Plan', description: 'We present options, timeline and costs clearly before proceeding.' },
      { step: 3, title: 'Active Treatment', description: 'Regular adjustment appointments to progress your alignment safely and comfortably.' },
      { step: 4, title: 'Retention Phase', description: 'Retainer fitting to protect your result permanently.' },
    ],
    faqs: [
      { q: 'How long does orthodontic treatment take?', a: 'Typically 12–24 months depending on complexity. A consultation will provide a personalised timeline.' },
      { q: 'Are clear aligners as effective as braces?', a: 'For mild to moderate cases, yes. Complex cases may benefit from traditional braces.' },
    ],
    visible: true,
    sortOrder: 3,
  },
  {
    slug: 'oral-surgery',
    name: 'Oral Surgery',
    shortDescription: 'Expert surgical care for complex dental conditions.',
    description: 'Our oral surgery services address complex dental conditions with precision and care. From wisdom tooth removal to minor surgical procedures, our experienced oral surgeon ensures safe, comfortable outcomes with thorough aftercare support.',
    subServices: [
      { name: 'Wisdom Tooth Removal', description: 'Surgical extraction of impacted or problematic wisdom teeth.' },
      { name: 'Complex Extractions', description: 'Removal of severely broken, decayed or difficult teeth.' },
      { name: 'Surgical Dentistry', description: 'Minor surgical procedures carried out as part of your treatment plan.' },
      { name: 'Frenectomy', description: 'Minor surgery to correct tongue-tie or lip-tie conditions.' },
      { name: 'Cyst Removal', description: 'Surgical removal of jaw cysts with minimal bone disturbance.' },
    ],
    benefits: [
      'Relief from pain and infection',
      'Prevention of damage to adjacent teeth',
      'Experienced, specialist surgical team',
      'Comprehensive recovery support',
    ],
    processSteps: [
      { step: 1, title: 'Clinical Assessment', description: 'X-rays and clinical evaluation to plan the safest surgical approach.' },
      { step: 2, title: 'Consent & Preparation', description: 'Full explanation of the procedure, risks, and recovery expectations.' },
      { step: 3, title: 'Surgical Procedure', description: 'Performed under local anaesthetic by our experienced oral surgeon.' },
      { step: 4, title: 'Recovery Support', description: 'Detailed written aftercare instructions and a follow-up appointment.' },
    ],
    faqs: [
      { q: 'Is wisdom tooth removal painful?', a: 'The procedure is painless under local anaesthetic. Post-operative discomfort is normal and well-managed with prescribed medication.' },
      { q: 'How long is recovery after oral surgery?', a: 'Most patients feel better within 3–7 days. Full socket healing takes 4–6 weeks.' },
    ],
    visible: true,
    sortOrder: 4,
  },
  {
    slug: 'dental-implants',
    name: 'Dental Implants',
    shortDescription: 'Permanent, natural-looking tooth replacements.',
    description: 'Dental implants are the gold standard for replacing missing teeth. They look, feel and function like natural teeth, and with proper care they can last for a long time. Our implant specialist offers single tooth implants, multiple implants and full-arch solutions.',
    subServices: [
      { name: 'Single Tooth Implant', description: 'A titanium implant topped with a custom ceramic crown for a seamless result.' },
      { name: 'Multiple Implants', description: 'Individual implants to replace several missing teeth independently.' },
      { name: 'Implant-Supported Bridge', description: 'A bridge anchored to implants, with no need to alter healthy adjacent teeth.' },
      { name: 'All-on-4 / All-on-6', description: 'Full-arch rehabilitation for patients missing all or most teeth.' },
      { name: 'Bone Grafting', description: 'Jaw bone augmentation to support successful implant placement where needed.' },
    ],
    benefits: [
      'A permanent solution with no slipping or adhesives',
      'Preserves jaw bone and facial structure',
      'Functions and looks exactly like natural teeth',
      'Improves speech, eating and overall confidence',
    ],
    processSteps: [
      { step: 1, title: 'Implant Assessment', description: 'Dental X-rays or CBCT scan to assess bone volume and plan precise placement.' },
      { step: 2, title: 'Implant Placement', description: 'Titanium post placed surgically into the jaw under local anaesthetic.' },
      { step: 3, title: 'Healing Period', description: 'Osseointegration, the process where the implant fuses with your jaw bone, typically takes 3–6 months.' },
      { step: 4, title: 'Crown Placement', description: 'A custom ceramic crown is attached for a natural-looking, permanent finish.' },
    ],
    faqs: [
      { q: 'Am I a candidate for dental implants?', a: 'Most adults with healthy gums and sufficient bone density are eligible. A consultation will confirm your suitability.' },
      { q: 'How long do dental implants last?', a: 'With proper maintenance, dental implants can last for a long time and are one of the most durable tooth replacement options available.' },
    ],
    visible: true,
    sortOrder: 5,
  },
  {
    slug: 'prosthetics',
    name: 'Prosthetics',
    shortDescription: 'Crowns, bridges and restorations that rebuild your bite.',
    description: 'Our prosthetic services rebuild damaged, worn or missing teeth with durable, natural-looking restorations, from full-coverage crowns and bridges to precision inlays and onlays.',
    subServices: [
      { name: 'Zirconia Crowns and Bridges', description: 'Strong, natural-looking zirconia restorations for damaged or missing teeth.' },
      { name: 'PFM Crowns and Bridges', description: 'Porcelain-fused-to-metal crowns and bridges combining strength and aesthetics.' },
      { name: 'Inlays, Onlays', description: 'Precision restorations for teeth with damage too extensive for a filling but not requiring a full crown.' },
      { name: 'Gum Strippers', description: 'Prosthetic gum-line shaping procedures as part of restorative treatment planning.' },
    ],
    benefits: [
      'Restores function for chewing and speaking',
      'Long-lasting, durable materials',
      'Natural-looking results that match your smile',
      'Protects remaining healthy tooth structure',
    ],
    processSteps: [
      { step: 1, title: 'Assessment', description: 'Examination and, where needed, X-rays to plan the right restoration for your tooth.' },
      { step: 2, title: 'Preparation', description: 'The tooth is prepared and precise impressions or digital scans are taken.' },
      { step: 3, title: 'Fabrication', description: 'Your custom restoration is crafted to match the shape, size and colour of your natural teeth.' },
      { step: 4, title: 'Fitting', description: 'The finished restoration is fitted, checked for bite and comfort, and permanently secured.' },
    ],
    faqs: [
      { q: 'How long do crowns and bridges last?', a: 'With good oral hygiene and regular check-ups, crowns and bridges typically last many years.' },
      { q: 'Will a crown or bridge look natural?', a: 'Yes. Modern materials like zirconia and porcelain are shade-matched to blend with your surrounding teeth.' },
    ],
    visible: true,
    sortOrder: 7,
  },
  {
    slug: 'endodontics',
    name: 'Conservative Dentistry and Endodontics',
    shortDescription: 'Root canal treatment to save teeth from pain and infection.',
    description: 'Our conservative dentistry and endodontic care treats infection and damage inside the tooth, relieving pain and saving teeth that would otherwise need extraction, from straightforward to complex root canal cases.',
    subServices: [
      { name: 'Simple to Complex Root Canal Treatment', description: 'Removal of infected or damaged pulp to relieve pain and preserve the natural tooth.' },
      { name: 'Post and Core', description: 'Structural rebuilding of a root-canal-treated tooth to support a crown.' },
    ],
    benefits: [
      'Relieves tooth pain and infection',
      'Saves your natural tooth from extraction',
      'Prevents infection from spreading further',
      'Restores normal biting and chewing function',
    ],
    processSteps: [
      { step: 1, title: 'Diagnosis', description: 'Examination and X-rays to confirm the cause and extent of the problem.' },
      { step: 2, title: 'Treatment Planning', description: 'We explain the procedure, expected outcome and costs before proceeding.' },
      { step: 3, title: 'Root Canal Treatment', description: 'Infected pulp is removed and the canal cleaned, shaped and sealed under local anaesthetic.' },
      { step: 4, title: 'Restoration', description: 'The tooth is restored with a filling, post and core, or crown as needed for long-term strength.' },
    ],
    faqs: [
      { q: 'Is root canal treatment painful?', a: 'Modern root canal treatment is performed under local anaesthetic and is generally no more uncomfortable than having a filling.' },
      { q: 'Will I need a crown after a root canal?', a: 'Many root-canal-treated teeth need a crown afterward for long-term strength, especially back teeth used for chewing.' },
    ],
    visible: true,
    sortOrder: 8,
  },
  {
    slug: 'oral-medicine',
    name: 'Oral Medicine',
    shortDescription: 'Early diagnosis of oral lesions and screening for precancerous or cancerous conditions.',
    description: 'Our oral medicine service focuses on the early diagnosis of oral lesions, including screening for precancerous or cancerous conditions, so that any concern is identified and referred for the right care as early as possible.',
    subServices: [
      { name: 'Early Diagnosis of Oral Lesions', description: 'Clinical examination to identify unusual changes in the mouth, gums, tongue or soft tissue.' },
      { name: 'Early Screening for Precancerous or Cancerous Lesions', description: 'Screening to help detect signs of concern at an early, more treatable stage.' },
    ],
    benefits: [
      'Early identification of conditions that need attention',
      'Peace of mind through regular screening',
      'Clear guidance on next steps and referrals where needed',
    ],
    processSteps: [
      { step: 1, title: 'Clinical Examination', description: 'A thorough visual and physical examination of the mouth, gums and soft tissue.' },
      { step: 2, title: 'Assessment', description: 'Any areas of concern are evaluated and discussed with you clearly.' },
      { step: 3, title: 'Guidance', description: 'We explain findings honestly and advise on any further tests or referrals needed.' },
    ],
    faqs: [
      { q: 'How often should I have an oral screening?', a: 'A screening as part of your routine check-up every 6 months is generally sufficient for most patients.' },
      { q: 'Does an oral lesion always mean something serious?', a: 'No. Most lesions are harmless, but early assessment is the best way to be sure and to catch anything that does need attention while it is most treatable.' },
    ],
    visible: true,
    sortOrder: 10,
  },
  {
    slug: 'periodontics',
    name: 'Periodontics',
    shortDescription: 'Gum health treatment, from scaling to periodontal surgery.',
    description: 'Our periodontal care treats gum disease at every stage, from routine deep scaling to surgical procedures, protecting the gum and bone that support your teeth.',
    subServices: [
      { name: 'Deep Scaling', description: 'Thorough removal of plaque and tartar above and below the gumline.' },
      { name: 'Subgingival Scaling and Root Planing', description: 'Deep cleaning of root surfaces below the gumline to treat gum disease.' },
      { name: 'Flap Surgery', description: 'Surgical access to deep-seated tartar and infection for advanced gum disease.' },
      { name: 'Crown Lengthening', description: 'Reshaping of gum and bone to expose more of the tooth for restorative or cosmetic work.' },
      { name: 'Gum Contouring', description: 'Reshaping of the gum line to create a more balanced, healthy smile.' },
    ],
    benefits: [
      'Treats and controls gum disease',
      'Protects the bone and tissue supporting your teeth',
      'Reduces bleeding, swelling and bad breath',
      'Helps prevent tooth loss from advanced gum disease',
    ],
    processSteps: [
      { step: 1, title: 'Periodontal Assessment', description: 'Measurement of gum pockets and evaluation of bone support around your teeth.' },
      { step: 2, title: 'Treatment Planning', description: 'We explain the stage of gum disease and the recommended treatment plan.' },
      { step: 3, title: 'Treatment', description: 'Scaling, root planing or surgical treatment as needed, with local anaesthetic for comfort.' },
      { step: 4, title: 'Maintenance', description: 'A personalised recall schedule to keep gum disease from returning.' },
    ],
    faqs: [
      { q: 'What are the signs of gum disease?', a: 'Bleeding gums, swelling, bad breath and receding gums are common early signs. See us promptly if you notice these.' },
      { q: 'Is gum treatment painful?', a: 'Deep cleaning and surgical procedures are performed under local anaesthetic for your comfort.' },
    ],
    visible: true,
    sortOrder: 9,
  },
  {
    slug: 'pediatric-dentistry',
    name: 'Pediatric Dentistry',
    shortDescription: 'Gentle, child-friendly dental care from the very first tooth.',
    description: 'Positive early dental experiences shape lifelong oral health habits. Our child-friendly team uses a patient, gentle approach to make every visit comfortable and fun, building a relationship with dentistry that lasts.',
    subServices: [
      { name: 'Fluoride Treatment', description: 'Professional fluoride application to strengthen developing enamel.' },
      { name: "Children's Fillings", description: 'Tooth-coloured fillings placed gently to preserve primary teeth.' },
      { name: 'Pulpotomy', description: 'Partial removal of infected pulp to preserve a healthy primary tooth.' },
      { name: 'Habit Counselling', description: 'Guidance on thumb-sucking, pacifier use and age-appropriate oral hygiene.' },
    ],
    benefits: [
      'Positive dental experiences from childhood',
      'Prevention-first approach to reduce future treatment needs',
      'Child-friendly, anxiety-reducing environment',
      'Parent education and practical home-care guidance',
    ],
    processSteps: [
      { step: 1, title: 'Welcome Visit', description: 'A gentle introduction to the clinic: the team, the chair and the tools.' },
      { step: 2, title: 'Examination', description: 'A careful oral examination tailored to your child\'s age and comfort level.' },
      { step: 3, title: 'Prevention First', description: 'Cleaning and fluoride treatment as appropriate, with no rush and no pressure.' },
      { step: 4, title: 'Parent Guidance', description: 'Practical tips on diet, brushing technique and what to expect as teeth develop.' },
    ],
    faqs: [
      { q: 'When should my child first see a dentist?', a: 'By their first birthday, or within 6 months of the first tooth appearing, whichever comes first.' },
      { q: 'My child is afraid of the dentist. Can you help?', a: 'Absolutely. We specialise in easing dental anxiety in children using tell-show-do technique and lots of patience.' },
    ],
    visible: true,
    sortOrder: 6,
  },
]

// ─── Clinic Showcase Slides ───────────────────────────────────
// Future: fetch from `gallery` table with category = 'showcase'

export type ShowcaseSlide = {
  id: string
  title: string
  subtitle: string
  description: string
  category: string
  gradientFrom: string
  gradientTo: string
  accentColor: string
  visible: boolean
  sortOrder: number
}

export const SHOWCASE_SLIDES_STATIC: ShowcaseSlide[] = [
  {
    id: 'reception',
    title: 'Reception & Welcome Area',
    subtitle: 'First Impressions',
    description: 'A warm, welcoming space designed to put patients at ease from the moment they arrive.',
    category: 'reception',
    gradientFrom: '#1e4030',
    gradientTo: '#122618',
    accentColor: '#4A9B6F',
    visible: true,
    sortOrder: 1,
  },
  {
    id: 'waiting',
    title: 'Patient Waiting Lounge',
    subtitle: 'Comfort & Calm',
    description: 'A comfortable, private lounge designed to make your wait as relaxed as possible.',
    category: 'waiting',
    gradientFrom: '#151e2a',
    gradientTo: '#0c1018',
    accentColor: '#5b8fb9',
    visible: true,
    sortOrder: 2,
  },
  {
    id: 'treatment',
    title: 'Treatment Rooms',
    subtitle: 'Clinical Precision',
    description: 'Fully equipped, sterile treatment rooms designed for comfort and clinical excellence.',
    category: 'treatment',
    gradientFrom: '#1e321e',
    gradientTo: '#122012',
    accentColor: '#4A9B6F',
    visible: true,
    sortOrder: 3,
  },
  {
    id: 'equipment',
    title: 'Advanced Equipment',
    subtitle: 'Modern Technology',
    description: 'State-of-the-art digital X-rays and precision instruments for accurate, safe treatment.',
    category: 'equipment',
    gradientFrom: '#16161f',
    gradientTo: '#0c0c14',
    accentColor: '#8b7ccc',
    visible: true,
    sortOrder: 4,
  },
  {
    id: 'team',
    title: 'Our Dedicated Team',
    subtitle: 'Expert Professionals',
    description: 'A team united by a passion for quality dental care and genuine warmth for every patient.',
    category: 'team',
    gradientFrom: '#2a1a10',
    gradientTo: '#180e07',
    accentColor: '#c97c3e',
    visible: true,
    sortOrder: 5,
  },
]

// ─── Trust Indicators ─────────────────────────────────────────
// Future: fetch from `site_settings` → trust_indicators

export type TrustIndicator = {
  id: string
  title: string
  description: string
  visible: boolean
  sortOrder: number
}

export const TRUST_INDICATORS_STATIC: TrustIndicator[] = [
  {
    id: 'nmc-registered',
    title: 'Experienced Team',
    description: 'Experienced team of dentists covering all areas of dentistry, from routine care to specialist treatment.',
    visible: true,
    sortOrder: 1,
  },
  {
    id: 'modern-technology',
    title: 'Modern Technology',
    description: 'Digital X-rays, advanced sterilisation and contemporary instruments for safer, more accurate treatment.',
    visible: true,
    sortOrder: 2,
  },
  {
    id: 'gentle-care',
    title: 'Gentle & Caring',
    description: 'We take time to understand your concerns and ensure every visit is comfortable and unhurried.',
    visible: true,
    sortOrder: 3,
  },
  {
    id: 'transparent-pricing',
    title: 'Transparent Pricing',
    description: 'Clear treatment estimates before we begin. No surprises, no hidden costs, ever.',
    visible: true,
    sortOrder: 4,
  },
]

// ─── FAQs ─────────────────────────────────────────────────────
// Future: fetch from `faqs` table

export type FAQ = {
  id: string
  q: string
  a: string
  category: string
  visible: boolean
  sortOrder: number
}

export const FAQS_STATIC: FAQ[] = [
  {
    id: 'visit-frequency',
    q: 'How often should I visit the dentist?',
    a: 'We recommend a visit every 6 months for routine checkups and professional cleanings. Patients with specific conditions such as gum disease or a history of cavities may benefit from more frequent appointments.',
    category: 'general',
    visible: true,
    sortOrder: 1,
  },
  {
    id: 'walk-ins',
    q: 'Do you accept walk-in patients?',
    a: 'We work primarily by appointment to minimise waiting times and ensure each patient receives full attention. For dental emergencies, call us directly and we will do our best to accommodate you the same day.',
    category: 'general',
    visible: true,
    sortOrder: 2,
  },
  {
    id: 'whitening-safe',
    q: 'Is teeth whitening safe?',
    a: 'Yes. Professional whitening supervised by our dentists uses clinically tested products that are safe for your enamel. We assess suitability during a consultation to ensure the best outcome.',
    category: 'cosmetic',
    visible: true,
    sortOrder: 3,
  },
  {
    id: 'child-first-visit',
    q: 'At what age should my child first see a dentist?',
    a: "We recommend the first visit by your child's first birthday, or within 6 months of the first tooth appearing. Early visits build healthy habits and allow any issues to be caught while they are simple to treat.",
    category: 'paediatric',
    visible: true,
    sortOrder: 4,
  },
  {
    id: 'treatment-costs',
    q: 'How much do treatments cost?',
    a: 'Costs vary by treatment. We provide a clear, detailed estimate before starting any procedure. Contact us or book a consultation, we are happy to discuss your needs and options.',
    category: 'general',
    visible: true,
    sortOrder: 5,
  },
  {
    id: 'dental-emergency',
    q: 'What should I do in a dental emergency?',
    a: 'Call us immediately at +977-1-4519594. For knocked-out teeth, keep the tooth moist (in milk or between cheek and gum) and come to us as quickly as possible.',
    category: 'emergency',
    visible: true,
    sortOrder: 6,
  },
  {
    id: 'implants-suitable',
    q: 'Am I suitable for dental implants?',
    a: 'Most adults with healthy gums and adequate bone density are suitable candidates. A consultation including dental X-rays will determine your eligibility.',
    category: 'implants',
    visible: true,
    sortOrder: 7,
  },
  {
    id: 'anxiety',
    q: 'I am anxious about dental treatment. Can you help?',
    a: 'Absolutely. Our team is experienced with anxious patients. Please let us know before your appointment so we can take extra time and adjust our approach to your comfort.',
    category: 'general',
    visible: true,
    sortOrder: 8,
  },
]

// ─── Testimonials ─────────────────────────────────────────────
// Future: fetch from `testimonials` table

export type Testimonial = {
  id: string
  name: string
  location: string
  text: string
  rating: number
  treatment?: string
  visible: boolean
  sortOrder: number
}

export const TESTIMONIALS_STATIC: Testimonial[] = [
  {
    id: 't1',
    name: 'Priya Sharma',
    location: 'Kathmandu',
    text: 'Exceptional care from the entire team. The doctors explained every step and made sure I was comfortable throughout. My smile has genuinely transformed.',
    rating: 5,
    treatment: 'Smile Makeover',
    visible: true,
    sortOrder: 1,
  },
  {
    id: 't2',
    name: 'Rajesh Thapa',
    location: 'Lalitpur',
    text: 'I had not visited a dentist in years and was quite nervous. The team was incredibly patient and professional. I left feeling relieved and well cared for.',
    rating: 5,
    treatment: 'Comprehensive Check-up',
    visible: true,
    sortOrder: 2,
  },
  {
    id: 't3',
    name: 'Sushila Maharjan',
    location: 'Bhaktapur',
    text: 'The paediatric dentist is wonderful with children. My kids actually look forward to their appointments now. Clean, modern clinic with a warm, welcoming team.',
    rating: 5,
    treatment: 'Pediatric Dentistry',
    visible: true,
    sortOrder: 3,
  },
  {
    id: 't4',
    name: 'Bikash Rai',
    location: 'Kathmandu',
    text: 'Had a dental implant done here. The procedure was smooth and recovery much faster than I expected. Very happy with the completely natural-looking result.',
    rating: 5,
    treatment: 'Dental Implant',
    visible: true,
    sortOrder: 4,
  },
  {
    id: 't5',
    name: 'Anita Karmacharya',
    location: 'Kathmandu',
    text: 'Dr. Sachin took his time explaining my full treatment plan. Professional, clean, and genuinely caring. Highly recommend for anyone looking for quality dental care.',
    rating: 5,
    treatment: 'Root Canal Treatment',
    visible: true,
    sortOrder: 5,
  },
]

// ─── Clinic Story ─────────────────────────────────────────────
// Future: fetch from `site_settings` → about / clinic_story

export const CLINIC_STORY_STATIC = {
  founded: '2006',
  mission:
    'To provide exceptional dental care that improves lives, through clinical excellence, genuine compassion, and an unwavering commitment to patient comfort.',
  vision:
    "To be Kathmandu's most trusted dental clinic, where every patient feels valued, every visit is comfortable, and every smile reflects our dedication to their health.",
  values: [
    {
      title: 'Excellence',
      description: 'We pursue the highest clinical standards through continuous learning and precision in every procedure.',
    },
    {
      title: 'Compassion',
      description: 'We listen, we care and we treat every patient as we would a member of our own family.',
    },
    {
      title: 'Integrity',
      description: 'Honest diagnosis, transparent costs and no unnecessary treatment, ever.',
    },
    {
      title: 'Innovation',
      description: 'Modern techniques and contemporary equipment for safer, more effective outcomes.',
    },
  ],
  whyChooseUs: [
    'Experienced team of dentists covering all areas of dentistry',
    'Care you can count on since 2006',
    'Modern digital X-ray and advanced sterilisation equipment',
    'Gentle approach, especially for anxious and paediatric patients',
    'Clear, upfront pricing, no surprises',
    'Convenient location in Nagpokhari, Naxal, Kathmandu',
  ],
  story:
    "Bright Smile Dental Clinic was founded in 2006 by Dr. Sachin Agrawal with a single vision: to provide dental care of the highest quality to every patient who walks through our doors.\n\nWhat started as a modest practice has grown into one of Kathmandu's most trusted dental clinics, with an experienced team of dentists covering all areas of dentistry, modern equipment, and over 5,000 happy patients served.\n\nOur philosophy is simple: every patient deserves excellent dental care delivered with genuine warmth. We believe a healthy smile has the power to transform lives, and we are privileged to be part of those transformations every day.",
} as const

// ─── Gallery ──────────────────────────────────────────────────
// Future: fetch from `gallery` table

export const GALLERY_CATEGORIES_STATIC = [
  { id: 'all', label: 'All Photos' },
  { id: 'clinic', label: 'Our Clinic' },
  { id: 'team', label: 'Our Team' },
  { id: 'equipment', label: 'Equipment' },
] as const

export type GalleryCategory = typeof GALLERY_CATEGORIES_STATIC[number]['id']

export type GalleryItem = {
  id: string
  title: string
  category: string
  gradientFrom: string
  gradientTo: string
  visible: boolean
  sortOrder: number
}

export const GALLERY_ITEMS_STATIC: GalleryItem[] = [
  { id: 'g1', title: 'Main Reception', category: 'clinic', gradientFrom: '#152a1e', gradientTo: '#0c1710', visible: true, sortOrder: 1 },
  { id: 'g2', title: 'Waiting Lounge', category: 'clinic', gradientFrom: '#151e2a', gradientTo: '#0c1018', visible: true, sortOrder: 2 },
  { id: 'g3', title: 'Treatment Room 1', category: 'clinic', gradientFrom: '#161f16', gradientTo: '#0c120c', visible: true, sortOrder: 3 },
  { id: 'g4', title: 'Treatment Room 2', category: 'clinic', gradientFrom: '#1e1a16', gradientTo: '#120f0c', visible: true, sortOrder: 4 },
  { id: 'g5', title: 'Digital X-Ray Suite', category: 'equipment', gradientFrom: '#16161f', gradientTo: '#0c0c14', visible: true, sortOrder: 5 },
  { id: 'g6', title: 'Sterilisation Unit', category: 'equipment', gradientFrom: '#1a1a1a', gradientTo: '#101010', visible: true, sortOrder: 6 },
  { id: 'g7', title: 'Our Doctor Team', category: 'team', gradientFrom: '#1a2a1a', gradientTo: '#0f1a0f', visible: true, sortOrder: 7 },
  { id: 'g8', title: 'Support Staff', category: 'team', gradientFrom: '#2a1a1a', gradientTo: '#1a0f0f', visible: true, sortOrder: 8 },
  { id: 'g9', title: 'Dental Chair Setup', category: 'equipment', gradientFrom: '#1a1e1f', gradientTo: '#0f1214', visible: true, sortOrder: 9 },
  { id: 'g10', title: 'Exterior View', category: 'clinic', gradientFrom: '#1e2a1e', gradientTo: '#121a12', visible: true, sortOrder: 10 },
  { id: 'g11', title: 'Consultation Area', category: 'clinic', gradientFrom: '#1a1a2e', gradientTo: '#0f0f1c', visible: true, sortOrder: 11 },
  { id: 'g12', title: 'Clinic Interior', category: 'clinic', gradientFrom: '#2a1e1a', gradientTo: '#1a120f', visible: true, sortOrder: 12 },
]

// ─── Patient Journey ──────────────────────────────────────────
// Future: fetch from `site_settings` → patient_journey

export type JourneyStep = {
  id: string
  step: number
  title: string
  subtitle: string
  description: string
  visible: boolean
  sortOrder: number
}

export const PATIENT_JOURNEY_STATIC: JourneyStep[] = [
  {
    id: 'book',
    step: 1,
    title: 'Book Your Visit',
    subtitle: 'Easy scheduling',
    description: 'Call, WhatsApp, or use our online form. We confirm your appointment the same day, no long waits.',
    visible: true,
    sortOrder: 1,
  },
  {
    id: 'consult',
    step: 2,
    title: 'Meet Your Dentist',
    subtitle: 'Expert consultation',
    description: 'Your lead dentist listens carefully, reviews your history, and performs a thorough oral examination.',
    visible: true,
    sortOrder: 2,
  },
  {
    id: 'diagnose',
    step: 3,
    title: 'Diagnosis & Imaging',
    subtitle: 'Digital X-rays',
    description: 'Where needed, digital X-rays provide instant, high-resolution images with minimal radiation.',
    visible: true,
    sortOrder: 3,
  },
  {
    id: 'plan',
    step: 4,
    title: 'Your Care Plan',
    subtitle: 'Transparent planning',
    description: 'We walk you through every recommended treatment, the full timeline, and the cost, before anything begins.',
    visible: true,
    sortOrder: 4,
  },
  {
    id: 'treat',
    step: 5,
    title: 'Comfortable Treatment',
    subtitle: 'Gentle precision',
    description: 'Treatment is delivered with a gentle technique, appropriate anaesthesia, and complete focus on your comfort.',
    visible: true,
    sortOrder: 5,
  },
  {
    id: 'followup',
    step: 6,
    title: 'Follow-Up Care',
    subtitle: 'Ongoing support',
    description: 'Clear aftercare instructions, a scheduled follow-up check, and a long-term plan to keep your smile healthy.',
    visible: true,
    sortOrder: 6,
  },
]

// ─── Why Choose Bright Smile ──────────────────────────────────
// Future: fetch from `site_settings` → why_choose

export type WhyChooseReason = {
  id: string
  title: string
  description: string
  visible: boolean
  sortOrder: number
}

export const WHY_CHOOSE_STATIC: WhyChooseReason[] = [
  {
    id: 'experienced-team',
    title: 'Experienced Team',
    description: 'Experienced team of dentists covering all areas of dentistry, with decades of combined clinical practice in Kathmandu.',
    visible: true,
    sortOrder: 1,
  },
  {
    id: 'modern-equipment',
    title: 'Modern Equipment',
    description: 'Digital X-rays, advanced sterilisation units and contemporary precision instruments for safer, more accurate treatment.',
    visible: true,
    sortOrder: 2,
  },
  {
    id: 'personalised-care',
    title: 'Personalised Care',
    description: 'We take time to understand each patient. Your care plan is designed for you, never a one-size-fits-all approach.',
    visible: true,
    sortOrder: 3,
  },
  {
    id: 'specialist-network',
    title: 'Specialist Network',
    description: 'Access to oral surgeons, periodontists and implant specialists, coordinated by your lead dentist, for your convenience.',
    visible: true,
    sortOrder: 4,
  },
  {
    id: 'convenient-location',
    title: 'Convenient Location',
    description: 'Centrally located in Nagpokhari, Naxal, easily accessible from Kathmandu and all surrounding areas.',
    visible: true,
    sortOrder: 5,
  },
  {
    id: 'transparent-pricing',
    title: 'Transparent Pricing',
    description: 'Full cost estimate before any treatment begins. No surprises, no hidden charges, complete financial clarity, always.',
    visible: true,
    sortOrder: 6,
  },
]

// ─── Before & After Cases ────────────────────────────────────
// Future: fetch from `gallery` table with category = 'before_after'

export type BeforeAfterCategory = 'smile-makeover' | 'orthodontics' | 'whitening' | 'implants'

export type BeforeAfterCase = {
  id: string
  title: string
  category: BeforeAfterCategory
  treatmentDetails: string
  duration: string
  beforeGradient: string
  afterGradient: string
  visible: boolean
  sortOrder: number
}

export const BEFORE_AFTER_STATIC: BeforeAfterCase[] = [
  {
    id: 'ba1',
    title: 'Complete Smile Makeover',
    category: 'smile-makeover',
    treatmentDetails: 'Porcelain Veneers + Whitening + Gum Contouring',
    duration: '6 weeks',
    beforeGradient: '#2d1a1a',
    afterGradient: '#0C3C2D',
    visible: true,
    sortOrder: 1,
  },
  {
    id: 'ba2',
    title: 'Orthodontic Correction',
    category: 'orthodontics',
    treatmentDetails: 'Clear Aligners, Full Treatment Course',
    duration: '18 months',
    beforeGradient: '#1a1a2d',
    afterGradient: '#0C3C2D',
    visible: true,
    sortOrder: 2,
  },
  {
    id: 'ba3',
    title: 'Professional Whitening',
    category: 'whitening',
    treatmentDetails: 'In-Clinic Power Whitening Session',
    duration: '1 session',
    beforeGradient: '#2d2a1a',
    afterGradient: '#0C3C2D',
    visible: true,
    sortOrder: 3,
  },
  {
    id: 'ba4',
    title: 'Dental Implant',
    category: 'implants',
    treatmentDetails: 'Titanium Implant + Ceramic Crown',
    duration: '4 months',
    beforeGradient: '#1a2d2d',
    afterGradient: '#0C3C2D',
    visible: true,
    sortOrder: 4,
  },
]

// ─── Certifications & Awards ──────────────────────────────────
// Future: fetch from `certifications` table

export type CertificationType = 'registration' | 'award' | 'certification'

export type Certification = {
  id: string
  title: string
  issuer: string
  year: string
  type: CertificationType
  visible: boolean
  sortOrder: number
}

export const CERTIFICATIONS_STATIC: Certification[] = [
  { id: 'nmc-reg', title: 'NMC Registered', issuer: 'Nepal Medical Council', year: '2006', type: 'registration', visible: true, sortOrder: 1 },
  { id: 'nmc-spec', title: 'MDS Specialist Verified', issuer: 'Nepal Medical Council', year: '2015', type: 'registration', visible: true, sortOrder: 2 },
  { id: 'implant-cert', title: 'Advanced Implantology', issuer: 'ITI International', year: '2019', type: 'certification', visible: true, sortOrder: 3 },
  { id: 'aligner-cert', title: 'Aligner Certified Provider', issuer: 'Clear Aligner Academy', year: '2021', type: 'certification', visible: true, sortOrder: 4 },
]
