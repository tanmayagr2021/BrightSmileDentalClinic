import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const allowed = [
    'full_name', 'title', 'nmc_number', 'qualification', 'short_name',
    'doctor_type', 'is_bookable', 'specializations', 'languages',
    'experience_text', 'education', 'short_bio', 'full_bio',
    'is_active', 'sort_order', 'profile_image_url',
  ]

  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }
  updates.updated_at = new Date().toISOString()

  const supabase = createAdminClient()

  const { data: before } = await supabase.from('doctors').select('*').eq('id', id).single()

  const { data, error } = await supabase
    .from('doctors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/doctors')

  await logAudit({
    actorId: user.id, action: 'update', resource: 'doctors', resourceId: id,
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

  const { data: before } = await supabase.from('doctors').select('*').eq('id', id).single()

  const { error } = await supabase
    .from('doctors')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/doctors')

  await logAudit({
    actorId: user.id, action: 'delete', resource: 'doctors', resourceId: id,
    oldData: before ? { full_name: before.full_name, slug: before.slug } : null, req,
  })

  return NextResponse.json({ success: true })
}
