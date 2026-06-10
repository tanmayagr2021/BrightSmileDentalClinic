import type { Metadata } from 'next'
import Link from 'next/link'
import { CLINIC_CONTACT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Book a dental appointment at Bright Smile Dental Clinic, Nagpokhari, Naxal, Kathmandu.',
}

export default function AppointmentsPage() {
  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Get Started
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Book an Appointment
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            Schedule your visit with our experienced dental team. We&apos;ll confirm your appointment by phone.
          </p>
        </div>
      </div>

      {/* Coming soon content */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-tint p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-primary" aria-hidden="true">
              <rect x="4" y="5" width="24" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 12h24M10 3v4M22 3v4M10 18h4M10 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-dark tracking-display">
            Online Booking Coming Soon
          </h2>
          <p className="mt-3 font-body text-sm text-gray-500 leading-relaxed">
            Our online appointment system is under development. In the meantime, please contact us
            directly to schedule your visit — we&apos;re happy to help.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href={`tel:${CLINIC_CONTACT.phone}`}
              className="flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Call {CLINIC_CONTACT.phone}
            </a>
            <a
              href={`https://wa.me/${CLINIC_CONTACT.phoneWhatsApp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-heading text-sm font-semibold text-dark transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
            >
              WhatsApp: {CLINIC_CONTACT.phoneWhatsApp}
            </a>
          </div>

          <p className="mt-8 font-body text-xs text-gray-400">
            Appointments with Dr. Sachin Agrawal & Dr. Binita Adhikari ·{' '}
            <Link href="/" className="text-primary hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
