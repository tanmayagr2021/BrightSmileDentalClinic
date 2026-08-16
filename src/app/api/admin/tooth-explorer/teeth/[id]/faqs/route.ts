import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  if (!body.question || !body.answer) {
    return NextResponse.json({ error: 'question and answer are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: maxRow } = await supabase
    .from('tooth_faqs')
    .select('sort_order')
    .eq('tooth_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from('tooth_faqs')
    .insert({ tooth_id: id, question: body.question, answer: body.answer, sort_order: (maxRow?.sort_order ?? -1) + 1 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/choose-your-tooth')
  return NextResponse.json(data)
}
