import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .order('slug', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: { slug: string; meta_title?: string; meta_description?: string; og_image_url?: string; is_noindex?: boolean }[] = await req.json()
  if (!Array.isArray(body)) return NextResponse.json({ error: 'Body must be an array' }, { status: 400 })

  const supabase = createAdminClient()

  for (const item of body) {
    if (!item.slug) continue
    const { error } = await supabase
      .from('seo_settings')
      .upsert({
        slug: item.slug,
        meta_title: item.meta_title ?? null,
        meta_description: item.meta_description ?? null,
        og_image_url: item.og_image_url ?? null,
        is_noindex: item.is_noindex ?? false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
