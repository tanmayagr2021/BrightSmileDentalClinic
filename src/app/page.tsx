import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICE_CATEGORIES_STATIC, OPENING_HOURS, CLINIC_CONTACT, HOMEPAGE_STATS } from '@/lib/constants'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import {
  getContentBlocks,
  getTrustIndicators,
  getWhyChooseReasons,
  getPatientJourneySteps,
  getBeforeAfterCases,
  getCertifications,
  getTeamMembers,
} from '@/lib/content'

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`
}

type DbHour = { day_of_week: number; is_open: boolean; open_time: string | null; close_time: string | null }

function buildOpeningHours(dbHours: DbHour[]): { days: string; hours: string; open: boolean }[] {
  if (!dbHours.length) return [...OPENING_HOURS]
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const sorted = [...dbHours].sort((a, b) => a.day_of_week - b.day_of_week)
  const groups: { days: string[]; hours: string; open: boolean }[] = []
  for (const row of sorted) {
    const hrs = row.is_open && row.open_time && row.close_time
      ? `${formatTime(row.open_time)} – ${formatTime(row.close_time)}`
      : 'Closed'
    const last = groups[groups.length - 1]
    if (last && last.hours === hrs && last.open === row.is_open) {
      last.days.push(DAY[row.day_of_week])
    } else {
      groups.push({ days: [DAY[row.day_of_week]], hours: hrs, open: row.is_open })
    }
  }
  return groups.map((g) => ({
    days: g.days.length === 1 ? g.days[0] : `${g.days[0]} – ${g.days[g.days.length - 1]}`,
    hours: g.hours,
    open: g.open,
  }))
}
import PublicLayout from '@/components/layout/PublicLayout'
import ScrollDepthTracker from '@/components/analytics/ScrollDepthTracker'
import ShowcaseSection from '@/components/sections/ShowcaseSection'
import StatsSection from '@/components/sections/StatsSection'
import TrustSection from '@/components/sections/TrustSection'
import PatientJourneySection from '@/components/sections/PatientJourneySection'
import ServicesSection from '@/components/sections/ServicesSection'
import DoctorsSection from '@/components/sections/DoctorsSection'
import BeforeAfterSection from '@/components/sections/BeforeAfterSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import WhyChooseSection from '@/components/sections/WhyChooseSection'
import FaqSection from '@/components/sections/FaqSection'
import CtaSection from '@/components/sections/CtaSection'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bright Smile Dental Clinic | Dentist in Kathmandu, Nepal',
  description:
    'NMC-registered dental clinic in Nagpokhari, Naxal, Kathmandu. 6 experienced dentists offering implants, orthodontics, root canal, cosmetic dentistry and more. Book your appointment today.',
  keywords: ['dentist Kathmandu', 'dental clinic Nepal', 'dental implants Kathmandu', 'orthodontics Nepal', 'root canal Kathmandu', 'teeth whitening Nepal'],
  openGraph: {
    title: 'Bright Smile Dental Clinic | Dentist in Kathmandu',
    description: 'NMC-registered dental clinic in Nagpokhari, Naxal. 6 experienced dentists, modern equipment, transparent pricing.',
    locale: 'en_GB',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = createAdminClient()

  const [
    { data: testimonialData },
    { data: faqData },
    { data: sectionData },
    { data: doctorData },
    { data: serviceCategoryData },
    { data: showcaseData },
    { data: openingHoursData },
    { data: siteSettingsData },
    { data: heroTourRoomData },
    content,
    trustIndicators,
    whyChooseReasons,
    patientJourneySteps,
    beforeAfterCases,
    certifications,
    teamMembers,
  ] = await Promise.all([
    supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(10),
    supabase
      .from('faqs')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
    supabase
      .from('service_categories')
      .select('id, slug, name, sort_order, is_visible, thumbnail_url')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('showcase_slides')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('opening_hours')
      .select('day_of_week, is_open, open_time, close_time')
      .order('day_of_week', { ascending: true }),
    supabase
      .from('site_settings')
      .select('phone_primary, phone_whatsapp, email_appointments, address_line1, address_line2, address_city, google_maps_url, stat_patients, stat_years, stat_treatments, stat_team_label')
      .limit(1)
      .single(),
    supabase
      .from('virtual_tour_rooms')
      .select('name, thumbnail:media_library!virtual_tour_rooms_thumbnail_media_id_fkey(bucket, file_path)')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
      .limit(1),
    getContentBlocks(),
    getTrustIndicators(),
    getWhyChooseReasons(),
    getPatientJourneySteps(),
    getBeforeAfterCases(),
    getCertifications(),
    getTeamMembers(),
  ])

  const sections = sectionData ?? []
  const testimonials = testimonialData ?? []
  const faqs = faqData ?? []
  const doctors = doctorData ?? []
  const showcaseSlides = showcaseData ?? []
  const openingHours = buildOpeningHours(openingHoursData ?? [])
  const heroTourRoom = heroTourRoomData?.[0] as { name: string; thumbnail: { bucket: string; file_path: string } | null } | undefined
  const virtualTourImageUrl = heroTourRoom?.thumbnail ? mediaDisplayUrl(heroTourRoom.thumbnail) : null
  const virtualTourRoomName = heroTourRoom?.name ?? null
  const s = siteSettingsData as {
    phone_primary?: string; phone_whatsapp?: string; email_appointments?: string
    address_line1?: string; address_line2?: string; address_city?: string; google_maps_url?: string
    stat_patients?: number; stat_years?: number; stat_treatments?: number; stat_team_label?: string
  } | null
  const clinicPhone = s?.phone_primary ?? CLINIC_CONTACT.phone
  const clinicEmail = s?.email_appointments ?? CLINIC_CONTACT.emailAppointments
  const addressParts = [s?.address_line1, s?.address_line2, s?.address_city].filter(Boolean)
  const clinicAddress = addressParts.length > 0 ? addressParts.join(', ') : CLINIC_CONTACT.addressFull
  const clinicMapsUrl = s?.google_maps_url ?? CLINIC_CONTACT.googleMapsUrl

  const homepageStats = [
    { count: s?.stat_patients ?? HOMEPAGE_STATS[0].count, suffix: '+', label: HOMEPAGE_STATS[0].label },
    { count: s?.stat_years ?? HOMEPAGE_STATS[1].count, suffix: '+', label: HOMEPAGE_STATS[1].label },
    { count: s?.stat_treatments ?? HOMEPAGE_STATS[2].count, suffix: '+', label: HOMEPAGE_STATS[2].label },
    { count: doctorData?.length ?? HOMEPAGE_STATS[3].count, suffix: '', label: s?.stat_team_label ?? HOMEPAGE_STATS[3].label },
  ]

  // Merge DB visibility/order with static content (shortDescription fallback, subServiceCount)
  const services = (serviceCategoryData ?? [])
    .map((dbRow) => {
      const staticEntry = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === dbRow.slug)
      if (!staticEntry) return null
      return {
        slug: dbRow.slug,
        name: dbRow.name,
        shortDescription: (dbRow as Record<string, unknown>).short_description as string | null ?? staticEntry.shortDescription,
        subServiceCount: staticEntry.subServices.length,
        thumbnail_url: dbRow.thumbnail_url ?? null,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  const sectionVisible = (key: string): boolean => {
    const found = sections.find((s) => s.section_key === key)
    return found ? found.is_visible : true
  }

  return (
    <PublicLayout>
      <ScrollDepthTracker />
      {/* 1. Hero — full-screen cinematic clinic showcase (always visible) */}
      <ShowcaseSection
        slides={showcaseSlides}
        openingHours={openingHours}
        phone={clinicPhone}
        content={content}
        virtualTourImageUrl={virtualTourImageUrl}
        virtualTourRoomName={virtualTourRoomName}
      />
      {/* 2. Trust — stats + quick credentials */}
      {sectionVisible('stats') && <StatsSection stats={homepageStats} />}
      {sectionVisible('trust') && <TrustSection content={content} indicators={trustIndicators} />}
      {/* 3. How it works — patient journey timeline */}
      <PatientJourneySection content={content} steps={patientJourneySteps} />
      {/* 4. Lead dentists — meet the team before seeing services */}
      {sectionVisible('doctors') && <DoctorsSection doctors={doctors} content={content} teamMembers={teamMembers} />}
      {/* 5. Services */}
      {sectionVisible('services') && <ServicesSection services={services} content={content} />}
      {/* 6. Social proof — before/after + testimonials */}
      <BeforeAfterSection content={content} cases={beforeAfterCases} />
      {sectionVisible('testimonials') && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      {/* 7. Differentiation */}
      <WhyChooseSection content={content} reasons={whyChooseReasons} certifications={certifications} />
      {/* 8. FAQs — overcome objections */}
      {sectionVisible('faq') && <FaqSection faqs={faqs} />}
      {/* 9. Conversion CTA (always visible) */}
      <CtaSection phone={clinicPhone} email={clinicEmail} address={clinicAddress} mapsUrl={clinicMapsUrl} openingHours={openingHours} content={content} />
    </PublicLayout>
  )
}
