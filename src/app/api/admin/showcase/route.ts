import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function GET() {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('showcase_slides')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// Batch update order/visibility
export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const body: { id: string; is_visible: boolean; sort_order: number }[] = await req.json()
  if (!Array.isArray(body)) return NextResponse.json({ error: 'Body must be an array' }, { status: 400 })

  const supabase = createAdminClient()
  for (const item of body) {
    const { error } = await supabase
      .from('showcase_slides')
      .update({ is_visible: item.is_visible, sort_order: item.sort_order, updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const body = await req.json()
  const { title, subtitle, description, category, gradient_from, gradient_to, accent_color } = body
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: maxRow } = await supabase
    .from('showcase_slides')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('showcase_slides')
    .insert({
      title, subtitle: subtitle || null, description: description || null,
      category: category || 'clinic',
      gradient_from: gradient_from || '#1e4030',
      gradient_to: gradient_to || '#122618',
      accent_color: accent_color || '#4A9B6F',
      sort_order: (maxRow?.sort_order ?? 0) + 1,
      is_visible: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/')
  return NextResponse.json(data, { status: 201 })
}
