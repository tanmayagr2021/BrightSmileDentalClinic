import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import TestimonialsClient from '@/components/admin/TestimonialsClient'

export const dynamic = 'force-dynamic'

export default async function TestimonialsCmsPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="font-heading text-sm font-semibold text-red-600">Failed to load testimonials</p>
          <p className="mt-1 font-body text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return <TestimonialsClient testimonials={data ?? []} />
}
