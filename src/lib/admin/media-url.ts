export const PUBLIC_MEDIA_BUCKETS = new Set([
  'doctor-photos', 'service-images', 'gallery', 'blog-images', 'testimonial-photos', 'branding', 'og-images',
  'virtual-tour', 'tooth-explorer', 'trust-wall',
])
export const RASTER_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function mediaDisplayUrl(item: { bucket: string; file_path: string }): string | null {
  if (!PUBLIC_MEDIA_BUCKETS.has(item.bucket)) return null
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${item.bucket}/${item.file_path}`
}
