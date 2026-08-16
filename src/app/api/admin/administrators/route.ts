import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdminApi, getRoleId, logAudit } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// GET — list all administrators (including disabled, excluding soft-deleted)
export async function GET() {
  const { error } = await requireSuperAdminApi()
  if (error) return error

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('admin_users')
    .select('*, roles(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const list = (data ?? []).map((row) => {
    const { roles, ...rest } = row as typeof row & { roles: { name: string } | null }
    return { ...rest, role: roles?.name ?? 'admin' }
  })

  return NextResponse.json(list)
}

// POST — create a new administrator. Role is always forced to "admin" —
// Super Admin accounts can never be created from this UI.
export async function POST(req: NextRequest) {
  const { admin, error } = await requireSuperAdminApi()
  if (error) return error

  const body = await req.json().catch(() => null)
  const { first_name, last_name, email, phone, password, confirm_password, is_active } = body ?? {}

  if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'First name, last name, email and password are required' }, { status: 422 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 422 })
  }
  if (password !== confirm_password) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 422 })
  }

  const supabase = createAdminClient()
  const adminRoleId = await getRoleId('admin')
  if (!adminRoleId) return NextResponse.json({ error: 'Admin role not found — check roles table' }, { status: 500 })

  const fullName = `${first_name.trim()} ${last_name.trim()}`

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  })
  if (authError || !authUser.user) {
    return NextResponse.json({ error: authError?.message ?? 'Failed to create account' }, { status: 400 })
  }

  const { data: newAdmin, error: insertError } = await supabase
    .from('admin_users')
    .insert({
      id: authUser.user.id,
      email: email.trim(),
      full_name: fullName,
      phone_number: phone?.trim() || null,
      role_id: adminRoleId,
      is_active: is_active ?? true,
      created_by: admin.id,
    })
    .select()
    .single()

  if (insertError) {
    // Roll back the auth user so we don't leave an orphaned account.
    await supabase.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await logAudit({
    actorId: admin.id,
    action: 'create',
    resource: 'admin_users',
    resourceId: newAdmin.id,
    newData: { email: newAdmin.email, full_name: newAdmin.full_name, role: 'admin' },
    req,
  })

  return NextResponse.json({ ...newAdmin, role: 'admin' }, { status: 201 })
}
