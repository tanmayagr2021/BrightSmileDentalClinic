import type { Metadata } from 'next'
import AppointmentFlow from '@/components/sections/AppointmentFlow'

export const metadata: Metadata = {
  title: 'Book an Appointment | Bright Smile Dental Clinic',
  description:
    'Book a dental appointment with Dr. Sachin Agrawal or Dr. Binita Adhikari at Bright Smile Dental Clinic, Nagpokhari, Naxal, Kathmandu. Quick and easy online request.',
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string; cancel_error?: string }>
}) {
  const params = await searchParams
  const cancelled = params.cancelled === 'true'
  const cancelError = params.cancel_error

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

      {/* Cancellation banners */}
      {cancelled && (
        <div className="border-b border-green-100 bg-green-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 8l2.5 2.5L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-body text-sm text-green-800">
              Your appointment has been cancelled successfully. You may book a new appointment below.
            </p>
          </div>
        </div>
      )}
      {cancelError && (
        <div className="border-b border-red-100 bg-red-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 5v3.5M8 10.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="font-body text-sm text-red-800">{cancelError}</p>
          </div>
        </div>
      )}

      {/* Multi-step flow */}
      <AppointmentFlow />
    </div>
  )
}
