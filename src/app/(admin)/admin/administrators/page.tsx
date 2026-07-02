import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import AdministratorsClient from '@/components/admin/AdministratorsClient'
import type { AdminUserWithRole, RoleName } from '@/types/db'

export const dynamic = 'force-dynamic'

export default async function AdministratorsPage() {
  const currentAdmin = await requireSuperAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('admin_users')
    .select('*, roles(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const administrators: AdminUserWithRole[] = (data ?? []).map((row) => {
    const { roles, ...rest } = row as typeof row & { roles: { name: RoleName } | null }
    return { ...rest, role: roles?.name ?? 'admin' }
  })

  return <AdministratorsClient administrators={administrators} currentAdminId={currentAdmin.id} />
}
