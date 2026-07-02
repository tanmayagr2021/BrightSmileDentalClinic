// Static allowlist of every raw-URL image column that can reference a
// media_library asset. Mirrors scripts/backfill-media-library.mjs exactly.
// Used to (a) cascade-update a consumer row's URL column when an admin
// replaces an asset in the Media Library, and (b) look up human-readable
// "used in" context before a delete. Never derive this list dynamically —
// building a query from an unvalidated table/column name against the
// service-role client would be an arbitrary-write primitive.

export const MEDIA_USAGE_TARGETS = [
  { table: 'doctors', columns: ['profile_image_url'] },
  { table: 'gallery', columns: ['image_url', 'thumbnail_url'] },
  { table: 'showcase_slides', columns: ['image_url'] },
  { table: 'services', columns: ['thumbnail_url', 'banner_url'] },
  { table: 'blog_posts', columns: ['cover_image_url', 'og_image_url'] },
  { table: 'branding', columns: ['logo_url', 'logo_dark_url', 'favicon_url'] },
] as const

export function isTrackedColumn(table: string, column: string): boolean {
  return MEDIA_USAGE_TARGETS.some((t) => t.table === table && (t.columns as readonly string[]).includes(column))
}
