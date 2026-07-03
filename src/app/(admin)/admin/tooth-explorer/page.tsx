import { createAdminClient } from '@/lib/supabase/admin'
import ToothExplorerClient from './ToothExplorerClient'
import type { ToothRow, ToothFaqRow, ToothImageRow, MediaLibraryRow, DoctorRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export type ToothWithRelations = ToothRow & {
  faqs: ToothFaqRow[]
  images: (ToothImageRow & { media: MediaLibraryRow | null })[]
  tooth_doctors: { doctor_id: string }[]
  tooth_services: { service_id: string }[]
}

type ServiceRow = { id: string; name: string; category_id: string | null }

export default async function AdminToothExplorerPage() {
  const supabase = createAdminClient()

  const [{ data: teeth }, { data: doctors }, { data: services }] = await Promise.all([
    supabase
      .from('teeth')
      .select(`
        *,
        faqs:tooth_faqs(*),
        images:tooth_images(*, media:media_library(*)),
        tooth_doctors(doctor_id),
        tooth_services(service_id)
      `)
      .order('tooth_number', { ascending: true }),
    supabase.from('doctors').select('*').eq('is_active', true).is('deleted_at', null).order('sort_order'),
    supabase.from('services').select('id, name, category_id').eq('is_active', true).is('deleted_at', null).order('name'),
  ])

  return (
    <ToothExplorerClient
      initialTeeth={(teeth as ToothWithRelations[]) ?? []}
      doctors={(doctors as DoctorRow[]) ?? []}
      services={(services as ServiceRow[]) ?? []}
    />
  )
}
