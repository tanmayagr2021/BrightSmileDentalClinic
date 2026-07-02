import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/schema'

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/doctors', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/appointments', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/testimonials', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  const [{ data: doctors }, { data: categories }, { data: posts }] = await Promise.all([
    supabase.from('doctors').select('slug, updated_at').eq('is_active', true).is('deleted_at', null),
    supabase.from('service_categories').select('slug, updated_at').eq('is_visible', true),
    supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published').is('deleted_at', null),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const doctorEntries: MetadataRoute.Sitemap = (doctors ?? []).map((d) => ({
    url: `${SITE_URL}/doctors/${d.slug}`,
    lastModified: d.updated_at ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const serviceEntries: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/services/${c.slug}`,
    lastModified: c.updated_at ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const blogEntries: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticEntries, ...doctorEntries, ...serviceEntries, ...blogEntries]
}
