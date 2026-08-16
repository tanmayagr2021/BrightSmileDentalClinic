import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  const { question, answer, category, is_visible, sort_order } = body

  const updates: Record<string, unknown> = {}
  if (question !== undefined) updates.question = question
  if (answer !== undefined) updates.answer = answer
  if (category !== undefined) updates.category = category
  if (is_visible !== undefined) updates.is_visible = is_visible
  if (sort_order !== undefined) updates.sort_order = sort_order
  updates.updated_at = new Date().toISOString()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('faqs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/faq')

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/faq')

  return NextResponse.json({ success: true })
}
