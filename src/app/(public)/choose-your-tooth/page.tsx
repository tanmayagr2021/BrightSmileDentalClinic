import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildCanonical } from '@/lib/schema'
import ToothExplorerExperience, { type PublicTooth } from '@/components/tooth-explorer/ToothExplorerExperience'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: buildCanonical('/choose-your-tooth') },
  title: 'Choose Your Tooth',
  description:
    'Click any tooth on our interactive dental chart to learn about common problems, treatments, recovery times, and the Bright Smile doctors who specialize in that area.',
}

export default async function ChooseYourToothPage() {
  const supabase = createAdminClient()

  const { data: teeth } = await supabase
    .from('teeth')
    .select(`
      *,
      faqs:tooth_faqs(*),
      images:tooth_images(*, media:media_library(*)),
      tooth_doctors(doctor:doctors(id, full_name, slug, title, profile_image_url, color_hex, initials)),
      tooth_services(service:services(id, name, slug))
    `)
    .eq('is_active', true)
    .order('tooth_number', { ascending: true })

  return <ToothExplorerExperience teeth={(teeth as PublicTooth[]) ?? []} />
}
