import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Called by Vercel Cron: weekly on Sunday at midnight
// vercel.json: { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 0 * * 0" }] }

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Delete expired, unused cancellation tokens
  const { error, count } = await supabase
    .from('appointment_tokens')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString())
    .is('used_at', null)

  if (error) {
    console.error('[Cleanup] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, deletedTokens: count ?? 0 })
}
