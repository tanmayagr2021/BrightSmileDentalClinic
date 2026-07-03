import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.room_id || !body.media_id) {
    return NextResponse.json({ error: 'room_id and media_id are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: maxRow } = await supabase
    .from('virtual_tour_room_gallery')
    .select('sort_order')
    .eq('room_id', body.room_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('virtual_tour_room_gallery')
    .insert({
      room_id: body.room_id,
      media_id: body.media_id,
      sort_order: (maxRow?.sort_order ?? -1) + 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/virtual-tour')
  return NextResponse.json(data)
}
