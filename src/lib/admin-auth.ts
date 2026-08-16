import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminUserWithRole, AuditAction, RoleName } from '@/types/db'

// Resolves the logged-in Supabase Auth user to their admin_users row + role
// name. Returns null if not logged in, not provisioned as an admin, disabled,
// or soft-deleted — callers treat all of those as "not an authorized admin."
export async function getCurrentAdmin(): Promise<AdminUserWithRole | null> {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return null

  const { data, error } = await createAdminClient()
    .from('admin_users')
    .select('*, roles(name)')
    .eq('id', user.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()

  if (error || !data) return null

  const { roles, ...admin } = data as typeof data & { roles: { name: RoleName } | null }
  return { ...admin, role: roles?.name ?? 'admin' }
}

// Server Component guard — use in page.tsx for super-admin-only pages.
// Redirects to a clean "Unauthorized" page rather than exposing a 404/500.
export async function requireSuperAdmin(): Promise<AdminUserWithRole> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'super_admin') {
    redirect('/admin/unauthorized')
  }
  return admin
}

// Server Component guard for regular CMS admin pages — any active,
// non-deleted admin_users row (not just super_admin). Mirrors requireAdminApi
// but redirects like requireSuperAdmin, since these are page.tsx, not routes.
export async function requireAdmin(): Promise<AdminUserWithRole> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect('/admin/unauthorized')
  }
  return admin
}

// API route guard — mirrors requireSuperAdmin but returns a 403 response
// instead of redirecting, since route handlers can't redirect a fetch() call.
export async function requireSuperAdminApi(): Promise<
  { admin: AdminUserWithRole; error?: undefined } | { admin?: undefined; error: NextResponse }
> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'super_admin') {
    return { error: NextResponse.json({ error: 'Forbidden — Super Admin access required' }, { status: 403 }) }
  }
  return { admin }
}

// API route guard for regular CMS admin endpoints — any active, non-deleted
// admin_users row (not just super_admin). Use this instead of a bare
// `auth.getUser()` check: getUser() only proves "logged in," not "an
// authorized admin," and admin_users rows can be disabled without revoking
// the underlying Supabase Auth session.
export async function requireAdminApi(): Promise<
  { admin: AdminUserWithRole; error?: undefined } | { admin?: undefined; error: NextResponse }
> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return { error: NextResponse.json({ error: 'Forbidden — Admin access required' }, { status: 403 }) }
  }
  return { admin }
}

// Looks up a role's id by name rather than hardcoding the seeded UUIDs
// across multiple route files.
export async function getRoleId(name: RoleName): Promise<string | null> {
  const { data } = await createAdminClient()
    .from('roles')
    .select('id')
    .eq('name', name)
    .single()
  return data?.id ?? null
}

// Appends a row to the append-only audit_log table. Never throws — a logging
// failure must not block the underlying admin action from completing.
export async function logAudit(params: {
  actorId: string | null
  action: AuditAction
  resource: string
  resourceId?: string | null
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  success?: boolean
  req?: NextRequest
}) {
  try {
    const ip = params.req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = params.req?.headers.get('user-agent') ?? null

    await createAdminClient().from('audit_log').insert({
      actor_id: params.actorId,
      action: params.action,
      resource: params.resource,
      resource_id: params.resourceId ?? null,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
      ip_address: ip,
      user_agent: userAgent,
      success: params.success ?? true,
    })
  } catch (err) {
    console.error('[audit] failed to write audit log entry', err)
  }
}
