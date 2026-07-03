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
    .from('trust_wall_items')
    .select('*, image:media_library(*)')
    .order('module', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.module || !body.category || !body.title) {
    return NextResponse.json({ error: 'module, category and title are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: maxRow } = await supabase
    .from('trust_wall_items')
    .select('sort_order')
    .eq('module', body.module)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('trust_wall_items')
    .insert({
      module: body.module,
      category: body.category,
      title: body.title,
      description: body.description ?? null,
      issuer: body.issuer ?? null,
      year: body.year ?? null,
      sort_order: (maxRow?.sort_order ?? -1) + 1,
      is_visible: false,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('*, image:media_library(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/about')

  await logAudit({
    actorId: user.id, action: 'create', resource: 'trust_wall_items', resourceId: data.id, newData: data, req,
  })

  return NextResponse.json(data)
}
