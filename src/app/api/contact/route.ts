import { createAdminClient } from '@/lib/supabase/admin'
import { sendContactNotification } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const Schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  treatment: z.string().max(100).optional(),
  message: z.string().min(5).max(1000),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const { success } = await rateLimit(`contact:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, phone, treatment, message } = parsed.data

  // Combine treatment interest into the message
  const fullMessage = treatment
    ? `Treatment interest: ${treatment}\n\n${message}`
    : message

  const supabase = createAdminClient()

  const { error: insertErr } = await supabase
    .from('contact_submissions')
    .insert({
      name,
      email,
      phone: phone ?? null,
      message: fullMessage,
      is_read: false,
    })

  if (insertErr) {
    console.error('[Contact] Insert error:', insertErr)
    return NextResponse.json({ error: 'Failed to send message. Please call us directly.' }, { status: 500 })
  }

  // Send notification email (non-fatal)
  await sendContactNotification({ name, email, phone, message: fullMessage }).catch((err) =>
    console.error('[Contact] Email error:', err)
  )

  return NextResponse.json({ success: true })
}
