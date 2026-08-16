import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import GalleryClient from '@/components/admin/GalleryClient'

export default async function GalleryAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()

  const [{ data: items }, { data: groups }] = await Promise.all([
    supabase
      .from('gallery')
      .select('*, gallery_groups(id, name, slug)')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
    supabase
      .from('gallery_groups')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
  ])

  return <GalleryClient items={items ?? []} groups={groups ?? []} />
}
