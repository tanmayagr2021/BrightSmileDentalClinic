// Bright AI chat endpoint — fully free, no external AI API.
// Uses a local intent engine; streams character-by-character for a natural UX.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { processMessage } from '@/lib/ai/intent-engine'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const Schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
  sessionId: z.string().min(1).max(64),
})

export async function POST(req: NextRequest) {
  // Rate limit: 30 messages/minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { success } = await rateLimit(`ai:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  }

  const { messages } = parsed.data
  const lastMessage = messages[messages.length - 1]

  // Run intent engine — instant, free, no external calls
  const response = processMessage(lastMessage.content)

  // Build the full streamed text (with action tokens appended)
  let fullText = response.text
  if (response.navigateTo) fullText += `\n[NAVIGATE:${response.navigateTo}]`
  if (response.quickReplies?.length) fullText += `\n[QUICKREPLIES:${response.quickReplies.join(',')}]`
  if (response.isMedicalHistoryTrigger) fullText += '\n[MEDICAL_HISTORY]'

  // Stream character-by-character for natural typewriter feel
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for (const char of fullText) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: char })}\n\n`))
        // 10ms per character — reads at ~100 chars/sec, smooth and legible
        await new Promise((r) => setTimeout(r, 10))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
