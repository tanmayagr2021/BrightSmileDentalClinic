import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICE_CATEGORIES_STATIC } from '@/lib/constants'
import PublicLayout from '@/components/layout/PublicLayout'
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
      .select('id, slug, name, sort_order, is_visible')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('showcase_slides')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
  ])

  const sections = sectionData ?? []
  const testimonials = testimonialData ?? []
  const faqs = faqData ?? []
  const doctors = doctorData ?? []
  const showcaseSlides = showcaseData ?? []

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
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  const sectionVisible = (key: string): boolean => {
    const found = sections.find((s) => s.section_key === key)
    return found ? found.is_visible : true
  }

  return (
    <PublicLayout>
      {/* 1. Hero — full-screen cinematic clinic showcase (always visible) */}
      <ShowcaseSection slides={showcaseSlides} />
      {/* 2. Trust — stats + quick credentials */}
      {sectionVisible('stats') && <StatsSection />}
      {sectionVisible('trust') && <TrustSection />}
      {/* 3. How it works — patient journey timeline */}
      <PatientJourneySection />
      {/* 4. Services */}
      {sectionVisible('services') && <ServicesSection services={services} />}
      {/* 5. Lead dentists */}
      {sectionVisible('doctors') && <DoctorsSection doctors={doctors} />}
      {/* 6. Social proof — before/after + testimonials */}
      <BeforeAfterSection />
      {sectionVisible('testimonials') && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      {/* 7. Differentiation */}
      <WhyChooseSection />
      {/* 8. FAQs — overcome objections */}
      {sectionVisible('faq') && <FaqSection faqs={faqs} />}
      {/* 9. Conversion CTA (always visible) */}
      <CtaSection />
    </PublicLayout>
  )
}
