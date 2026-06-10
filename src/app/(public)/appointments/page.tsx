import type { Metadata } from 'next'
import AppointmentFlow from '@/components/sections/AppointmentFlow'

export const metadata: Metadata = {
  title: 'Book an Appointment | Bright Smile Dental Clinic',
  description:
    'Book a dental appointment with Dr. Sachin Agrawal or Dr. Binita Adhikari at Bright Smile Dental Clinic, Nagpokhari, Naxal, Kathmandu. Quick and easy online request.',
}

export default function AppointmentsPage() {
  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Get Started
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">
            Book an Appointment
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            Request a time with our lead dentists in a few simple steps. We&apos;ll call to confirm your slot — usually within 2 hours.
          </p>
        </div>
      </div>

      {/* Multi-step flow */}
      <AppointmentFlow />
    </div>
  )
}
