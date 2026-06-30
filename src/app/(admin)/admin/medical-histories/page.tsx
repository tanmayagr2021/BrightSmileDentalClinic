import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import MedicalHistoriesClient from '@/components/admin/MedicalHistoriesClient'
import type { MedicalHistoryRow } from '@/types/db'

export const metadata = { title: 'Medical Histories' }

export default async function MedicalHistoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const admin = createAdminClient()
  const { data, count } = await admin
    .from('medical_histories')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(0, 19)

  return <MedicalHistoriesClient initialData={(data as MedicalHistoryRow[]) ?? []} totalCount={count ?? 0} />
}
