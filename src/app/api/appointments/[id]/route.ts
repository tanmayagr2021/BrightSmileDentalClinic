import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const Body = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('appointments')
    .update({ status: parsed.data.status })
    .eq('id', id)

  if (error) {
    console.error('[Appointments] Status update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
