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
  const updates: Record<string, unknown> = {}
  for (const key of ['question', 'answer', 'sort_order']) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { data, error } = await createAdminClient().from('tooth_faqs').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/choose-your-tooth')
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params
  const { error } = await createAdminClient().from('tooth_faqs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/choose-your-tooth')
  return NextResponse.json({ success: true })
}
