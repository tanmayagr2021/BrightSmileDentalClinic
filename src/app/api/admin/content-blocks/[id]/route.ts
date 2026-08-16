import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

// Only `value` is editable — key/page/section/description are fixed at
// seed time and describe where the block is used, not its content.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error: authError } = await requireAdminApi()
  if (authError) return authError

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body || typeof body.value !== 'string') {
    return NextResponse.json({ error: 'value is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('content_blocks')
    .update({ value: body.value })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // content_blocks values are used across every public page rendered
  // through PublicLayout (Header/Footer) plus home/about/contact directly.
  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/contact')

  return NextResponse.json(data)
}
