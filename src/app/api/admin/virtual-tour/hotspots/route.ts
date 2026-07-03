import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.room_id || !body.target_room_id) {
    return NextResponse.json({ error: 'room_id and target_room_id are required' }, { status: 400 })
  }
  if (body.room_id === body.target_room_id) {
    return NextResponse.json({ error: 'A room cannot link to itself' }, { status: 400 })
  }

  const { data, error } = await createAdminClient()
    .from('virtual_tour_hotspots')
    .insert({
      room_id: body.room_id,
      target_room_id: body.target_room_id,
      label: body.label ?? null,
      yaw: body.yaw ?? 0,
      pitch: body.pitch ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/virtual-tour')
  return NextResponse.json(data)
}
