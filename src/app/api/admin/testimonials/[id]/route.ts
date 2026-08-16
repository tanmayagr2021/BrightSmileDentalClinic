import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error: authError } = await requireAdminApi()
  if (authError) return authError

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

  await logAudit({
    actorId: admin.id, action: 'update', resource: 'testimonials', resourceId: id,
    newData: updates, req,
  })

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params

  const supabase = createAdminClient()

  const { data: before } = await supabase.from('testimonials').select('patient_name').eq('id', id).single()

  const { error } = await supabase
    .from('testimonials')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/testimonials')

  await logAudit({
    actorId: admin.id, action: 'delete', resource: 'testimonials', resourceId: id,
    oldData: before, req,
  })

  return NextResponse.json({ success: true })
}
