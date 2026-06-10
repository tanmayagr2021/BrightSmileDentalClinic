import type { Metadata } from 'next'
import Link from 'next/link'
import TestimonialsSection from '@/components/sections/TestimonialsSection'

export const metadata: Metadata = {
  title: 'Patient Testimonials',
  description: 'Read what patients say about their experience at Bright Smile Dental Clinic, Kathmandu.',
}

export default function TestimonialsPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Patient Stories
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            What Our Patients Say
          </h1>
        </div>
      </div>
      <TestimonialsSection />
      <div className="pb-20 text-center">
        <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">← Back to home</Link>
      </div>
    </div>
  )
}
