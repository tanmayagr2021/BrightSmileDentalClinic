import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import AuditLogsClient from '@/components/admin/AuditLogsClient'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
  await requireSuperAdmin()

  const supabase = createAdminClient()
  const { data: admins } = await supabase
    .from('admin_users')
    .select('id, full_name, email')
    .is('deleted_at', null)
    .order('full_name', { ascending: true })

  return <AuditLogsClient admins={admins ?? []} />
}
