import { createAdminClient } from '@/lib/supabase/admin'
import TrustWallClient from './TrustWallClient'
import type { TrustWallItemRow, MediaLibraryRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export type TrustWallItemWithImage = TrustWallItemRow & { image: MediaLibraryRow | null }

export default async function AdminTrustWallPage() {
  const supabase = createAdminClient()

  const { data: items } = await supabase
    .from('trust_wall_items')
    .select('*, image:media_library(*)')
    .order('module', { ascending: true })
    .order('sort_order', { ascending: true })

  return <TrustWallClient initialItems={(items as TrustWallItemWithImage[]) ?? []} />
}
