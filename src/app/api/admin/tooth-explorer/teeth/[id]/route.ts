import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

const ALLOWED = ['description', 'problems', 'treatments', 'duration_text', 'recovery_text', 'is_active']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (body[key] !== undefined) updates[key] = body[key]
  }
  updates.updated_by = user.id

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('teeth').select('*').eq('id', id).single()

  const { data, error } = await supabase.from('teeth').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/tooth-explorer')

  await logAudit({
    actorId: user.id, action: 'update', resource: 'teeth', resourceId: id,
    oldData: before, newData: updates, req,
  })

  return NextResponse.json(data)
}
