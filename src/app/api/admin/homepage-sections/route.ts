import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function GET() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: { id: string; is_visible: boolean; sort_order: number }[] = await req.json()

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an array' }, { status: 400 })
  }

  const supabase = createAdminClient()

  for (const item of body) {
    const { error } = await supabase
      .from('homepage_sections')
      .update({
        is_visible: item.is_visible,
        sort_order: item.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')

  return NextResponse.json({ success: true })
}
