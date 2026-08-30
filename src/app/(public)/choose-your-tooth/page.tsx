import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCanonical } from '@/lib/schema'
import ToothExplorerExperience, { type PublicTooth } from '@/components/tooth-explorer/ToothExplorerExperience'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/choose-your-tooth') },
  title: 'Choose Your Tooth',
  description:
    'Click any tooth on our interactive dental chart to learn what it does and the common problems it faces.',
}

export default async function ChooseYourToothPage() {
  const supabase = createAdminClient()

  const { data: teeth } = await supabase
    .from('teeth')
    .select('*')
    .eq('is_active', true)
    .order('tooth_number', { ascending: true })

  return <ToothExplorerExperience teeth={(teeth as PublicTooth[]) ?? []} />
}
