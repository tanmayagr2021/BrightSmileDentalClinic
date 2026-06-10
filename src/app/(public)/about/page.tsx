import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Bright Smile Dental Clinic — our story, mission, and commitment to exceptional dental care in Kathmandu.',
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Our Story
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">About Us</h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            A decade of trusted dental care in the heart of Kathmandu.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl border border-gray-100 bg-tint p-12 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-dark tracking-display">Full Page Coming Soon</h2>
          <p className="mt-3 font-body text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            We&apos;re putting together our story. Bright Smile Dental Clinic has been serving Kathmandu
            for over a decade with expert, compassionate dental care.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/doctors" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark">
              Meet Our Doctors
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-dark transition-all hover:border-primary hover:text-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
