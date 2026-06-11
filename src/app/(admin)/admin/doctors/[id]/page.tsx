import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import DoctorEditClient from './DoctorEditClient'

export const dynamic = 'force-dynamic'

export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: slug } = await params
  const supabase = createAdminClient()

  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error || !doctor) notFound()

  return <DoctorEditClient doctor={doctor} />
}
