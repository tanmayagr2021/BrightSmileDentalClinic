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
    .from('blog_posts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, excerpt, content, cover_image_url, status, published_at, meta_title, meta_description, read_time_minutes, is_featured } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      excerpt: excerpt ?? null,
      content: content ?? null,
      cover_image_url: cover_image_url ?? null,
      status: status ?? 'draft',
      published_at: published_at ?? null,
      meta_title: meta_title ?? null,
      meta_description: meta_description ?? null,
      read_time_minutes: read_time_minutes ?? null,
      is_featured: is_featured ?? false,
      sort_order: 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/blog')

  return NextResponse.json(data, { status: 201 })
}
