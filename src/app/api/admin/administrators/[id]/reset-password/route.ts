import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdminApi, logAudit } from '@/lib/admin-auth'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

function generateTempPassword(): string {
  // 16 hex chars from crypto-strength randomness, prefixed so it always
  // satisfies typical password complexity rules (letter + number + length).
  return `Bs-${randomBytes(9).toString('hex')}`
}

// POST — generates a new temporary password for an administrator and
// returns it once. There is no email delivery configured, so the Super
// Admin is responsible for sharing it with the affected admin directly.
export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSuperAdminApi()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { data: target, error: fetchError } = await supabase
    .from('admin_users')
    .select('*, roles(name)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (fetchError || !target) return NextResponse.json({ error: 'Administrator not found' }, { status: 404 })

  const targetRole = (target as typeof target & { roles: { name: string } | null }).roles?.name
  if (targetRole === 'super_admin' && target.id !== admin.id) {
    return NextResponse.json({ error: 'Cannot reset another Super Admin’s password here' }, { status: 403 })
  }

  const tempPassword = generateTempPassword()
  const { error: updateError } = await supabase.auth.admin.updateUserById(id, { password: tempPassword })
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await logAudit({
    actorId: admin.id,
    action: 'reset_password',
    resource: 'admin_users',
    resourceId: id,
    req,
  })

  return NextResponse.json({ temporaryPassword: tempPassword })
}
