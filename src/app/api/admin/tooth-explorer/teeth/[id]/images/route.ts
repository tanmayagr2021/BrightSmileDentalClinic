import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  if (!body.media_id) return NextResponse.json({ error: 'media_id is required' }, { status: 400 })

  const imageType = ['gallery', 'before', 'after'].includes(body.image_type) ? body.image_type : 'gallery'

  const supabase = createAdminClient()
  const { data: maxRow } = await supabase
    .from('tooth_images')
    .select('sort_order')
    .eq('tooth_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('tooth_images')
    .insert({ tooth_id: id, media_id: body.media_id, image_type: imageType, sort_order: (maxRow?.sort_order ?? -1) + 1 })
    .select('*, media:media_library(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/tooth-explorer')
  return NextResponse.json(data)
}
