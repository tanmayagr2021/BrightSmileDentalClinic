import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

const ALLOWED = ['module', 'category', 'title', 'description', 'issuer', 'year', 'image_id', 'sort_order', 'is_visible']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (body[key] !== undefined) updates[key] = body[key]
  }
  updates.updated_by = user.id

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('trust_wall_items').select('*').eq('id', id).single()

  const { data, error } = await supabase
    .from('trust_wall_items')
    .update(updates)
    .eq('id', id)
    .select('*, image:media_library(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/about')

  await logAudit({
    actorId: user.id, action: 'update', resource: 'trust_wall_items', resourceId: id, oldData: before, newData: updates, req,
  })

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()
  const { data: before } = await supabase.from('trust_wall_items').select('*').eq('id', id).single()

  const { error } = await supabase.from('trust_wall_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/about')

  await logAudit({
    actorId: user.id, action: 'delete', resource: 'trust_wall_items', resourceId: id,
    oldData: before ? { title: before.title, module: before.module } : null, req,
  })

  return NextResponse.json({ success: true })
}
