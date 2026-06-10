import type { Metadata } from 'next'
import Link from 'next/link'
import { CLINIC_STORY_STATIC, HOMEPAGE_STATS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Bright Smile Dental Clinic — founded in 2013 in Kathmandu, our story, mission, vision and values behind a decade of trusted dental care.',
}

const VALUE_ICONS: Record<string, string> = {
  Excellence: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  Compassion: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  Integrity: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  Innovation: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
}

export default function AboutPage() {
  const storyParagraphs = CLINIC_STORY_STATIC.story.split('\n\n')

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-tint border-b border-gray-100 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-4 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Founded {CLINIC_STORY_STATIC.founded}
          </span>
          <h1 className="font-display text-5xl text-dark sm:text-6xl tracking-display">
            Our Story
          </h1>
          <p className="mt-5 max-w-2xl font-body text-lg text-gray-500 leading-relaxed">
            Over a decade of trusted dental care in the heart of Kathmandu — built on expertise, compassion and an uncompromising commitment to every patient.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
            {HOMEPAGE_STATS.map((stat) => (
              <div key={stat.label} className="px-8 py-8 text-center">
                <p className="font-display text-4xl text-primary tracking-tight">
                  {stat.count}{stat.suffix}
                </p>
                <p className="mt-1 font-heading text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[3fr_2fr]">
          <div>
            <span className="eyebrow mb-4 inline-flex items-center gap-2">
              <span className="inline-block h-px w-5 bg-primary" />
              How We Started
            </span>
            <h2 className="font-display text-4xl text-dark tracking-display mb-8">
              A Practice Built on Purpose
            </h2>
            <div className="space-y-5">
              {storyParagraphs.map((para, i) => (
                <p key={i} className="font-body text-base text-gray-600 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-dark p-7 text-white">
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                Our Mission
              </p>
              <p className="font-body text-base text-white/85 leading-relaxed">
                {CLINIC_STORY_STATIC.mission}
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-7">
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-primary/70 mb-3">
                Our Vision
              </p>
              <p className="font-body text-base text-gray-700 leading-relaxed">
                {CLINIC_STORY_STATIC.vision}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-tint border-y border-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="eyebrow mb-3 inline-flex items-center gap-2">
              <span className="inline-block h-px w-5 bg-primary" />
              What Guides Us
            </span>
            <h2 className="font-display text-4xl text-dark tracking-display">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CLINIC_STORY_STATIC.values.map((value) => (
              <div key={value.title} className="rounded-2xl bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary" aria-hidden="true">
                    <path d={VALUE_ICONS[value.title] ?? ''} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-heading text-base font-semibold text-dark mb-2">{value.title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why choose us */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow mb-4 inline-flex items-center gap-2">
              <span className="inline-block h-px w-5 bg-primary" />
              Why Bright Smile
            </span>
            <h2 className="font-display text-4xl text-dark tracking-display mb-8">
              What Sets Us Apart
            </h2>
            <div className="space-y-4">
              {CLINIC_STORY_STATIC.whyChooseUs.map((point) => (
                <div key={point} className="flex items-start gap-4">
                  <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true">
                    <circle cx="8" cy="8" r="7" fill="#4A9B6F" fillOpacity="0.12" />
                    <path d="M5 8l2 2 4-4" stroke="#4A9B6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-body text-base text-gray-600 leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="flex items-center">
            <div className="w-full rounded-2xl border border-gray-100 bg-tint p-10 text-center shadow-sm">
              <h3 className="font-display text-2xl text-dark tracking-display">
                Ready to experience the difference?
              </h3>
              <p className="mt-4 font-body text-base text-gray-500 leading-relaxed">
                Join over 1,000 patients who trust Bright Smile for their dental care. Book your first appointment today.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/appointments"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-[0.98]"
                >
                  Book an Appointment
                </Link>
                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-7 py-3.5 font-heading text-sm font-semibold text-gray-700 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
                >
                  Meet Our Doctors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
