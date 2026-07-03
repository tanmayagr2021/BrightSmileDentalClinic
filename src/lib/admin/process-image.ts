import sharp from 'sharp'

export type BucketConfig = { public: boolean; maxSize: number; mimeTypes: string[] | null }

export const MEDIA_BUCKETS: Record<string, BucketConfig> = {
  'doctor-photos': { public: true, maxSize: 5_242_880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  'service-images': { public: true, maxSize: 5_242_880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  gallery: { public: true, maxSize: 10_485_760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  'blog-images': { public: true, maxSize: 10_485_760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  'testimonial-photos': { public: true, maxSize: 2_097_152, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  branding: { public: true, maxSize: 2_097_152, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/svg+xml'] },
  'og-images': { public: true, maxSize: 5_242_880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  documents: { public: false, maxSize: 20_971_520, mimeTypes: ['application/pdf'] },
  misc: { public: false, maxSize: 5_242_880, mimeTypes: null },
  'virtual-tour': { public: true, maxSize: 20_971_520, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  'tooth-explorer': { public: true, maxSize: 10_485_760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  'trust-wall': { public: true, maxSize: 5_242_880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
}

// Only these formats are safe to run through sharp's resize pipeline —
// SVG/ICO would get rasterized (destroying vector scaling for logos/favicons).
const RASTER_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_DIMENSION = 2400

export const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
}

// .rotate() with no args auto-orients from EXIF; sharp drops all metadata
// (including EXIF) on output unless .withMetadata() is called — so this
// also satisfies the "strip EXIF" requirement with no extra step.
export async function processImage(
  buffer: Buffer,
  mimeType: string,
  bucket: string
): Promise<{ buffer: Buffer; width: number | null; height: number | null }> {
  if (!RASTER_MIME_TYPES.has(mimeType)) {
    return { buffer, width: null, height: null }
  }
  // 360 panoramas are equirectangular — a 2:1 image needs far more than
  // MAX_DIMENSION on its long edge or the tour looks blurry when zoomed in.
  const PANORAMA_MAX_DIMENSION = 8000
  const pipeline = bucket === 'og-images'
    ? sharp(buffer).rotate().resize(1200, 630, { fit: 'cover', position: 'centre' })
    : bucket === 'virtual-tour'
    ? sharp(buffer).rotate().resize({ width: PANORAMA_MAX_DIMENSION, height: PANORAMA_MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    : sharp(buffer).rotate().resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
  return { buffer: data, width: info.width, height: info.height }
}
