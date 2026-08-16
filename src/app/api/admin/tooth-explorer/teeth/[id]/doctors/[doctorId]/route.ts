import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; doctorId: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id, doctorId } = await params
  const { error } = await createAdminClient()
    .from('tooth_doctors')
    .delete()
    .eq('tooth_id', id)
    .eq('doctor_id', doctorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/choose-your-tooth')
  revalidatePath('/doctors')
  return NextResponse.json({ success: true })
}
