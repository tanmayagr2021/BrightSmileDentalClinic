import type { Metadata } from 'next'
import Link from 'next/link'
import { SERVICE_CATEGORIES_STATIC } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Comprehensive dental services at Bright Smile Dental Clinic — general dentistry, cosmetic dentistry, orthodontics, implants, and more.',
}

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            What We Offer
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Our Services
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            Comprehensive dental care for the whole family — from routine check-ups to advanced treatments.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATEGORIES_STATIC.map((service) => (
            <div
              key={service.slug}
              id={service.slug}
              className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm scroll-mt-24"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-tint text-primary">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M9 3C6.5 3 4 5.5 4 8.5c0 2 .8 3.8 1.2 5.5.4 2 .8 4 1.3 5.5.3 1 .8 1.5 1.5 1.5s1.2-.3 1.5-1.5c.3-1 .5-2.5.5-3.5 0-1 .5-1.8 1.5-2 .5 0 1-.3 1.5-.3s1 .3 1.5.3c1 .2 1.5 1 1.5 2 0 1 .2 2.5.5 3.5.3 1.2.8 1.5 1.5 1.5s1.2-.5 1.5-1.5c.5-1.5.9-3.5 1.3-5.5.4-1.7 1.2-3.5 1.2-5.5C20 5.5 17.5 3 15 3c-1.2 0-2 .4-3 1.2C11 3.4 10.2 3 9 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-heading text-base font-semibold text-dark">{service.name}</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-gray-500">{service.description}</p>
              <div className="mt-4 inline-block rounded-full bg-tint px-3 py-1 font-heading text-xs text-primary">
                Full details coming soon
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="font-body text-sm text-gray-400 mb-4">Have questions about a specific treatment?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
