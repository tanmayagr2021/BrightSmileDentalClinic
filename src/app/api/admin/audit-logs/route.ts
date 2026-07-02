import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'

const PAGE_SIZE = 25

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdminApi()
  if (error) return error

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim() ?? ''
  const adminId = url.searchParams.get('admin') ?? ''
  const resource = url.searchParams.get('module') ?? ''
  const action = url.searchParams.get('action') ?? ''
  const dateFrom = url.searchParams.get('from') ?? ''
  const dateTo = url.searchParams.get('to') ?? ''
  const format = url.searchParams.get('format') ?? 'json'
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)

  const supabase = createAdminClient()
  let query = supabase
    .from('audit_log')
    .select('*, admin_users(full_name, email, roles(name))', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (adminId) query = query.eq('actor_id', adminId)
  if (resource) query = query.eq('resource', resource)
  if (action) query = query.eq('action', action)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`)

  if (format !== 'csv') {
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  }

  const { data, error: dbError, count } = await query
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  type Row = typeof data extends (infer R)[] | null ? R : never
  let rows = (data ?? []) as Row[]

  // Free-text search across actor name/email and resource — applied
  // post-query since it spans a joined table.
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter((r) => {
      const au = (r as { admin_users?: { full_name?: string; email?: string } | null }).admin_users
      return (
        au?.full_name?.toLowerCase().includes(q) ||
        au?.email?.toLowerCase().includes(q) ||
        (r as { resource?: string }).resource?.toLowerCase().includes(q) ||
        (r as { resource_id?: string }).resource_id?.toLowerCase().includes(q)
      )
    })
  }

  const shaped = rows.map((r) => {
    const row = r as Row & {
      admin_users: { full_name: string; email: string; roles: { name: string } | null } | null
    }
    const { admin_users, ...rest } = row
    return {
      ...rest,
      actor_name: admin_users?.full_name ?? null,
      actor_email: admin_users?.email ?? null,
      actor_role: admin_users?.roles?.name ?? null,
    }
  })

  if (format === 'csv') {
    const header = ['Timestamp', 'Admin', 'Email', 'Role', 'Action', 'Module', 'Record', 'Success'].join(',')
    const lines = shaped.map((r) =>
      [
        csvEscape(r.created_at),
        csvEscape(r.actor_name ?? 'Unknown'),
        csvEscape(r.actor_email ?? ''),
        csvEscape(r.actor_role ?? ''),
        csvEscape(r.action),
        csvEscape(r.resource),
        csvEscape(r.resource_id ?? ''),
        csvEscape(r.success ? 'Success' : 'Failed'),
      ].join(',')
    )
    const csv = [header, ...lines].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  return NextResponse.json({ data: shaped, total: count ?? 0, page, pageSize: PAGE_SIZE })
}
