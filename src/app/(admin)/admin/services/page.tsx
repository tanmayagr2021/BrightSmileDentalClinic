import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import ServiceCategoriesClient from '@/components/admin/ServiceCategoriesClient'

export const dynamic = 'force-dynamic'

export default async function ServicesCmsPage() {
  await requireAdmin()

  const supabase = createAdminClient()

  const [{ data: categories, error }, { data: itemCounts }] = await Promise.all([
    supabase.from('service_categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('service_items').select('category_id').eq('is_visible', true),
  ])

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="font-heading text-sm font-semibold text-red-600">Failed to load services</p>
          <p className="mt-1 font-body text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  // Count items per category from DB
  const countMap = new Map<string, number>()
  for (const row of (itemCounts ?? [])) {
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1)
  }

  const services = (categories ?? []).map((row) => ({
    ...row,
    subServiceCount: countMap.get(row.id) ?? 0,
  }))

  return <ServiceCategoriesClient services={services} />
}
