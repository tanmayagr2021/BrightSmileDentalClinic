import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import ContentBlocksClient from '@/components/admin/ContentBlocksClient'

export const dynamic = 'force-dynamic'

export default async function ContentBlocksPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .order('page', { ascending: true })
    .order('section', { ascending: true })
    .order('key', { ascending: true })

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="font-heading text-sm font-semibold text-red-600">Failed to load content</p>
          <p className="mt-1 font-body text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return <ContentBlocksClient blocks={data ?? []} />
}
