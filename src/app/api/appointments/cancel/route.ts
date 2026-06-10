import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let token: string
  try {
    const body = await req.json()
    token = body?.token
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!token || typeof token !== 'string' || token.length !== 64) {
    return NextResponse.json({ error: 'Invalid cancellation token' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Look up the token
  const { data: tokenRow, error: tokenErr } = await supabase
    .from('appointment_tokens')
    .select('id, appointment_id, expires_at, used_at')
    .eq('token', token)
    .eq('token_type', 'cancellation')
    .single()

  if (tokenErr || !tokenRow) {
    return NextResponse.json({ error: 'Invalid or expired cancellation link' }, { status: 404 })
  }

  if (tokenRow.used_at) {
    return NextResponse.json({ error: 'This cancellation link has already been used' }, { status: 409 })
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This cancellation link has expired. Please call us to cancel.' }, { status: 410 })
  }

  // Cancel the appointment
  const { error: updateErr } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', tokenRow.appointment_id)

  if (updateErr) {
    console.error('[Cancel] Update error:', updateErr)
    return NextResponse.json({ error: 'Failed to cancel. Please call us directly.' }, { status: 500 })
  }

  // Mark token as used
  await supabase
    .from('appointment_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenRow.id)

  return NextResponse.json({ success: true })
}

// Allow GET for simple link-based cancellation from email
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const fakeReq = new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await POST(fakeReq)
  const { success, error } = await result.json()

  if (success) {
    return NextResponse.redirect(new URL('/appointments?cancelled=true', req.url))
  }
  return NextResponse.redirect(new URL(`/appointments?cancel_error=${encodeURIComponent(error ?? 'error')}`, req.url))
}
