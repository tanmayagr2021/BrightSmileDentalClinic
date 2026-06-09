import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; detail?: string }> = {}

  // 1. Env vars present
  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  const missingEnv = requiredEnv.filter((k) => !process.env[k])
  checks.env = missingEnv.length === 0
    ? { status: 'ok' }
    : { status: 'error', detail: `Missing: ${missingEnv.join(', ')}` }

  // 2. Supabase connectivity (service role — bypasses RLS)
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('roles').select('name').limit(1)
    if (error) {
      // PGRST205 = table not found (migrations not run yet) — connectivity itself is OK
      checks.supabase = error.code === 'PGRST205'
        ? { status: 'ok', detail: 'connected — migrations pending' }
        : { status: 'error', detail: error.message }
    } else {
      checks.supabase = { status: 'ok', detail: 'connected — tables present' }
    }
  } catch (err) {
    checks.supabase = { status: 'error', detail: String(err) }
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok')

  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
