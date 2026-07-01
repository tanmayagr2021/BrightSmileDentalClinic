import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string; itemId: string }> }

async function getAuthUser() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  return user
}

// PATCH — update a single service item (name, description, is_visible, sort_order)
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, itemId } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 422 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('name' in body && body.name?.trim()) updates.name = body.name.trim()
  if ('description' in body) updates.description = body.description?.trim() || null
  if ('is_visible' in body) updates.is_visible = Boolean(body.is_visible)
  if ('sort_order' in body) updates.sort_order = Number(body.sort_order)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('service_items')
    .update(updates)
    .eq('id', itemId)
    .eq('category_id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/services')
  return NextResponse.json(data)
}

// DELETE — remove a service item
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, itemId } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('service_items')
    .delete()
    .eq('id', itemId)
    .eq('category_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/services')
  return NextResponse.json({ ok: true })
}
