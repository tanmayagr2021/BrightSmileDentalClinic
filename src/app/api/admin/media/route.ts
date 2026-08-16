import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.trim()
  const bucket = searchParams.get('bucket')?.trim()
  const folder = searchParams.get('folder')?.trim()
  const tag = searchParams.get('tag')?.trim()
  const trash = searchParams.get('trash') === 'true'

  const supabase = createAdminClient()
  let query = supabase
    .from('media_library')
    .select('*')
    .eq('is_deleted', trash)
    .order('created_at', { ascending: false })

  if (search) query = query.or(`file_name.ilike.%${search}%,alt_text.ilike.%${search}%,caption.ilike.%${search}%`)
  if (bucket) query = query.eq('bucket', bucket)
  if (folder) query = query.eq('folder', folder)
  if (tag) query = query.contains('tags', [tag])

  const { data: media, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: usageRows } = await supabase.from('media_usage').select('media_id')
  const usageCounts = new Map<string, number>()
  for (const row of usageRows ?? []) {
    usageCounts.set(row.media_id, (usageCounts.get(row.media_id) ?? 0) + 1)
  }

  const withUsage = (media ?? []).map((m) => ({ ...m, usage_count: usageCounts.get(m.id) ?? 0 }))
  return NextResponse.json(withUsage)
}
