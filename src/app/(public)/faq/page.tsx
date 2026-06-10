import type { Metadata } from 'next'
import Link from 'next/link'
import FaqSection from '@/components/sections/FaqSection'

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Frequently asked questions about dental care at Bright Smile Dental Clinic, Kathmandu.',
}

export default function FaqPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Help Centre
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Frequently Asked Questions
          </h1>
        </div>
      </div>
      <FaqSection />
      <div className="pb-20 text-center">
        <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">← Back to home</Link>
      </div>
    </div>
  )
}
