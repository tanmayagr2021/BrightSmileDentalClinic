import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { MEDIA_BUCKETS, EXT_BY_MIME, processImage } from '@/lib/admin/process-image'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as string | null) ?? 'gallery'
  const folder = (formData.get('folder') as string | null)?.trim() || null
  const altText = (formData.get('alt_text') as string | null)?.trim() || null
  const tagsRaw = (formData.get('tags') as string | null) ?? ''
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const config = MEDIA_BUCKETS[bucket]
  if (!config) return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  if (file.size > config.maxSize) {
    return NextResponse.json({ error: `File exceeds the ${Math.round(config.maxSize / 1_048_576)}MB limit for this bucket` }, { status: 400 })
  }
  const mimeType = file.type || 'application/octet-stream'
  if (config.mimeTypes && !config.mimeTypes.includes(mimeType)) {
    return NextResponse.json({ error: `File type ${mimeType} is not allowed in this bucket` }, { status: 400 })
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const { buffer: outBuffer, width, height } = await processImage(rawBuffer, mimeType, bucket)

  const ext = EXT_BY_MIME[mimeType] ?? file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const filePath = folder ? `${folder}/${randomUUID()}.${ext}` : `${randomUUID()}.${ext}`

  const supabase = createAdminClient()
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, outBuffer, { contentType: mimeType, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  let url: string
  if (config.public) {
    url = supabase.storage.from(bucket).getPublicUrl(uploadData.path).data.publicUrl
  } else {
    const { data: signed, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(uploadData.path, 3600)
    if (signError) return NextResponse.json({ error: signError.message }, { status: 500 })
    url = signed.signedUrl
  }

  const { data: media, error: mediaError } = await supabase
    .from('media_library')
    .insert({
      bucket,
      file_path: uploadData.path,
      file_name: file.name,
      file_size: outBuffer.length,
      mime_type: mimeType,
      width,
      height,
      alt_text: altText,
      folder: folder ?? bucket,
      tags,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (mediaError) return NextResponse.json({ error: mediaError.message }, { status: 500 })

  return NextResponse.json({ url, path: uploadData.path, media })
}
