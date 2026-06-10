/**
 * One-time setup script — creates the Bright Smile admin user in Supabase.
 * Uses raw fetch (no supabase-js) to avoid WebSocket issues in Node.js 20.
 *
 * Run with:
 *   node --env-file=.env.local scripts/seed-admin.mjs
 *
 * Safe to re-run — upserts on conflict.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Run: node --env-file=.env.local scripts/seed-admin.mjs')
  process.exit(1)
}

const ADMIN_EMAIL = 'tanmayagr2021@gmail.com'
const ADMIN_PASSWORD = 'K@thmandu1'
const ADMIN_FULL_NAME = 'Tanmay Agrawal'
const SUPER_ADMIN_ROLE_ID = '00000000-0000-0000-0000-000000000001'

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
}

async function listUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
    headers: AUTH_HEADERS,
  })
  if (!res.ok) throw new Error(`List users failed: ${await res.text()}`)
  const data = await res.json()
  return data.users ?? []
}

async function createUser() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Create user failed: ${JSON.stringify(data)}`)
  return data
}

async function updatePassword(userId) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Update password failed: ${await res.text()}`)
}

async function upsertAdminUser(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
    method: 'POST',
    headers: {
      ...AUTH_HEADERS,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: ADMIN_FULL_NAME,
      role_id: SUPER_ADMIN_ROLE_ID,
      is_active: true,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upsert admin_users failed: ${text}`)
  }
}

async function main() {
  console.log('🦷  Bright Smile — Admin Seed Script')
  console.log('────────────────────────────────────')

  // 1. Check if user already exists
  const users = await listUsers()
  const existing = users.find((u) => u.email === ADMIN_EMAIL)

  let userId

  if (existing) {
    console.log(`ℹ  Auth user already exists: ${ADMIN_EMAIL} (${existing.id})`)
    userId = existing.id
    await updatePassword(userId)
    console.log('✓  Password synced')
  } else {
    const newUser = await createUser()
    userId = newUser.id
    console.log(`✓  Created auth user: ${ADMIN_EMAIL} (${userId})`)
  }

  // 2. Upsert admin_users row
  await upsertAdminUser(userId)
  console.log('✓  admin_users row upserted (super_admin role)')

  console.log('')
  console.log('────────────────────────────────────')
  console.log('✅  Admin setup complete!')
  console.log(`    Email:    ${ADMIN_EMAIL}`)
  console.log(`    Password: K@thmandu1`)
  console.log(`    Role:     super_admin`)
  console.log('')
  console.log('    → npm run dev → visit /admin/login')
}

main().catch((err) => {
  console.error('✗  Error:', err.message)
  process.exit(1)
})
