import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function GET() {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — create new service category
export async function POST(req: NextRequest) {
  const { admin, error: authError } = await requireAdminApi()
  if (authError) return authError

  const body = await req.json() as {
    name: string
    slug: string
    description?: string
    long_description?: string
    icon_name?: string
    thumbnail_url?: string
  }

  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Get next sort_order
  const { data: last } = await supabase
    .from('service_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('service_categories')
    .insert({
      name: body.name.trim(),
      slug: body.slug.trim(),
      description: body.description?.trim() ?? null,
      long_description: body.long_description?.trim() ?? null,
      icon_name: body.icon_name?.trim() ?? null,
      thumbnail_url: body.thumbnail_url?.trim() ?? null,
      sort_order: (last?.sort_order ?? 0) + 10,
      is_visible: true,
      created_by: admin.id,
      updated_by: admin.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/services')

  await logAudit({
    actorId: admin.id, action: 'create', resource: 'services', resourceId: data.id,
    newData: { name: data.name, slug: data.slug }, req,
  })

  return NextResponse.json(data, { status: 201 })
}

// PATCH — bulk reorder/visibility update
export async function PATCH(req: NextRequest) {
  const { admin, error: authError } = await requireAdminApi()
  if (authError) return authError

  const body: { id: string; is_visible: boolean; sort_order: number }[] = await req.json()

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an array' }, { status: 400 })
  }

  const supabase = createAdminClient()

  for (const item of body) {
    const { error } = await supabase
      .from('service_categories')
      .update({
        is_visible: item.is_visible,
        sort_order: item.sort_order,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/services')

  return NextResponse.json({ success: true })
}
