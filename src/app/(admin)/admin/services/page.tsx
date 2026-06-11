import { createAdminClient } from '@/lib/supabase/admin'
import ServiceCategoriesClient from '@/components/admin/ServiceCategoriesClient'
import { SERVICE_CATEGORIES_STATIC } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function ServicesCmsPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })

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

  const rows = data ?? []

  // Merge with static data to get subService count
  const services = rows.map((row) => {
    const staticEntry = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === row.slug)
    return {
      ...row,
      subServiceCount: staticEntry?.subServices?.length ?? 0,
    }
  })

  return <ServiceCategoriesClient services={services} />
}
