import type { Metadata } from 'next'
import Link from 'next/link'
import { buildCanonical } from '@/lib/schema'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/privacy') },
  title: 'Privacy Policy',
  description: 'Privacy policy for Bright Smile Dental Clinic — how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl text-dark tracking-display">Privacy Policy</h1>
          <p className="mt-3 font-body text-sm text-gray-500">Last updated: June 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none font-body text-sm leading-relaxed text-gray-600 space-y-8">
          <section>
            <h2 className="font-heading text-base font-semibold text-dark mb-3">1. Information We Collect</h2>
            <p>When you use our website or book an appointment, we may collect your name, contact details, and basic health information necessary to provide dental care. We do not sell or share your data with third parties.</p>
          </section>
          <section>
            <h2 className="font-heading text-base font-semibold text-dark mb-3">2. How We Use Your Information</h2>
            <p>We use your information solely to schedule and manage your appointments, send appointment reminders, and improve our services. Your medical information is kept strictly confidential.</p>
          </section>
          <section>
            <h2 className="font-heading text-base font-semibold text-dark mb-3">3. Data Security</h2>
            <p>Your data is stored securely and accessed only by authorised clinic staff. We implement industry-standard security measures to protect your personal information.</p>
          </section>
          <section>
            <h2 className="font-heading text-base font-semibold text-dark mb-3">4. Contact</h2>
            <p>For any privacy-related questions, contact us at <a href="mailto:drsachin1108@gmail.com" className="text-primary hover:underline">drsachin1108@gmail.com</a>.</p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
