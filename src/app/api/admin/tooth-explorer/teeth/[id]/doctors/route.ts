import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  if (!body.doctor_id) return NextResponse.json({ error: 'doctor_id is required' }, { status: 400 })

  const { error } = await createAdminClient()
    .from('tooth_doctors')
    .upsert({ tooth_id: id, doctor_id: body.doctor_id }, { onConflict: 'tooth_id,doctor_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/choose-your-tooth')
  revalidatePath('/doctors')
  return NextResponse.json({ success: true })
}
