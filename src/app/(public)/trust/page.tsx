import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCanonical } from '@/lib/schema'
import TrustWallExperience from '@/components/trust-wall/TrustWallExperience'
import type { TrustWallItemRow, MediaLibraryRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/trust') },
  title: 'Trust & Excellence',
  description:
    'Awards, certifications, sterilization protocols, and the technology behind every treatment at Bright Smile Dental Clinic — our full record of clinical trust.',
}

export type PublicTrustItem = TrustWallItemRow & { image: MediaLibraryRow | null }

export default async function TrustPage() {
  const supabase = createAdminClient()

  const { data: items } = await supabase
    .from('trust_wall_items')
    .select('*, image:media_library(*)')
    .eq('is_visible', true)
    .order('module', { ascending: true })
    .order('sort_order', { ascending: true })

  return <TrustWallExperience items={(items as PublicTrustItem[]) ?? []} />
}
