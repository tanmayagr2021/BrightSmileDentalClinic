import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICE_CATEGORIES_STATIC } from '@/lib/constants'
import { buildCanonical } from '@/lib/schema'
import TrackOnMount from '@/components/analytics/TrackOnMount'
import TrackedLink from '@/components/analytics/TrackedLink'
import type { ServiceCategoryRow } from '@/types/db'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const staticEntry = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === slug)
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('service_categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  const name = data?.name ?? staticEntry?.name ?? ''
  const description = data?.description ?? staticEntry?.shortDescription ?? ''
  const canonical = buildCanonical(`/services/${slug}`)
  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: { title: name, description, url: canonical, type: 'website' },
    twitter: { title: name, description },
  }
}

type SubService = { id?: string; name: string; description?: string; short_description?: string }

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const staticEntry = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === slug)

  const supabase = createAdminClient()

  const [{ data: categoryData }, { data: subServicesData }, { data: allCategoriesData }] = await Promise.all([
    supabase
      .from('service_categories')
      .select('*')
      .eq('slug', slug)
      .single(),
    supabase
      .from('services')
      .select('id, name, slug, short_description, sort_order')
      .eq('category_id', (await supabase.from('service_categories').select('id').eq('slug', slug).single()).data?.id ?? '')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
    supabase
      .from('service_categories')
      .select('id, name, slug, is_visible, sort_order')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true }),
  ])

  if (!categoryData && !staticEntry) notFound()

  const category = (categoryData as ServiceCategoryRow | null) ?? {
    id: '',
    name: staticEntry!.name,
    slug: staticEntry!.slug,
    description: staticEntry!.description,
    icon_name: null,
    sort_order: staticEntry!.sortOrder,
    is_visible: staticEntry!.visible,
    created_by: null,
    updated_by: null,
    created_at: '',
    updated_at: '',
  }

  const dbSubServices = subServicesData ?? []
  const subServices: SubService[] =
    dbSubServices.length > 0
      ? (dbSubServices as SubService[])
      : (staticEntry?.subServices ?? []).map((s) => ({ name: s.name, short_description: s.description }))

  const otherCategories = (allCategoriesData ?? []) as ServiceCategoryRow[]

  return (
    <div className="bg-white">
      <TrackOnMount event="Service Viewed" data={{ service: category.slug }} />
      {/* Hero */}
      <div className="bg-tint border-b border-gray-100 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/services" className="font-body text-sm text-gray-600 hover:text-primary transition-colors">
              Services
            </Link>
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-gray-300" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-body text-sm text-gray-600">{category.name}</span>
          </div>
          <span className="eyebrow mb-4 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Treatment Category
          </span>
          <h1 className="font-display text-5xl text-dark sm:text-6xl tracking-display">
            {category.name}
          </h1>
          <p className="mt-5 max-w-2xl font-body text-lg text-gray-500 leading-relaxed">
            {category.description ?? staticEntry?.description}
          </p>
          <div className="mt-8 flex gap-3">
            <TrackedLink
              href="/appointments"
              event="Service CTA Clicked"
              data={{ service: category.slug, label: 'Book an Appointment' }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              Book an Appointment
            </TrackedLink>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-7 py-3.5 font-heading text-sm font-semibold text-gray-700 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr]">

          {/* Main content */}
          <div className="space-y-14">

            {/* Treatments list */}
            <section>
              <h2 className="font-display text-3xl text-dark tracking-display mb-8">
                Treatments Included
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {subServices.map((sub, i) => (
                  <div key={sub.id ?? i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <span className="font-heading text-xs font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-dark">{sub.name}</h3>
                    <p className="mt-2 font-body text-sm text-gray-500 leading-relaxed">
                      {sub.short_description ?? sub.description ?? ''}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Treatment Process — static fallback */}
            {staticEntry && staticEntry.processSteps.length > 0 && (
              <section>
                <h2 className="font-display text-3xl text-dark tracking-display mb-8">
                  What to Expect
                </h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" aria-hidden="true" />
                  <div className="space-y-0">
                    {staticEntry.processSteps.map((step, i) => (
                      <div key={i} className="relative flex gap-6 pb-8 last:pb-0">
                        <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                          <span className="font-heading text-[0.65rem] font-bold">{step.step}</span>
                        </div>
                        <div className="pt-0.5 pb-2">
                          <h3 className="font-heading text-base font-semibold text-dark">{step.title}</h3>
                          <p className="mt-1.5 font-body text-sm text-gray-500 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Service FAQs — static fallback */}
            {staticEntry && staticEntry.faqs.length > 0 && (
              <section>
                <h2 className="font-display text-3xl text-dark tracking-display mb-8">
                  Common Questions
                </h2>
                <div className="space-y-4">
                  {staticEntry.faqs.map((faq, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6">
                      <h3 className="font-heading text-sm font-semibold text-dark">{faq.q}</h3>
                      <p className="mt-3 font-body text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Book card */}
            <div className="rounded-2xl bg-dark p-7 text-white">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-white/75 mb-3">
                Ready to Begin?
              </h3>
              <p className="font-display text-xl text-white leading-snug">
                Book a consultation for<br />
                <span className="text-primary">{category.name}</span>
              </p>
              <p className="mt-3 font-body text-sm text-white/50">
                Our team will assess your needs and explain the most suitable treatment options.
              </p>
              <TrackedLink
                href="/appointments"
                event="Service CTA Clicked"
                data={{ service: category.slug, label: 'Book Appointment' }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
              >
                Book Appointment
              </TrackedLink>
              <a
                href="tel:+97714519594"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-heading text-sm font-semibold text-white/70 transition-all hover:border-white/25 hover:text-white active:scale-[0.98]"
              >
                Call Us Instead
              </a>
            </div>

            {/* Benefits — static fallback */}
            {staticEntry && staticEntry.benefits.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
                  Key Benefits
                </h3>
                <div className="space-y-3">
                  {staticEntry.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-3">
                      <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill="#0C3C2D" fillOpacity="0.12" />
                        <path d="M5 8l2 2 4-4" stroke="#0C3C2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-body text-sm text-gray-600">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All services from DB */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
                Other Services
              </h3>
              <div className="space-y-2">
                {(otherCategories.length > 0
                  ? otherCategories.filter((c) => c.slug !== slug)
                  : SERVICE_CATEGORIES_STATIC.filter((s) => s.slug !== slug && s.visible)
                ).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 font-heading text-sm font-medium text-gray-600 transition-all hover:bg-tint hover:text-primary"
                  >
                    {s.name}
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-gray-300" aria-hidden="true">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
