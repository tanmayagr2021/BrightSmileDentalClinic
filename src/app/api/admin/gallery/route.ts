import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function GET() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const [{ data: items }, { data: groups }] = await Promise.all([
    supabase
      .from('gallery')
      .select('*, gallery_groups(id, name, slug)')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
    supabase
      .from('gallery_groups')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }),
  ])

  return NextResponse.json({ items: items ?? [], groups: groups ?? [] })
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { image_url, alt_text, caption, group_id } = body

  if (!image_url) return NextResponse.json({ error: 'image_url is required' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: maxRow } = await supabase
    .from('gallery')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxRow?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('gallery')
    .insert({
      image_url,
      alt_text: alt_text || 'Clinic photo',
      caption: caption || null,
      group_id: group_id || null,
      sort_order,
      is_visible: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/gallery')

  await logAudit({
    actorId: user.id, action: 'create', resource: 'gallery', resourceId: data.id,
    newData: { alt_text: data.alt_text }, req,
  })

  return NextResponse.json(data, { status: 201 })
}
