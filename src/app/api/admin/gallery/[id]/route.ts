import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const allowed = ['alt_text', 'caption', 'is_visible', 'is_featured', 'sort_order', 'group_id', 'image_url']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('gallery')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/gallery')

  await logAudit({
    actorId: user.id, action: 'update', resource: 'gallery', resourceId: id,
    newData: updates, req,
  })

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('gallery')
    .update({ deleted_at: new Date().toISOString(), is_visible: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/gallery')

  await logAudit({
    actorId: user.id, action: 'delete', resource: 'gallery', resourceId: id, req,
  })

  return NextResponse.json({ success: true })
}
