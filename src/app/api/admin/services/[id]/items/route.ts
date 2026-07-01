import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

async function getAuthUser() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  return user
}

// GET — list all items for a service category
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('service_items')
    .select('*')
    .eq('category_id', id)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — create new item for a service category
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 422 })

  const supabase = createAdminClient()

  // Place after last item
  const { data: maxRow } = await supabase
    .from('service_items')
    .select('sort_order')
    .eq('category_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('service_items')
    .insert({
      category_id: id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      sort_order: (maxRow?.sort_order ?? 0) + 10,
      is_visible: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/services')
  return NextResponse.json(data, { status: 201 })
}

// PATCH — bulk reorder / visibility update
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!Array.isArray(body)) return NextResponse.json({ error: 'Expected array' }, { status: 422 })

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  for (const item of body) {
    if (!item.id) continue
    await supabase
      .from('service_items')
      .update({ sort_order: item.sort_order, is_visible: item.is_visible, updated_at: now })
      .eq('id', item.id)
      .eq('category_id', id)
  }

  revalidatePath('/')
  revalidatePath('/services')
  return NextResponse.json({ ok: true })
}
