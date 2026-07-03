import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, serviceId } = await params
  const { error } = await createAdminClient()
    .from('tooth_services')
    .delete()
    .eq('tooth_id', id)
    .eq('service_id', serviceId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/tooth-explorer')
  revalidatePath('/services')
  return NextResponse.json({ success: true })
}
