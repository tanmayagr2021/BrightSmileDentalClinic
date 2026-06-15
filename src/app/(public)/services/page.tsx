import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICE_CATEGORIES_STATIC } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Comprehensive dental services at Bright Smile Dental Clinic — general dentistry, cosmetic dentistry, orthodontics, implants, oral surgery and paediatric dentistry.',
}

export default async function ServicesPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  const visibleSlugs = new Set((data ?? []).map((s) => s.slug))

  // Merge: only show categories that are visible in Supabase, in DB order
  const dbOrder = (data ?? []).map((dbRow) => {
    const staticEntry = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === dbRow.slug)
    return staticEntry ?? null
  }).filter((s): s is typeof SERVICE_CATEGORIES_STATIC[number] => s !== null)

  // Fallback: if Supabase query failed / empty, show static data
  const services = dbOrder.length > 0
    ? dbOrder
    : SERVICE_CATEGORIES_STATIC.filter((s) => s.visible && visibleSlugs.size === 0 ? true : visibleSlugs.has(s.slug))
        .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="bg-white">

      {/* ── Hero — full dark ── */}
      <div
        className="relative overflow-hidden py-28 lg:py-36"
        style={{ background: '#0A1128' }}
      >
        {/* Architectural grid overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="services-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#services-grid)" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="inline-block h-px w-6 bg-gold/60" />
            What We Offer
          </span>

          {/* Headline */}
          <h1 className="mt-5 font-display text-6xl text-white tracking-display sm:text-7xl">
            Our Services
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-lg font-body text-base text-white/55 leading-relaxed">
            Comprehensive dental care for the whole family — from routine check-ups to
            advanced specialist treatments, all under one roof.
          </p>

          {/* Service navigation — numbered list style */}
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/[0.07] pt-8 sm:grid-cols-3">
            {services.map((s, index) => (
              <Link
                key={s.slug}
                href={`#${s.slug}`}
                className="group flex items-center gap-3 scroll-smooth"
              >
                <span className="w-8 flex-shrink-0 font-display text-xl font-bold text-white/20 transition-colors group-hover:text-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-heading text-sm font-semibold text-white/45 transition-colors group-hover:text-white">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Service sections — chapter-based ── */}
      {services.map((service, index) => (
        <section
          key={service.slug}
          id={service.slug}
          className="scroll-mt-24 border-b border-gray-100"
        >
          {/* Chapter header */}
          <div className="border-b border-gray-100 bg-ivory py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-baseline justify-between gap-8">
                {/* Left: number + title */}
                <div className="flex items-baseline gap-6 sm:gap-10">
                  <span className="flex-shrink-0 font-display text-6xl font-bold tabular-nums leading-none text-gray-100 sm:text-8xl lg:text-[8rem]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-3xl text-dark tracking-display sm:text-4xl lg:text-5xl">
                    {service.name}
                  </h2>
                </div>

                {/* Right: action buttons */}
                <div className="ml-auto flex flex-shrink-0 gap-3">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
                  >
                    Full Details
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link
                    href="/appointments"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-gray-700 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 items-start">

              {/* Left: description + benefits */}
              <div>
                <p className="font-body text-base text-gray-500 leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-6 space-y-2">
                  {service.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-3">
                      <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill="#4A9B6F" fillOpacity="0.12" />
                        <path d="M5 8l2 2 4-4" stroke="#4A9B6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-body text-sm text-gray-600">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: sub-services — no card container */}
              <div>
                <p className="mb-6 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Treatments Included
                </p>
                <div className="divide-y divide-gray-100">
                  {service.subServices.map((sub) => (
                    <div key={sub.name} className="py-5">
                      <p className="font-heading text-sm font-semibold text-dark">{sub.name}</p>
                      <p className="mt-1 font-body text-xs text-gray-500 leading-relaxed">{sub.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* ── CTA strip — dark centered ── */}
      <div
        className="py-20 lg:py-24"
        style={{ background: '#0A1128' }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="mb-5 inline-flex items-center gap-3 font-heading text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold/60" />
            Free Consultation
          </span>
          <h2 className="font-display text-3xl text-white tracking-display sm:text-4xl">
            Not sure which treatment<br className="hidden sm:block" /> is right for you?
          </h2>
          <p className="mt-4 font-body text-base text-white/65 leading-relaxed">
            Book a consultation and our team will assess your needs and explain all available options — clearly and without pressure.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/appointments"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold px-8 py-4 font-heading text-sm font-semibold text-[#0A1128] shadow-button-gold transition-all hover:bg-gold-dark hover:shadow-glow-gold active:scale-[0.97]"
            >
              Book a Consultation
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/6 px-8 py-4 font-heading text-sm font-semibold text-white/75 transition-all hover:bg-white/12 hover:text-white active:scale-[0.97]"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
