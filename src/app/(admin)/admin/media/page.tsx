import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import MediaLibraryClient from '@/components/admin/MediaLibraryClient'
import type { MediaLibraryRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export default async function MediaLibraryPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const [{ data: media, error }, { data: usageRows }] = await Promise.all([
    supabase.from('media_library').select('*').eq('is_deleted', false).order('created_at', { ascending: false }),
    supabase.from('media_usage').select('media_id'),
  ])

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="font-heading text-sm font-semibold text-red-600">Failed to load media</p>
          <p className="mt-1 font-body text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  const usageCounts = new Map<string, number>()
  for (const row of usageRows ?? []) {
    usageCounts.set(row.media_id, (usageCounts.get(row.media_id) ?? 0) + 1)
  }

  const items: MediaLibraryRow[] = (media ?? []).map((m) => ({ ...m, usage_count: usageCounts.get(m.id) ?? 0 }))

  return <MediaLibraryClient initialItems={items} />
}
