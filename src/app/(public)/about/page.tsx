import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLINIC_STORY_STATIC, HOMEPAGE_STATS } from '@/lib/constants'
import { buildCanonical } from '@/lib/schema'
import { getContentBlocks } from '@/lib/content'
import { pick, interpolate } from '@/lib/content-client'
import TrustWallSection, { type PublicTrustItem } from '@/components/trust-wall/TrustWallSection'
import type { DoctorRow } from '@/types/db'
import { doctorColor, doctorInitials } from '@/lib/doctor-display'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/about') },
  title: 'About Us',
  description:
    'Learn about Bright Smile Dental Clinic, founded in 2006 in Kathmandu, our story, mission, vision and values behind two decades of trusted dental care.',
}

type AboutContent = {
  founded?: string
  story?: string
  mission?: string
  vision?: string
  values?: { title: string; description: string }[]
  why_choose_us?: string[]
}

export default async function AboutPage() {
  const supabase = createAdminClient()
  const [{ data }, { data: statsData }, { count: doctorCount }, content, { data: trustItems }, { data: teamData }] = await Promise.all([
    supabase.from('site_settings').select('about_content').limit(1).single(),
    supabase.from('site_settings').select('stat_patients, stat_years, stat_treatments, stat_team_label').limit(1).single(),
    supabase.from('doctors').select('id', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
    getContentBlocks(),
    supabase
      .from('trust_wall_items')
      .select('*, image:media_library(*)')
      .eq('is_visible', true)
      .order('module', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
  ])

  const teamDoctors: DoctorRow[] = teamData ?? []
  const teamLeads = teamDoctors.filter((d) => d.doctor_type === 'lead')
  const teamSpecialists = teamDoctors.filter((d) => d.doctor_type === 'specialist')

  const db = (data?.about_content ?? null) as AboutContent | null

  const founded = db?.founded ?? CLINIC_STORY_STATIC.founded
  const story = db?.story ?? CLINIC_STORY_STATIC.story
  const mission = db?.mission ?? CLINIC_STORY_STATIC.mission
  const vision = db?.vision ?? CLINIC_STORY_STATIC.vision
  const values = (db?.values ?? null) ?? CLINIC_STORY_STATIC.values
  const whyChooseUs = (db?.why_choose_us ?? null) ?? CLINIC_STORY_STATIC.whyChooseUs

  const storyParagraphs = story.split('\n\n')

  const s = statsData as { stat_patients?: number; stat_years?: number; stat_treatments?: number; stat_team_label?: string } | null
  const stats = [
    { count: s?.stat_patients ?? HOMEPAGE_STATS[0].count, suffix: '+', label: HOMEPAGE_STATS[0].label },
    { count: s?.stat_years ?? HOMEPAGE_STATS[1].count, suffix: '+', label: HOMEPAGE_STATS[1].label },
    { count: doctorCount ?? HOMEPAGE_STATS[2].count, suffix: '', label: s?.stat_team_label ?? HOMEPAGE_STATS[2].label },
  ]

  return (
    <div className="bg-white">

      {/* ── Hero — full dark with ghost founding year ── */}
      <div
        className="relative overflow-hidden py-28 lg:py-40"
        style={{ background: '#0E1B2E' }}
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
            {interpolate(pick(content, 'about.hero.eyebrow_template', 'Founded {year}'), { year: founded })}
          </span>

          {/* Headline */}
          <h1 className="mt-5 font-display text-6xl text-white tracking-display leading-[0.95] sm:text-7xl lg:text-[7rem]">
            {pick(content, 'about.hero.headline_line1', 'Our')}<br />{pick(content, 'about.hero.headline_line2', 'Story.')}
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-xl font-body text-base text-white/90 leading-relaxed">
            {pick(content, 'about.hero.description', '20 years of trusted dental care in the heart of Kathmandu, built on expertise, compassion and an uncompromising commitment to every patient.')}
          </p>

          {/* Stats strip */}
          <div className={`mt-16 grid border-t border-white/[0.07] pt-10 ${stats.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {stats.map((stat) => (
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
                {pick(content, 'about.story.eyebrow', 'How We Started')}
              </span>

              <blockquote className="mt-8 font-display text-3xl text-dark tracking-display leading-[1.2] sm:text-4xl">
                &ldquo;{storyParagraphs[0]}&rdquo;
              </blockquote>

              <div className="mt-10 space-y-8 border-t border-gray-100 pt-10">
                <div>
                  <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                    {pick(content, 'about.story.mission_label', 'Our Mission')}
                  </p>
                  <p className="font-body text-base text-gray-600 leading-relaxed">
                    {mission}
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-600">
                    {pick(content, 'about.story.vision_label', 'Our Vision')}
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

      {/* ── Our Team — faces, not bios ── */}
      {teamDoctors.length > 0 && (
        <div className="bg-ivory py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="inline-block h-px w-6 bg-primary/60" />
                Our Team
                <span className="inline-block h-px w-6 bg-primary/60" />
              </span>
              <h2 className="mt-5 font-display text-4xl text-dark tracking-display sm:text-5xl">
                The People Behind Bright Smile
              </h2>
            </div>

            {/* Lead dentists — large circular portraits */}
            <div className="flex flex-wrap justify-center gap-12 sm:gap-16">
              {teamLeads.map((doc) => (
                <div key={doc.id} className="flex flex-col items-center text-center">
                  <div
                    className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full ring-4 ring-white shadow-premium sm:h-40 sm:w-40"
                    style={{ backgroundColor: doctorColor(doc) }}
                  >
                    {doc.profile_image_url ? (
                      <Image src={doc.profile_image_url} alt={doc.full_name} fill className="object-cover object-top" sizes="160px" />
                    ) : (
                      <span className="font-display text-4xl font-bold text-white">{doctorInitials(doc)}</span>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-xl text-dark tracking-display">{doc.full_name}</h3>
                  <p className="mt-1 font-body text-sm text-gray-600">{doc.title}</p>
                </div>
              ))}
            </div>

            {/* Wider clinical team — smaller circular portraits */}
            {teamSpecialists.length > 0 && (
              <div className="mt-16 flex flex-wrap justify-center gap-8 border-t border-gray-200 pt-16 sm:gap-10">
                {teamSpecialists.map((doc) => (
                  <div key={doc.id} className="flex flex-col items-center text-center">
                    <div
                      className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-2 ring-white shadow-card sm:h-24 sm:w-24"
                      style={{ backgroundColor: doctorColor(doc) }}
                    >
                      {doc.profile_image_url ? (
                        <Image src={doc.profile_image_url} alt={doc.full_name} fill className="object-cover object-top" sizes="96px" />
                      ) : (
                        <span className="font-display text-lg font-bold text-white">{doctorInitials(doc)}</span>
                      )}
                    </div>
                    <h3 className="mt-3 font-heading text-sm font-semibold text-dark">{doc.full_name}</h3>
                    <p className="mt-0.5 font-body text-xs text-gray-600">{doc.title}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-16 flex justify-center">
              <Link
                href="/doctors"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-heading text-sm font-semibold text-dark transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
              >
                Meet Our Doctors
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Values — horizontal editorial rows ── */}
      <div
        className="py-24 lg:py-32"
        style={{ background: '#0E1B2E' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="inline-block h-px w-6 bg-gold/60" />
              {pick(content, 'about.values.eyebrow', 'What Guides Us')}
            </span>
            <h2 className="mt-5 font-display text-5xl text-white tracking-display sm:text-6xl">
              {pick(content, 'about.values.heading', 'Our Values')}
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
                <span aria-hidden="true" className="select-none font-display text-4xl font-bold tabular-nums text-white/[0.07] sm:text-5xl lg:text-7xl">
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

      {/* ── Trust, Technology & Clinical Standards ── */}
      <TrustWallSection items={(trustItems as PublicTrustItem[]) ?? []} />

      {/* ── Why Choose Us — editorial numbered list + inline CTA ── */}
      <div className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 lg:gap-24 items-start">

            {/* Left: numbered list */}
            <div>
              <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="inline-block h-px w-6 bg-primary/60" />
                {pick(content, 'about.why_choose.eyebrow', 'Why Bright Smile')}
              </span>
              <h2 className="mt-5 font-display text-4xl text-dark tracking-display">
                {pick(content, 'about.why_choose.heading', 'What Sets Us Apart')}
              </h2>

              <div className="mt-10 divide-y divide-gray-100">
                {whyChooseUs.map((point, i) => (
                  <div key={point} className="flex items-center gap-8 py-6">
                    <span aria-hidden="true" className="w-12 flex-shrink-0 font-display text-4xl font-bold tabular-nums text-gray-100">
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
                {pick(content, 'about.why_choose.cta_heading', 'Ready to experience the difference?')}
              </h3>
              <p className="mt-5 font-body text-base text-gray-500 leading-relaxed">
                {pick(content, 'about.why_choose.cta_subtext', 'Join over 1,000 patients who trust Bright Smile for their dental care. Book your first appointment today.')}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/appointments"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-[0.98]"
                >
                  {pick(content, 'about.why_choose.cta_book_label', 'Book an Appointment')}
                </Link>
                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-7 py-3.5 font-heading text-sm font-semibold text-gray-700 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
                >
                  {pick(content, 'about.why_choose.cta_doctors_label', 'Meet Our Doctors')}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
