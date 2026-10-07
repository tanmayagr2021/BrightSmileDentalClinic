import type { Metadata } from 'next'
import { buildCanonical } from '@/lib/schema'
import VirtualTourExperience from '@/components/virtual-tour/VirtualTourExperience'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/virtual-tour') },
  title: 'Virtual Clinic Tour — Walk Through Our Clinic',
  description:
    'Walk through Bright Smile Dental Clinic before you visit — from the front desk and waiting lounge into each of our three treatment rooms.',
}

export default function VirtualTourPage() {
  return <VirtualTourExperience />
}
