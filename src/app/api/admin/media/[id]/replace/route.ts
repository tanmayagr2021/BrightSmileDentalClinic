import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { MEDIA_BUCKETS, EXT_BY_MIME, processImage } from '@/lib/admin/process-image'
import { isTrackedColumn } from '@/lib/admin/media-usage-config'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

// Replaces the underlying file for an existing media_library row, then
// cascade-updates every tracked consumer's URL column (media_usage) so
// the new file appears everywhere the old one was referenced — without
// the admin having to re-pick the image on every edit screen.
export async function POST(req: NextRequest, { params }: Params) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { data: existing, error: fetchError } = await supabase
    .from('media_library')
    .select('bucket, file_path')
    .eq('id', id)
    .single()
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const config = MEDIA_BUCKETS[existing.bucket]
  if (file.size > config.maxSize) {
    return NextResponse.json({ error: `File exceeds the ${Math.round(config.maxSize / 1_048_576)}MB limit for this bucket` }, { status: 400 })
  }
  const mimeType = file.type || 'application/octet-stream'
  if (config.mimeTypes && !config.mimeTypes.includes(mimeType)) {
    return NextResponse.json({ error: `File type ${mimeType} is not allowed in this bucket` }, { status: 400 })
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const { buffer: outBuffer, width, height } = await processImage(rawBuffer, mimeType, existing.bucket)

  const ext = EXT_BY_MIME[mimeType] ?? file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  // Preserve whatever path structure the original file actually had —
  // `folder` is just an organizational label (defaults to the bucket name)
  // and is not necessarily a real Storage path prefix.
  const lastSlash = existing.file_path.lastIndexOf('/')
  const pathPrefix = lastSlash >= 0 ? existing.file_path.slice(0, lastSlash) : null
  const newPath = pathPrefix ? `${pathPrefix}/${randomUUID()}.${ext}` : `${randomUUID()}.${ext}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(existing.bucket)
    .upload(newPath, outBuffer, { contentType: mimeType, upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  let newUrl: string
  if (config.public) {
    newUrl = supabase.storage.from(existing.bucket).getPublicUrl(uploadData.path).data.publicUrl
  } else {
    const { data: signed, error: signError } = await supabase.storage
      .from(existing.bucket)
      .createSignedUrl(uploadData.path, 3600)
    if (signError) return NextResponse.json({ error: signError.message }, { status: 500 })
    newUrl = signed.signedUrl
  }

  const { data: media, error: mediaError } = await supabase
    .from('media_library')
    .update({
      file_path: uploadData.path,
      file_name: file.name,
      file_size: outBuffer.length,
      mime_type: mimeType,
      width,
      height,
    })
    .eq('id', id)
    .select()
    .single()
  if (mediaError) return NextResponse.json({ error: mediaError.message }, { status: 500 })

  const { data: usage } = await supabase
    .from('media_usage')
    .select('table_name, column_name, record_id')
    .eq('media_id', id)

  const cascaded: string[] = []
  for (const row of usage ?? []) {
    if (!isTrackedColumn(row.table_name, row.column_name)) continue
    const { error: cascadeError } = await supabase
      .from(row.table_name)
      .update({ [row.column_name]: newUrl })
      .eq('id', row.record_id)
    if (!cascadeError) cascaded.push(`${row.table_name}.${row.column_name}`)
  }

  await supabase.storage.from(existing.bucket).remove([existing.file_path])

  if (cascaded.length > 0) revalidatePath('/', 'layout')

  return NextResponse.json({ url: newUrl, media, cascaded })
}
