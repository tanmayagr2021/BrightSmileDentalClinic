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
      {/* Hero */}
      <div className="bg-tint border-b border-gray-100 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-4 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            What We Offer
          </span>
          <h1 className="font-display text-5xl text-dark sm:text-6xl tracking-display">
            Our Services
          </h1>
          <p className="mt-5 max-w-xl font-body text-lg text-gray-500 leading-relaxed">
            Comprehensive dental care for the whole family — from routine check-ups to
            advanced specialist treatments, all under one roof.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`#${s.slug}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 font-heading text-xs font-semibold text-gray-600 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary scroll-smooth active:scale-[0.97]"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Service sections */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16 divide-y divide-gray-100">
          {services.map((service, index) => (
            <div
              key={service.slug}
              id={service.slug}
              className="scroll-mt-28 pt-16 first:pt-0"
            >
              <div className={`grid grid-cols-1 gap-12 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>

                {/* Left: Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <span className="eyebrow mb-3 inline-flex items-center gap-2">
                    <span className="inline-block h-px w-5 bg-primary" />
                    Treatment Category {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-3xl text-dark sm:text-4xl tracking-display">
                    {service.name}
                  </h2>
                  <p className="mt-4 font-body text-base text-gray-500 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Benefits */}
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

                  <div className="mt-8 flex gap-3">
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

                {/* Right: Sub-services grid */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="rounded-2xl bg-tint p-6">
                    <p className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Treatments Included
                    </p>
                    <div className="space-y-3">
                      {service.subServices.map((sub) => (
                        <div key={sub.name} className="rounded-xl bg-white px-5 py-4 shadow-sm">
                          <p className="font-heading text-sm font-semibold text-dark">{sub.name}</p>
                          <p className="mt-1 font-body text-xs text-gray-500 leading-relaxed">{sub.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA — dark emerald strip */}
      <div
        className="py-20 lg:py-24"
        style={{ background: 'linear-gradient(135deg, #081912 0%, #1A3D2B 100%)' }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="mb-5 inline-flex items-center gap-3 font-heading text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-primary">
            <span className="h-px w-6 bg-primary/60" />
            Free Consultation
          </span>
          <h2 className="font-display text-3xl text-white tracking-display sm:text-4xl">
            Not sure which treatment<br className="hidden sm:block" /> is right for you?
          </h2>
          <p className="mt-4 font-body text-base text-white/48 leading-relaxed">
            Book a consultation and our team will assess your needs and explain all available options — clearly and without pressure.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/appointments"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-primary/35 active:scale-[0.97]"
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
