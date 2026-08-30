import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import ToothExplorerClient from './ToothExplorerClient'
import type { ToothRow } from '@/types/db'

export const dynamic = 'force-dynamic'

export type ToothWithRelations = ToothRow

export default async function AdminToothExplorerPage() {
  await requireAdmin()

  const supabase = createAdminClient()

  const { data: teeth } = await supabase
    .from('teeth')
    .select('*')
    .order('tooth_number', { ascending: true })

  return <ToothExplorerClient initialTeeth={(teeth as ToothWithRelations[]) ?? []} />
}
