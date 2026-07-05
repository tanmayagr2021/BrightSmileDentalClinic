import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

async function getAuthUser() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  return user
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 })
  return NextResponse.json(data)
}

// PATCH — update editable content fields for a single service
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as Record<string, unknown>

  const allowed = ['name', 'description', 'long_description', 'icon_name', 'thumbnail_url', 'is_visible', 'sort_order']
  const updates: Record<string, unknown> = {
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const supabase = createAdminClient()

  const { data: before } = await supabase.from('service_categories').select('*').eq('id', id).single()

  const { data, error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/services')

  await logAudit({
    actorId: user.id, action: 'update', resource: 'services', resourceId: id,
    oldData: before, newData: updates, req,
  })

  return NextResponse.json(data)
}

// DELETE — permanently remove a service category
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { data: before } = await supabase.from('service_categories').select('name, slug').eq('id', id).single()

  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/services')

  await logAudit({
    actorId: user.id, action: 'delete', resource: 'services', resourceId: id,
    oldData: before, req,
  })

  return NextResponse.json({ success: true })
}
