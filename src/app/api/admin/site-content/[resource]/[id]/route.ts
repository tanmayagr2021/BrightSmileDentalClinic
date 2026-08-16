import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import { getResourceConfig } from '@/lib/admin/site-content-config'

export const runtime = 'nodejs'

type Params = { params: Promise<{ resource: string; id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { resource, id } = await params
  const config = getResourceConfig(resource)
  if (!config) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const allowedKeys = new Set([...config.fields.map((f) => f.key), 'is_visible', 'sort_order'])
  const updates: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (allowedKeys.has(key)) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(config.table)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { resource, id } = await params
  const config = getResourceConfig(resource)
  if (!config) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })

  const supabase = createAdminClient()
  const { error } = await supabase.from(config.table).delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  return NextResponse.json({ success: true })
}
