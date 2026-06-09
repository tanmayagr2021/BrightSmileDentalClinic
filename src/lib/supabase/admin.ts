import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS.
// Permitted uses only:
//   1. Public appointment creation (POST /api/appointments)
//   2. Admin user creation during invitation flow
//   3. Cron job reminder emails (/api/cron/reminders)
// Never import this in client components or expose to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
