import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import ShowcaseSection from '@/components/sections/ShowcaseSection'
import StatsSection from '@/components/sections/StatsSection'
import TrustSection from '@/components/sections/TrustSection'
import ServicesSection from '@/components/sections/ServicesSection'
import DoctorsSection from '@/components/sections/DoctorsSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import FaqSection from '@/components/sections/FaqSection'
import CtaSection from '@/components/sections/CtaSection'

export const metadata: Metadata = {
  title: 'Bright Smile Dental Clinic | Dentist in Kathmandu, Nepal',
  description:
    'NMC-registered dental clinic in Nagpokhari, Naxal, Kathmandu. 6 experienced dentists offering implants, orthodontics, root canal, cosmetic dentistry and more. Book your appointment today.',
}

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. Clinic experience — full-screen cinematic showcase */}
      <ShowcaseSection />
      {/* 2. Trust building — stats + credentials */}
      <StatsSection />
      <TrustSection />
      {/* 3. Services */}
      <ServicesSection />
      {/* 4. Lead dentists */}
      <DoctorsSection />
      {/* 5. Social proof */}
      <TestimonialsSection />
      {/* 6. FAQs */}
      <FaqSection />
      {/* 7. Appointment CTA */}
      <CtaSection />
    </PublicLayout>
  )
}
