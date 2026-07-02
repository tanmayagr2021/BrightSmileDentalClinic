/**
 * One-off idempotent backfill — populates media_library with every object
 * already in Storage (uploaded before media_library existed), then
 * cross-references every known entity image-URL column to populate
 * media_usage. Read + insert only — never deletes or modifies Storage
 * objects or entity rows. Safe to re-run.
 *
 * Run with:
 *   node --env-file=.env.local scripts/backfill-media-library.mjs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Run: node --env-file=.env.local scripts/backfill-media-library.mjs')
  process.exit(1)
}

const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' }

const BUCKETS = ['doctor-photos', 'service-images', 'gallery', 'blog-images', 'testimonial-photos', 'branding', 'og-images', 'documents', 'misc']
const PUBLIC_BUCKETS = new Set(['doctor-photos', 'service-images', 'gallery', 'blog-images', 'testimonial-photos', 'branding', 'og-images'])

// entity_type: { table, columns[] } — every known raw-URL image column
const ENTITY_TARGETS = [
  { table: 'doctors', columns: ['profile_image_url'] },
  { table: 'gallery', columns: ['image_url', 'thumbnail_url'] },
  { table: 'showcase_slides', columns: ['image_url'] },
  { table: 'services', columns: ['thumbnail_url', 'banner_url'] },
  { table: 'blog_posts', columns: ['cover_image_url', 'og_image_url'] },
  { table: 'branding', columns: ['logo_url', 'logo_dark_url', 'favicon_url'] },
]

async function listAllObjects(bucket, prefix = '') {
  const results = []
  let offset = 0
  const limit = 100
  while (true) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prefix, limit, offset, sortBy: { column: 'name', order: 'asc' } }),
    })
    if (!res.ok) {
      console.error(`  ! list failed for ${bucket}/${prefix}: ${res.status} ${await res.text()}`)
      return results
    }
    const items = await res.json()
    if (!Array.isArray(items) || items.length === 0) break
    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) {
        // Folder — recurse
        const nested = await listAllObjects(bucket, fullPath)
        results.push(...nested)
      } else {
        results.push({ path: fullPath, size: item.metadata?.size ?? null, mimetype: item.metadata?.mimetype ?? null })
      }
    }
    if (items.length < limit) break
    offset += limit
  }
  return results
}

async function fetchExistingFilePaths() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/media_library?select=file_path`, { headers })
  const rows = await res.json()
  return new Set((rows ?? []).map((r) => r.file_path))
}

async function insertMediaLibraryRow(bucket, path, size, mimetype) {
  const fileName = path.split('/').pop()
  const body = {
    bucket,
    file_path: path,
    file_name: fileName,
    file_size: size,
    mime_type: mimetype,
    folder: bucket,
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/media_library`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation,resolution=ignore-duplicates' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.error(`  ! insert failed for ${bucket}/${path}: ${res.status} ${await res.text()}`)
    return null
  }
  const rows = await res.json()
  return rows?.[0] ?? null
}

function publicUrlFor(bucket, path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

async function main() {
  console.log('=== Step 1: Scan Storage buckets ===')
  const existingPaths = await fetchExistingFilePaths()
  console.log(`media_library already has ${existingPaths.size} rows.`)

  let inserted = 0
  let skipped = 0
  const allObjectsByUrl = new Map() // publicUrl -> media_library row (fetched or inserted)

  for (const bucket of BUCKETS) {
    const objects = await listAllObjects(bucket)
    console.log(`${bucket}: found ${objects.length} objects`)
    for (const obj of objects) {
      if (existingPaths.has(obj.path)) {
        skipped++
        continue
      }
      const row = await insertMediaLibraryRow(bucket, obj.path, obj.size, obj.mimetype)
      if (row) {
        inserted++
        existingPaths.add(obj.path)
      }
      if (PUBLIC_BUCKETS.has(bucket)) {
        allObjectsByUrl.set(publicUrlFor(bucket, obj.path), row)
      }
    }
  }
  console.log(`media_library: inserted ${inserted} new rows, skipped ${skipped} already-present.`)

  console.log('\n=== Step 2: Re-fetch full media_library for URL matching ===')
  const mlRes = await fetch(`${SUPABASE_URL}/rest/v1/media_library?select=id,bucket,file_path`, { headers })
  const mlRows = await mlRes.json()
  const mediaByUrl = new Map(mlRows.map((r) => [publicUrlFor(r.bucket, r.file_path), r.id]))
  console.log(`media_library now has ${mlRows.length} total rows.`)

  console.log('\n=== Step 3: Cross-reference entity image columns -> media_usage ===')
  let usageInserted = 0
  let usageSkippedNoMatch = 0
  let usageSkippedExisting = 0

  const existingUsageRes = await fetch(`${SUPABASE_URL}/rest/v1/media_usage?select=table_name,column_name,record_id`, { headers })
  const existingUsage = await existingUsageRes.json()
  const usageKey = (t, c, r) => `${t}::${c}::${r}`
  const existingUsageSet = new Set((existingUsage ?? []).map((u) => usageKey(u.table_name, u.column_name, u.record_id)))

  for (const { table, columns } of ENTITY_TARGETS) {
    const selectCols = ['id', ...columns].join(',')
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${selectCols}`, { headers })
    if (!res.ok) {
      console.error(`  ! failed to read ${table}: ${res.status} ${await res.text()}`)
      continue
    }
    const rows = await res.json()
    for (const row of rows) {
      for (const col of columns) {
        const url = row[col]
        if (!url || typeof url !== 'string') continue
        const mediaId = mediaByUrl.get(url)
        if (!mediaId) {
          usageSkippedNoMatch++
          continue
        }
        const key = usageKey(table, col, row.id)
        if (existingUsageSet.has(key)) {
          usageSkippedExisting++
          continue
        }
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/media_usage`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=ignore-duplicates' },
          body: JSON.stringify({ media_id: mediaId, table_name: table, column_name: col, record_id: row.id }),
        })
        if (insertRes.ok) {
          usageInserted++
        } else {
          console.error(`  ! media_usage insert failed for ${table}.${col}/${row.id}: ${insertRes.status} ${await insertRes.text()}`)
        }
      }
    }
  }

  console.log(`media_usage: inserted ${usageInserted}, already-present ${usageSkippedExisting}, no-match (non-Storage URL, e.g. local /images asset) ${usageSkippedNoMatch}.`)
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
