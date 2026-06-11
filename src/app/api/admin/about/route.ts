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
    .from('site_settings')
    .select('about_content')
    .limit(1)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ about_content: data?.about_content ?? null })
}

export async function PATCH(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { about_content } = body

  if (!about_content) {
    return NextResponse.json({ error: 'about_content is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { count } = await supabase
    .from('site_settings')
    .select('id', { count: 'exact', head: true })

  let error
  if ((count ?? 0) === 0) {
    const res = await supabase.from('site_settings').insert({ about_content })
    error = res.error
  } else {
    const { data: row } = await supabase.from('site_settings').select('id').limit(1).single()
    const res = await supabase.from('site_settings').update({ about_content }).eq('id', row!.id)
    error = res.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/about')

  return NextResponse.json({ success: true })
}
