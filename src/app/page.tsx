import type { Metadata } from 'next'
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

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. Hero — full-screen cinematic clinic showcase */}
      <ShowcaseSection />
      {/* 2. Trust — stats + quick credentials */}
      <StatsSection />
      <TrustSection />
      {/* 3. How it works — patient journey timeline */}
      <PatientJourneySection />
      {/* 4. Services */}
      <ServicesSection />
      {/* 5. Lead dentists */}
      <DoctorsSection />
      {/* 6. Social proof — before/after + testimonials */}
      <BeforeAfterSection />
      <TestimonialsSection />
      {/* 7. Differentiation */}
      <WhyChooseSection />
      {/* 8. FAQs — overcome objections */}
      <FaqSection />
      {/* 9. Conversion CTA */}
      <CtaSection />
    </PublicLayout>
  )
}
