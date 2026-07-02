import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getResourceConfig } from '@/lib/admin/site-content-config'

export const runtime = 'nodejs'

type Params = { params: Promise<{ resource: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resource } = await params
  const config = getResourceConfig(resource)
  if (!config) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(config.table)
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: Params) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resource } = await params
  const config = getResourceConfig(resource)
  if (!config) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const row: Record<string, unknown> = {}
  for (const field of config.fields) {
    if (field.required && (body[field.key] === undefined || body[field.key] === '')) {
      return NextResponse.json({ error: `${field.label} is required` }, { status: 400 })
    }
    if (body[field.key] !== undefined) {
      row[field.key] = field.type === 'number' ? Number(body[field.key]) : body[field.key]
    }
  }

  const supabase = createAdminClient()

  const { data: maxRow } = await supabase
    .from(config.table)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  row.sort_order = (maxRow?.sort_order ?? 0) + 1
  row.is_visible = true

  const { data, error } = await supabase
    .from(config.table)
    .insert(row)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  return NextResponse.json(data, { status: 201 })
}
