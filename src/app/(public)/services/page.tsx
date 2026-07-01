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

// Premium (high-value) services get large featured cards. Order is intentional.
const PREMIUM_ORDER = ['cosmetic-dentistry', 'orthodontics', 'dental-implants'] as const
const PREMIUM_SLUGS = new Set<string>(PREMIUM_ORDER)

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Check({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity="0.14" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function ServicesPage() {
  const supabase = createAdminClient()

  const [{ data: categoryData }, { data: itemsData }] = await Promise.all([
    supabase
      .from('service_categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('service_items')
      .select('category_id, name, description, sort_order')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
  ])

  // Build slug-keyed items map from DB
  const categoryIdToSlug = new Map((categoryData ?? []).map((r) => [r.id, r.slug]))
  const itemsBySlug = new Map<string, { name: string; description: string }[]>()
  for (const item of (itemsData ?? [])) {
    const slug = categoryIdToSlug.get(item.category_id)
    if (!slug) continue
    const arr = itemsBySlug.get(slug) ?? []
    arr.push({ name: item.name, description: item.description ?? '' })
    itemsBySlug.set(slug, arr)
  }

  const visibleSlugs = new Set((categoryData ?? []).map((s) => s.slug))

  // Merge: DB-ordered static entries enriched with DB sub-items
  const dbOrder = (categoryData ?? []).map((dbRow) => {
    const staticEntry = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === dbRow.slug)
    if (!staticEntry) return null
    const dbItems = itemsBySlug.get(dbRow.slug)
    return {
      ...staticEntry,
      // Use DB items when available, fallback to static
      subServices: dbItems && dbItems.length > 0 ? dbItems : staticEntry.subServices,
    }
  }).filter((s): s is typeof SERVICE_CATEGORIES_STATIC[number] => s !== null)

  // Fallback: if Supabase query failed / empty, show static data
  const services = dbOrder.length > 0
    ? dbOrder
    : SERVICE_CATEGORIES_STATIC.filter((s) => s.visible && visibleSlugs.size === 0 ? true : visibleSlugs.has(s.slug))
        .sort((a, b) => a.sortOrder - b.sortOrder)

  // Premium services in curated order; standard services keep DB order.
  const premiumServices = PREMIUM_ORDER
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is typeof SERVICE_CATEGORIES_STATIC[number] => Boolean(s))
  const standardServices = services.filter((s) => !PREMIUM_SLUGS.has(s.slug))

  return (
    <div className="bg-white">

      {/* ── Hero — full dark ── */}
      <div
        className="relative overflow-hidden py-16 lg:py-24"
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

        {/* Gold accent glow — right side */}
        <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 translate-x-1/3 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/4 -bottom-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="inline-block h-px w-6 bg-gold/60" />
            What We Offer
          </span>

          {/* Headline */}
          <h1
            className="mt-5 font-display text-white tracking-display leading-[1.05]"
            style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)' }}
          >
            Our Services
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-lg font-body text-base text-white/90 leading-relaxed">
            Comprehensive dental care for the whole family — from routine check-ups to
            advanced specialist treatments, all under one roof.
          </p>

          {/* Service navigation — numbered list style */}
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/[0.08] pt-8 sm:grid-cols-3">
            {services.map((s, index) => (
              <Link
                key={s.slug}
                href={`#${s.slug}`}
                className="group flex items-center gap-3 scroll-smooth"
              >
                <span className="w-8 flex-shrink-0 font-display text-xl font-bold text-white/75 transition-colors group-hover:text-gold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-heading text-sm font-semibold text-white/85 transition-colors group-hover:text-white">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── PREMIUM / SIGNATURE SERVICES ── */}
      {premiumServices.length > 0 && (
        <section className="bg-ivory py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Banner header */}
            <div className="mb-12 border-l-4 border-gold pl-6">
              <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary">
                Signature Treatments
              </span>
              <h2 className="mt-2 font-display text-4xl text-dark tracking-display leading-[1.06] sm:text-5xl">
                Where We Excel
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-zinc-600 leading-relaxed">
                Our most requested, high-precision treatments — delivered by experienced
                clinicians using modern technology and a meticulous, patient-first approach.
              </p>
            </div>

            <div className="space-y-8">
              {premiumServices.map((service, index) => (
                <article
                  key={service.slug}
                  id={service.slug}
                  className="group relative scroll-mt-24 overflow-hidden rounded-3xl shadow-glass-dark transition-all duration-500"
                  style={{ background: '#0A1128' }}
                >
                  {/* Faint grid pattern */}
                  <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]" aria-hidden="true">
                    <defs>
                      <pattern id={`prem-grid-${service.slug}`} width="44" height="44" patternUnits="userSpaceOnUse">
                        <path d="M 44 0 L 0 0 0 44" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#prem-grid-${service.slug})`} />
                  </svg>
                  {/* Gold glow */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

                  <div className="relative grid grid-cols-1 gap-10 p-8 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:p-12">
                    {/* Left — narrative */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-4">
                        <span className="font-display text-5xl font-bold leading-none text-gold sm:text-6xl">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-heading text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold">
                          Signature
                        </span>
                      </div>

                      <h3 className="mt-6 font-display text-3xl text-white tracking-display leading-tight sm:text-4xl">
                        {service.name}
                      </h3>
                      <p className="mt-4 font-body text-[0.95rem] text-white/90 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Benefits */}
                      <ul className="mt-6 space-y-2.5">
                        {service.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-gold">
                              <Check />
                            </span>
                            <span className="font-body text-sm text-white/85 leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                        <Link
                          href={`/services/${service.slug}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-white/[0.1] active:scale-[0.97]"
                        >
                          Details
                        </Link>
                        <Link
                          href="/appointments"
                          className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-heading text-sm font-semibold text-[#0A1128] shadow-button-gold transition-all hover:bg-gold-dark hover:shadow-glow-gold active:scale-[0.97]"
                        >
                          Book Now <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Right — sub-services visual grid */}
                    <div>
                      <p className="mb-4 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                        Treatments Included
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {service.subServices.map((sub) => (
                          <div
                            key={sub.name}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-white/[0.07]"
                          >
                            <p className="font-heading text-sm font-semibold text-white leading-snug">{sub.name}</p>
                            <p className="mt-1.5 font-body text-sm text-white/85 leading-relaxed">{sub.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ADDITIONAL SERVICES — compact grid ── */}
      {standardServices.length > 0 && (
        <section className="border-t border-gray-100 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 border-l-4 border-primary/70 pl-6">
              <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary">
                Complete Care
              </span>
              <h2 className="mt-2 font-display text-4xl text-dark tracking-display leading-[1.06] sm:text-5xl">
                Additional Services
              </h2>
              <p className="mt-4 max-w-xl font-body text-base text-zinc-600 leading-relaxed">
                Everyday and specialist dental care that keeps your whole family healthy — every treatment delivered with the same attention to detail.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {standardServices.map((service, index) => (
                <article
                  key={service.slug}
                  id={service.slug}
                  className="group flex scroll-mt-24 flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium lg:p-8"
                >
                  <div className="flex items-start gap-5">
                    <span className="font-display text-4xl font-bold leading-none text-gray-200 tabular-nums transition-colors group-hover:text-primary/30">
                      {String(premiumServices.length + index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-2xl text-dark tracking-display leading-tight">
                        {service.name}
                      </h3>
                      <p className="mt-3 font-body text-sm text-zinc-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Sub-service chips */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {service.subServices.slice(0, 4).map((sub) => (
                      <span
                        key={sub.name}
                        className="rounded-lg border border-gray-100 bg-tint px-3 py-1.5 font-heading text-xs font-semibold text-dark/70"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex items-center gap-3 border-t border-gray-50 pt-5">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                    >
                      Full Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
                    <Link
                      href="/appointments"
                      className="font-heading text-sm font-semibold text-dark/60 transition-colors hover:text-dark"
                    >
                      Book
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

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
          <p className="mt-4 font-body text-base text-white/90 leading-relaxed">
            Book a consultation and our team will assess your needs and explain all available options — clearly and without pressure.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/appointments"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold px-8 py-4 font-heading text-sm font-semibold text-[#0A1128] shadow-button-gold transition-all hover:bg-gold-dark hover:shadow-glow-gold active:scale-[0.97]"
            >
              Book a Consultation
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-heading text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-[0.97]"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
