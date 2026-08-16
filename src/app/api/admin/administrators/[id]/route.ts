import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdminApi, logAudit } from '@/lib/admin-auth'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

// PATCH — edit name/phone, or toggle is_active (disable/enable).
// Role and email are intentionally not editable here — changing role could
// silently elevate an account, and email changes need Auth-side verification
// this UI doesn't implement.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSuperAdminApi()
  if (error) return error

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: target, error: fetchError } = await supabase
    .from('admin_users')
    .select('*, roles(name)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (fetchError || !target) return NextResponse.json({ error: 'Administrator not found' }, { status: 404 })

  const targetRole = (target as typeof target & { roles: { name: string } | null }).roles?.name
  if (targetRole === 'super_admin') {
    return NextResponse.json({ error: 'The Super Admin account cannot be modified here' }, { status: 403 })
  }

  const updates: Record<string, unknown> = { updated_by: admin.id }
  if (typeof body.full_name === 'string' && body.full_name.trim()) updates.full_name = body.full_name.trim()
  if ('phone_number' in body) updates.phone_number = body.phone_number?.trim() || null
  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active

  const { data: updated, error: updateError } = await supabase
    .from('admin_users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Disabling in admin_users must also revoke Supabase Auth access — otherwise
  // a disabled admin's existing session (or a fresh login, since their
  // password still works) keeps hitting every route that only checks
  // getCurrentAdmin() indirectly via is_active... this ban is what actually
  // makes is_active:false stop the account, not just the DB flag.
  if (typeof body.is_active === 'boolean') {
    await supabase.auth.admin
      .updateUserById(id, { ban_duration: body.is_active ? 'none' : '876000h' })
      .catch(() => {})
  }

  await logAudit({
    actorId: admin.id,
    action: typeof body.is_active === 'boolean' ? (body.is_active ? 'enable' : 'disable') : 'update',
    resource: 'admin_users',
    resourceId: id,
    oldData: { full_name: target.full_name, phone_number: target.phone_number, is_active: target.is_active },
    newData: updates,
    req,
  })

  return NextResponse.json(updated)
}

// DELETE — soft delete (deleted_at + is_active = false). Super Admin accounts
// can never be deleted through this route.
export async function DELETE(req: NextRequest, { params }: Params) {
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
  if (targetRole === 'super_admin') {
    return NextResponse.json({ error: 'The Super Admin account cannot be deleted' }, { status: 403 })
  }

  const now = new Date().toISOString()
  const { error: deleteError } = await supabase
    .from('admin_users')
    .update({ deleted_at: now, is_active: false, updated_by: admin.id })
    .eq('id', id)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  // Also disable the Supabase Auth account so a deleted admin can't sign in.
  await supabase.auth.admin.updateUserById(id, { ban_duration: '876000h' }).catch(() => {})

  await logAudit({
    actorId: admin.id,
    action: 'delete',
    resource: 'admin_users',
    resourceId: id,
    oldData: { email: target.email, full_name: target.full_name },
    req,
  })

  return NextResponse.json({ ok: true })
}
