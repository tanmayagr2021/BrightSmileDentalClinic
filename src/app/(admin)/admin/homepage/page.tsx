import { createAdminClient } from '@/lib/supabase/admin'
import HomepageSectionsClient from '@/components/admin/HomepageSectionsClient'
import type { HomepageSectionRow } from '@/types/db'

export const dynamic = 'force-dynamic'

const SECTION_METADATA: Record<string, { label: string; desc: string; editHref?: string; locked?: boolean }> = {
  hero:            { label: 'Clinic Showcase',    desc: 'Full-screen clinic photo slideshow', editHref: '/admin/showcase', locked: true },
  stats:           { label: 'Stats Bar',          desc: '1,000+ patients · 10+ years · 20+ treatments' },
  trust:           { label: 'Trust Indicators',   desc: 'NMC registered, modern equipment, gentle care' },
  services:        { label: 'Services',           desc: 'Treatment categories with links to detail pages', editHref: '/admin/services' },
  doctors:         { label: 'Lead Dentists',      desc: 'Doctor cards with booking links', editHref: '/admin/doctors' },
  stats_bar:       { label: 'Stats Bar',          desc: 'Key numbers' },
  testimonials:    { label: 'Testimonials',       desc: 'Patient reviews section', editHref: '/admin/testimonials' },
  faq:             { label: 'FAQs',               desc: 'Frequently asked questions accordion', editHref: '/admin/faqs' },
  gallery_preview: { label: 'Gallery Preview',    desc: 'Photo gallery preview section', editHref: '/admin/gallery' },
  cta:             { label: 'Appointment CTA',    desc: 'Booking call-to-action section', locked: true },
  blog:            { label: 'Blog',               desc: 'Latest articles section (hidden until blog is ready)' },
}

export default async function HomepageCmsPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="font-heading text-sm font-semibold text-red-600">Failed to load homepage sections</p>
          <p className="mt-1 font-body text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  const rows: HomepageSectionRow[] = data ?? []

  const sections = rows
    .map((row) => {
      const meta = SECTION_METADATA[row.section_key]
      if (!meta) return null
      return { ...row, ...meta }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  return <HomepageSectionsClient sections={sections} />
}
