import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id, serviceId } = await params
  const { error } = await createAdminClient()
    .from('tooth_services')
    .delete()
    .eq('tooth_id', id)
    .eq('service_id', serviceId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/choose-your-tooth')
  revalidatePath('/services')
  return NextResponse.json({ success: true })
}
