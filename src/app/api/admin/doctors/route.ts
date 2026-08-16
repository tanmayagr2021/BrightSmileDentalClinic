import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { logAudit } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function GET() {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { admin, error: authError } = await requireAdminApi()
  if (authError) return authError

  const body = await req.json()
  const {
    full_name, title, nmc_number, qualification, short_name,
    doctor_type, is_bookable, specializations, languages,
    experience_text, education, short_bio, full_bio,
  } = body

  if (!full_name) {
    return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
  }

  const slug = full_name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  const supabase = createAdminClient()

  const { data: maxRow } = await supabase
    .from('doctors')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxRow?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('doctors')
    .insert({
      full_name,
      slug,
      title: title ?? null,
      nmc_number: nmc_number ?? null,
      qualification: qualification ?? null,
      short_name: short_name ?? null,
      doctor_type: doctor_type ?? 'lead',
      is_bookable: is_bookable ?? false,
      specializations: specializations ?? [],
      languages: languages ?? [],
      experience_text: experience_text ?? null,
      education: education ?? null,
      short_bio: short_bio ?? null,
      full_bio: full_bio ?? null,
      is_active: true,
      sort_order,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/doctors')

  await logAudit({
    actorId: admin.id, action: 'create', resource: 'doctors', resourceId: data.id,
    newData: { full_name: data.full_name, slug: data.slug }, req,
  })

  return NextResponse.json(data, { status: 201 })
}
