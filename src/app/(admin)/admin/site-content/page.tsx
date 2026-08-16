import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import SiteContentClient from '@/components/admin/SiteContentClient'
import { SITE_CONTENT_RESOURCES, SITE_CONTENT_RESOURCE_SLUGS, type SiteContentResourceSlug } from '@/lib/admin/site-content-config'
import type { SiteContentRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export default async function SiteContentPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const slugs = SITE_CONTENT_RESOURCE_SLUGS as readonly SiteContentResourceSlug[]

  const results = await Promise.all(
    slugs.map((slug) =>
      supabase
        .from(SITE_CONTENT_RESOURCES[slug].table)
        .select('*')
        .order('sort_order', { ascending: true })
    )
  )

  const initialData = Object.fromEntries(
    slugs.map((slug, i) => [slug, (results[i].data ?? []) as SiteContentRow[]])
  ) as Record<SiteContentResourceSlug, SiteContentRow[]>

  return <SiteContentClient initialData={initialData} />
}
