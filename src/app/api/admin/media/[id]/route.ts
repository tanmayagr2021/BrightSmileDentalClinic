import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (body.alt_text !== undefined) updates.alt_text = body.alt_text
  if (body.caption !== undefined) updates.caption = body.caption
  if (body.folder !== undefined) updates.folder = body.folder
  if (body.tags !== undefined) updates.tags = body.tags
  if (body.is_deleted !== undefined) updates.is_deleted = body.is_deleted

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media_library')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Two-tier delete:
//  - default (trash): soft-delete via is_deleted=true, blocked entirely if
//    the asset is still referenced anywhere (media_usage count > 0).
//  - ?permanent=true (from the Trash view only): re-checks usage (in case
//    something started referencing it again) then removes the Storage
//    object and hard-deletes the row.
export async function DELETE(req: NextRequest, { params }: Params) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const permanent = new URL(req.url).searchParams.get('permanent') === 'true'

  const supabase = createAdminClient()

  const { data: usage } = await supabase
    .from('media_usage')
    .select('table_name, column_name, record_id')
    .eq('media_id', id)

  if (usage && usage.length > 0) {
    return NextResponse.json(
      { error: 'This asset is still in use and cannot be deleted.', usage },
      { status: 409 }
    )
  }

  if (!permanent) {
    const { data, error } = await supabase
      .from('media_library')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data: mediaRow, error: fetchError } = await supabase
    .from('media_library')
    .select('bucket, file_path')
    .eq('id', id)
    .single()
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const { error: storageError } = await supabase.storage.from(mediaRow.bucket).remove([mediaRow.file_path])
  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 })

  const { error: deleteError } = await supabase.from('media_library').delete().eq('id', id)
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
