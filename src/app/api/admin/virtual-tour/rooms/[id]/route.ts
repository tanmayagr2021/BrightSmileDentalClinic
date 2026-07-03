import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

const ALLOWED = [
  'name', 'slug', 'description', 'thumbnail_media_id', 'panorama_media_id',
  'cta_label', 'cta_link', 'sort_order', 'is_visible',
]

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
  const { data: before } = await supabase.from('virtual_tour_rooms').select('*').eq('id', id).single()

  const { data, error } = await supabase
    .from('virtual_tour_rooms')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      thumbnail:media_library!virtual_tour_rooms_thumbnail_media_id_fkey(*),
      panorama:media_library!virtual_tour_rooms_panorama_media_id_fkey(*)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/virtual-tour')

  await logAudit({
    actorId: user.id, action: 'update', resource: 'virtual_tour_rooms', resourceId: id,
    oldData: before, newData: updates, req,
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

  const { data: before } = await supabase.from('virtual_tour_rooms').select('*').eq('id', id).single()

  const { error } = await supabase.from('virtual_tour_rooms').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/virtual-tour')

  await logAudit({
    actorId: user.id, action: 'delete', resource: 'virtual_tour_rooms', resourceId: id,
    oldData: before ? { name: before.name, slug: before.slug } : null, req,
  })

  return NextResponse.json({ success: true })
}
