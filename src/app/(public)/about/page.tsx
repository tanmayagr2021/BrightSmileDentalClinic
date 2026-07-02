import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLINIC_STORY_STATIC, HOMEPAGE_STATS } from '@/lib/constants'
import { buildCanonical } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/about') },
  title: 'About Us',
  description:
    'Learn about Bright Smile Dental Clinic — founded in 2013 in Kathmandu, our story, mission, vision and values behind a decade of trusted dental care.',
}

type AboutContent = {
  founded?: string
  story?: string
  mission?: string
  vision?: string
  values?: { title: string; description: string }[]
  why_choose_us?: string[]
}

const VALUE_ICONS: Record<string, string> = {
  Excellence: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  Compassion: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  Integrity: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  Innovation: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
}

export default async function AboutPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('site_settings')
    .select('about_content')
    .limit(1)
    .single()

  const db = (data?.about_content ?? null) as AboutContent | null

  const founded = db?.founded ?? CLINIC_STORY_STATIC.founded
  const story = db?.story ?? CLINIC_STORY_STATIC.story
  const mission = db?.mission ?? CLINIC_STORY_STATIC.mission
  const vision = db?.vision ?? CLINIC_STORY_STATIC.vision
  const values = (db?.values ?? null) ?? CLINIC_STORY_STATIC.values
  const whyChooseUs = (db?.why_choose_us ?? null) ?? CLINIC_STORY_STATIC.whyChooseUs

  const storyParagraphs = story.split('\n\n')

  return (
    <div className="bg-white">

      {/* ── Hero — full dark with ghost founding year ── */}
      <div
        className="relative overflow-hidden py-28 lg:py-40"
        style={{ background: '#0A1128' }}
      >
        {/* Architectural grid overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="about-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-grid)" />
        </svg>

        {/* Ghost founding year */}
        <span
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none font-display font-bold text-white/[0.03]"
          style={{ fontSize: 'clamp(8rem, 20vw, 16rem)' }}
          aria-hidden="true"
        >
          {founded}
        </span>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="inline-block h-px w-6 bg-gold/60" />
            Founded {founded}
          </span>

          {/* Headline */}
          <h1 className="mt-5 font-display text-6xl text-white tracking-display leading-[0.95] sm:text-7xl lg:text-[7rem]">
            Our<br />Story.
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-xl font-body text-base text-white/90 leading-relaxed">
            Over a decade of trusted dental care in the heart of Kathmandu — built on expertise, compassion and an uncompromising commitment to every patient.
          </p>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 border-t border-white/[0.07] pt-10 sm:grid-cols-4">
            {HOMEPAGE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="border-l border-white/[0.07] pl-6 first:border-l-0 first:pl-0"
              >
                <p className="font-display text-4xl text-white">
                  {stat.count}{stat.suffix}
                </p>
                <p className="mt-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Story — editorial pull-quote split ── */}
      <div className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-[1fr_1.3fr] items-start">

            {/* Left: pull-quote + mission / vision */}
            <div>
              <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="inline-block h-px w-6 bg-primary/60" />
                How We Started
              </span>

              <blockquote className="mt-8 font-display text-3xl text-dark tracking-display leading-[1.2] sm:text-4xl">
                &ldquo;{storyParagraphs[0]}&rdquo;
              </blockquote>

              <div className="mt-10 space-y-8 border-t border-gray-100 pt-10">
                <div>
                  <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                    Our Mission
                  </p>
                  <p className="font-body text-base text-gray-600 leading-relaxed">
                    {mission}
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    Our Vision
                  </p>
                  <p className="font-body text-base text-gray-600 leading-relaxed">
                    {vision}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: remaining story paragraphs */}
            <div className="space-y-5">
              {storyParagraphs.slice(1).map((para, i) => (
                <p key={i} className="font-body text-base text-gray-600 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Values — horizontal editorial rows ── */}
      <div
        className="py-24 lg:py-32"
        style={{ background: '#0A1128' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="inline-block h-px w-6 bg-gold/60" />
              What Guides Us
            </span>
            <h2 className="mt-5 font-display text-5xl text-white tracking-display sm:text-6xl">
              Our Values
            </h2>
          </div>

          <div>
            {values.map((value, i) => (
              <div
                key={value.title}
                className={[
                  'grid items-center border-b border-white/[0.06] py-12 lg:py-16',
                  'grid-cols-[4rem_1fr] gap-8 sm:grid-cols-[6rem_1fr_1.5fr] sm:gap-12 lg:grid-cols-[8rem_1fr_2fr] lg:gap-20',
                  i === 0 ? 'border-t border-white/[0.06]' : '',
                ].join(' ')}
              >
                {/* Ghost number */}
                <span className="select-none font-display text-4xl font-bold tabular-nums text-white/[0.07] sm:text-5xl lg:text-7xl">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Title */}
                <h3 className="font-display text-2xl text-white tracking-display sm:text-3xl">
                  {value.title}
                </h3>

                {/* Description — hidden on mobile */}
                <p className="hidden font-body text-sm text-white/85 leading-relaxed sm:block">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why Choose Us — editorial numbered list + inline CTA ── */}
      <div className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 lg:gap-24 items-start">

            {/* Left: numbered list */}
            <div>
              <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="inline-block h-px w-6 bg-primary/60" />
                Why Bright Smile
              </span>
              <h2 className="mt-5 font-display text-4xl text-dark tracking-display">
                What Sets Us Apart
              </h2>

              <div className="mt-10 divide-y divide-gray-100">
                {whyChooseUs.map((point, i) => (
                  <div key={point} className="flex items-center gap-8 py-6">
                    <span className="w-12 flex-shrink-0 font-display text-4xl font-bold tabular-nums text-gray-100">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-body text-base text-gray-600 leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: inline CTA — no card */}
            <div>
              <h3 className="font-display text-3xl text-dark tracking-display leading-snug">
                Ready to experience the difference?
              </h3>
              <p className="mt-5 font-body text-base text-gray-500 leading-relaxed">
                Join over 1,000 patients who trust Bright Smile for their dental care. Book your first appointment today.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
