// iPhone's default photo format is HEIC, which none of the upload buckets
// accept (sharp's prebuilt binaries don't include HEIC/HEIF decode support
// due to codec licensing, so accepting it server-side would be unreliable
// on Vercel). Converting client-side with heic2any avoids that entirely.
export async function convertHeicIfNeeded(file: File): Promise<File> {
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
    || /\.hei[cf]$/i.test(file.name)
  if (!isHeic) return file

  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
  const blob = Array.isArray(result) ? result[0] : result
  return new File([blob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' })
}
