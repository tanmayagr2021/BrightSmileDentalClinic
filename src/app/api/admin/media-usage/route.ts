import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { isTrackedColumn } from '@/lib/admin/media-usage-config'

export const runtime = 'nodejs'

// Upserts a media_usage row so the Media Library's "in use" / delete-block
// logic knows about a freshly-picked asset. table/column are checked
// against the static allowlist — never used to build a dynamic query.
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const body = await req.json().catch(() => null)
  const { media_id, table_name, column_name, record_id } = body ?? {}
  if (!media_id || !table_name || !column_name || !record_id) {
    return NextResponse.json({ error: 'media_id, table_name, column_name, record_id are required' }, { status: 400 })
  }
  if (!isTrackedColumn(table_name, column_name)) {
    return NextResponse.json({ error: 'Column is not a tracked media reference' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('media_usage')
    .upsert(
      { media_id, table_name, column_name, record_id },
      { onConflict: 'table_name,column_name,record_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
