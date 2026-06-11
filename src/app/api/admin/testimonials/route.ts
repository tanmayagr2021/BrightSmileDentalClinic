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
    .from('testimonials')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { patient_name, rating, review_text, treatment_type, patient_initials } = body

  if (!patient_name || !rating || !review_text) {
    return NextResponse.json({ error: 'patient_name, rating, and review_text are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Get max sort_order
  const { data: maxRow } = await supabase
    .from('testimonials')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxRow?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      patient_name,
      rating,
      review_text,
      treatment_type: treatment_type ?? null,
      patient_initials: patient_initials ?? null,
      status: 'approved',
      approved_at: new Date().toISOString(),
      source: 'manual',
      is_featured: false,
      sort_order,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/testimonials')

  return NextResponse.json(data, { status: 201 })
}
