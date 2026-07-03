import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function GET() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await createAdminClient()
    .from('virtual_tour_rooms')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.name || !body.slug) {
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: maxRow } = await supabase
    .from('virtual_tour_rooms')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('virtual_tour_rooms')
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      sort_order: (maxRow?.sort_order ?? -1) + 1,
      is_visible: false,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/virtual-tour')
  revalidatePath('/gallery')

  await logAudit({
    actorId: user.id, action: 'create', resource: 'virtual_tour_rooms', resourceId: data.id,
    newData: data, req,
  })

  return NextResponse.json(data)
}
