import type { Metadata } from 'next'
import Link from 'next/link'
import { CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Bright Smile Dental Clinic in Nagpokhari, Naxal, Kathmandu. Call, WhatsApp, or email us.',
}

export default function ContactPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Get in Touch
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">Contact Us</h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            We&apos;re here to answer your questions and help you book your next appointment.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Contact details */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-primary mb-5">Phone & WhatsApp</h2>
              <a href={`tel:${CLINIC_CONTACT.phone}`} className="block font-body text-lg text-dark hover:text-primary transition-colors mb-2">{CLINIC_CONTACT.phone}</a>
              <a href={`https://wa.me/${CLINIC_CONTACT.phoneWhatsApp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block font-body text-sm text-gray-500 hover:text-primary transition-colors">
                WhatsApp: {CLINIC_CONTACT.phoneWhatsApp}
              </a>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-primary mb-5">Email</h2>
              <a href={`mailto:${CLINIC_CONTACT.emailAppointments}`} className="block font-body text-sm text-dark hover:text-primary transition-colors mb-1">{CLINIC_CONTACT.emailAppointments}</a>
              <a href={`mailto:${CLINIC_CONTACT.email}`} className="block font-body text-sm text-gray-500 hover:text-primary transition-colors">{CLINIC_CONTACT.email}</a>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-primary mb-5">Location</h2>
              <p className="font-body text-sm text-dark leading-relaxed">{CLINIC_CONTACT.addressFull}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-primary mb-5">Opening Hours</h2>
              <div className="space-y-2">
                {OPENING_HOURS.map((h) => (
                  <div key={h.days} className="flex justify-between font-body text-sm">
                    <span className="text-gray-500">{h.days}</span>
                    <span className="font-medium text-dark">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form placeholder */}
          <div className="rounded-2xl border border-gray-100 bg-tint p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-dark tracking-display">Contact Form Coming Soon</h2>
            <p className="mt-2 font-body text-sm text-gray-500 max-w-xs">
              Our contact form is under development. Please reach us by phone or email in the meantime.
            </p>
            <a href={`tel:${CLINIC_CONTACT.phone}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark">
              Call Now
            </a>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
