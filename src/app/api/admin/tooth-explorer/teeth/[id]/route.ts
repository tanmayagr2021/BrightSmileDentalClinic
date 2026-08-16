import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

const ALLOWED = ['description', 'problems', 'treatments', 'duration_text', 'recovery_text', 'is_active']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (body[key] !== undefined) updates[key] = body[key]
  }
  updates.updated_by = admin.id

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('teeth').select('*').eq('id', id).single()

  const { data, error } = await supabase.from('teeth').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/choose-your-tooth')

  await logAudit({
    actorId: admin.id, action: 'update', resource: 'teeth', resourceId: id,
    oldData: before, newData: updates, req,
  })

  return NextResponse.json(data)
}
