import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { patient_name, rating, review_text, treatment_type, status, sort_order, is_featured } = body

  const updates: Record<string, unknown> = {}
  if (patient_name !== undefined) updates.patient_name = patient_name
  if (rating !== undefined) updates.rating = rating
  if (review_text !== undefined) updates.review_text = review_text
  if (treatment_type !== undefined) updates.treatment_type = treatment_type
  if (status !== undefined) {
    updates.status = status
    if (status === 'approved') updates.approved_at = new Date().toISOString()
  }
  if (sort_order !== undefined) updates.sort_order = sort_order
  if (is_featured !== undefined) updates.is_featured = is_featured

  updates.updated_at = new Date().toISOString()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/testimonials')

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('testimonials')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/testimonials')

  return NextResponse.json({ success: true })
}
