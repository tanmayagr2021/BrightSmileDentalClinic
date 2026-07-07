'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { MediaLibraryRow } from '@/types/db'
import { mediaDisplayUrl, RASTER_MIME_TYPES } from '@/lib/admin/media-url'
import { useFocusTrap } from '@/lib/use-focus-trap'
import { convertHeicIfNeeded } from '@/lib/admin/heic-convert'
import ImageCropModal from '@/components/admin/ImageCropModal'

export type MediaPickerSelection = { id: string; url: string; alt_text: string | null; width: number | null; height: number | null }

export type MediaPickerUsageContext = { table: string; column: string; recordId: string }

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (selection: MediaPickerSelection) => void
  /** Bucket used for uploads made from within the picker; also the default library filter. */
  bucket: string
  /** Optional folder for uploads made from within the picker. */
  folder?: string
  /** When provided, auto-upserts media_usage so the delete-block/replace-cascade logic tracks this reference. */
  usageContext?: MediaPickerUsageContext
  /** Target aspect ratio (width / height) shown as the crop boundary for new uploads. Defaults to 1 (square). */
  aspect?: number
  /** Shape of the crop boundary — 'round' for avatar-style circular images. Defaults to 'rect'. */
  cropShape?: 'rect' | 'round'
  /** Skips the crop step entirely — for assets like 360 panoramas where cropping would break the image. */
  disableCrop?: boolean
}

export default function MediaPicker({ open, onClose, onSelect, bucket, folder, usageContext, aspect = 1, cropShape = 'rect', disableCrop = false }: MediaPickerProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [items, setItems] = useState<MediaLibraryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<{ src: string; file: File } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setTab('library')
    setError(null)
    void loadLibrary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bucket])

  useFocusTrap(panelRef, open && !cropTarget, onClose)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const loadLibrary = async () => {
    setLoading(true)
    const params = new URLSearchParams({ bucket })
    const res = await fetch(`/api/admin/media?${params.toString()}`)
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  const finishSelection = async (media: MediaLibraryRow, url: string) => {
    if (usageContext) {
      await fetch('/api/admin/media-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: media.id,
          table_name: usageContext.table,
          column_name: usageContext.column,
          record_id: usageContext.recordId,
        }),
      }).catch(() => {})
    }
    onSelect({ id: media.id, url, alt_text: media.alt_text, width: media.width, height: media.height })
    onClose()
  }

  const handlePick = (item: MediaLibraryRow) => {
    const url = mediaDisplayUrl(item)
    if (!url) return
    void finishSelection(item, url)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', bucket)
    if (folder) fd.append('folder', folder)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({}))
    setUploading(false)
    if (!res.ok) { setError(data.error ?? 'Upload failed'); return }
    void finishSelection(data.media, data.url)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    let file = files[0]
    if (file.type === 'image/heic' || file.type === 'image/heif' || /\.hei[cf]$/i.test(file.name)) {
      setConverting(true)
      try {
        file = await convertHeicIfNeeded(file)
      } catch {
        setConverting(false)
        setError('Could not convert this HEIC photo — try exporting it as JPEG first.')
        return
      }
      setConverting(false)
    }
    if (!disableCrop && RASTER_MIME_TYPES.has(file.type)) {
      setCropTarget({ src: URL.createObjectURL(file), file })
      return
    }
    await uploadFile(file)
  }

  const handleCropCancel = () => {
    if (cropTarget) URL.revokeObjectURL(cropTarget.src)
    setCropTarget(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropTarget) return
    const { src, file } = cropTarget
    URL.revokeObjectURL(src)
    setCropTarget(null)
    const cropped = new File([blob], file.name, { type: file.type })
    await uploadFile(cropped)
  }

  if (!open) return null

  const filtered = search
    ? items.filter((i) => i.file_name.toLowerCase().includes(search.toLowerCase()) || (i.alt_text ?? '').toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="media-picker-title" className="font-heading text-sm font-semibold text-gray-800">Select an Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
        </div>

        <div className="mb-4 flex gap-2 rounded-xl border border-gray-100 bg-gray-50 p-1">
          <button
            onClick={() => setTab('library')}
            className={`flex-1 rounded-lg py-1.5 font-heading text-xs font-semibold transition-all ${tab === 'library' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
          >
            Media Library
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 rounded-lg py-1.5 font-heading text-xs font-semibold transition-all ${tab === 'upload' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
          >
            Upload New
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 font-body text-xs text-red-600">{error}</div>
        )}

        {tab === 'library' ? (
          <div className="flex-1 overflow-y-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            {loading ? (
              <p className="py-8 text-center font-body text-sm text-gray-400">Loading…</p>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {filtered.map((item) => {
                  const url = mediaDisplayUrl(item)
                  const canPreview = url && RASTER_MIME_TYPES.has(item.mime_type ?? '')
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePick(item)}
                      disabled={!url}
                      className="group relative h-24 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {canPreview ? (
                        <Image src={url} alt={item.alt_text ?? item.file_name} fill className="object-cover" sizes="150px" />
                      ) : (
                        <div className="flex h-full items-center justify-center font-body text-[0.6rem] text-gray-400">No preview</div>
                      )}
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate font-body text-[0.58rem] text-white">{item.file_name}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="py-8 text-center font-body text-sm text-gray-400">No images in this bucket yet.</p>
            )}
          </div>
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center hover:border-primary/30 cursor-pointer transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
          >
            <p className="font-heading text-sm font-semibold text-gray-600">
              {converting ? 'Converting HEIC photo…' : uploading ? 'Uploading…' : 'Drag & drop an image here, or click to browse'}
            </p>
            <p className="mt-1 font-body text-xs text-gray-400">Uploads to the {bucket} bucket · iPhone HEIC photos are converted automatically</p>
            <input ref={fileRef} type="file" accept="image/*,.heic,.heif" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </div>
        )}
      </div>

      {cropTarget && (
        <ImageCropModal
          imageSrc={cropTarget.src}
          mimeType={cropTarget.file.type}
          aspect={aspect}
          cropShape={cropShape}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}
