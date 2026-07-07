'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MediaPicker, { type MediaPickerSelection } from '@/components/admin/MediaPicker'
import ImageCropModal from '@/components/admin/ImageCropModal'

type GalleryGroup = { id: string; name: string; slug: string }
type GalleryItem = {
  id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  is_visible: boolean
  is_featured: boolean
  sort_order: number
  gallery_groups: { id: string; name: string; slug: string } | null
}

export default function GalleryClient({
  items: initialItems,
  groups,
}: {
  items: GalleryItem[]
  groups: GalleryGroup[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [items, setItems] = useState(initialItems)
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editGroupId, setEditGroupId] = useState<string>('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [cropQueue, setCropQueue] = useState<File[]>([])
  const [cropTarget, setCropTarget] = useState<{ src: string; file: File } | null>(null)
  const uploadedCountRef = useRef(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const filtered = activeGroup === 'all'
    ? items
    : items.filter((i) => i.gallery_groups?.slug === activeGroup)

  const uploadAndCreate = async (file: File): Promise<GalleryItem | null> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'gallery')

    const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (!uploadRes.ok) { showToast(`Upload failed: ${file.name}`, false); return null }
    const { url } = await uploadRes.json()

    const createRes = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, alt_text: file.name.replace(/\.[^.]+$/, ''), group_id: activeGroup !== 'all' ? groups.find(g => g.slug === activeGroup)?.id : null }),
    })
    if (!createRes.ok) { showToast('Failed to save photo', false); return null }
    const item = await createRes.json()
    return { ...item, gallery_groups: groups.find(g => g.id === item.group_id) ?? null }
  }

  const finishBatch = () => {
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    if (uploadedCountRef.current > 0) showToast(`${uploadedCountRef.current} photo${uploadedCountRef.current > 1 ? 's' : ''} uploaded`, true)
    uploadedCountRef.current = 0
    startTransition(() => router.refresh())
  }

  // Crops one photo at a time — react-easy-crop only ever edits a single
  // image, so a multi-file drop is worked through as a queue.
  const advanceCropQueue = (queue: File[]) => {
    const [next, ...rest] = queue
    if (!next) { finishBatch(); return }
    setCropQueue(rest)
    setCropTarget({ src: URL.createObjectURL(next), file: next })
  }

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    uploadedCountRef.current = 0
    advanceCropQueue(Array.from(files))
  }

  const handleCropCancel = () => {
    if (cropTarget) URL.revokeObjectURL(cropTarget.src)
    setCropTarget(null)
    finishBatch()
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropTarget) return
    const { src, file } = cropTarget
    URL.revokeObjectURL(src)
    setCropTarget(null)
    const cropped = new File([blob], file.name, { type: file.type })
    const item = await uploadAndCreate(cropped)
    if (item) {
      setItems((prev) => [...prev, item])
      uploadedCountRef.current += 1
    }
    advanceCropQueue(cropQueue)
  }

  const handleLibrarySelect = async (selection: MediaPickerSelection) => {
    const createRes = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: selection.url, alt_text: selection.alt_text, group_id: activeGroup !== 'all' ? groups.find(g => g.slug === activeGroup)?.id : null }),
    })
    if (!createRes.ok) { showToast('Failed to save photo', false); return }
    const item = await createRes.json()
    setItems((prev) => [...prev, { ...item, gallery_groups: groups.find(g => g.id === item.group_id) ?? null }])
    await fetch('/api/admin/media-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: selection.id, table_name: 'gallery', column_name: 'image_url', record_id: item.id }),
    }).catch(() => {})
    showToast('Photo added from library', true)
    startTransition(() => router.refresh())
  }

  const toggleVisibility = async (item: GalleryItem) => {
    const res = await fetch(`/api/admin/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !item.is_visible }),
    })
    if (!res.ok) { showToast('Failed to update', false); return }
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_visible: !i.is_visible } : i))
  }

  const deleteItem = async (item: GalleryItem) => {
    if (!confirm('Remove this photo from the gallery?')) return
    const res = await fetch(`/api/admin/gallery/${item.id}`, { method: 'DELETE' })
    if (!res.ok) { showToast('Failed to delete', false); return }
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    showToast('Photo removed', true)
    startTransition(() => router.refresh())
  }

  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setEditAlt(item.alt_text ?? '')
    setEditCaption(item.caption ?? '')
    setEditGroupId(item.gallery_groups?.id ?? '')
  }

  const saveEdit = async (item: GalleryItem) => {
    const res = await fetch(`/api/admin/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alt_text: editAlt.trim() || null,
        caption: editCaption.trim() || null,
        group_id: editGroupId || null,
      }),
    })
    if (!res.ok) { showToast('Failed to save', false); return }
    const updated = await res.json()
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...updated, gallery_groups: groups.find(g => g.id === updated.group_id) ?? null } : i))
    setEditingId(null)
    showToast('Saved', true)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Gallery</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage clinic photos shown on the public gallery page.</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
        >
          {uploading ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
          ) : (
            <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {uploading ? 'Uploading…' : 'Upload Photos'}
        </button>
        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-primary/30 hover:text-primary"
        >
          Choose from Library
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleLibrarySelect}
        bucket="gallery"
      />

      {cropTarget && (
        <ImageCropModal
          imageSrc={cropTarget.src}
          mimeType={cropTarget.file.type}
          aspect={1}
          cropShape="rect"
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: items.length },
          { label: 'Visible', value: items.filter((g) => g.is_visible).length },
          { label: 'Hidden', value: items.filter((g) => !g.is_visible).length },
          { label: 'Categories', value: groups.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveGroup('all')}
          className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold capitalize transition-all ${activeGroup === 'all' ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-500 hover:border-primary/30 hover:text-primary'}`}
        >
          All Photos ({items.length})
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.slug)}
            className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold capitalize transition-all ${activeGroup === g.slug ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-500 hover:border-primary/30 hover:text-primary'}`}
          >
            {g.name} ({items.filter(i => i.gallery_groups?.id === g.id).length})
          </button>
        ))}
      </div>

      {/* Upload drop zone */}
      <div
        className="mb-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center hover:border-primary/30 cursor-pointer transition-colors group"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-10 w-10 text-gray-300 group-hover:text-primary/30 transition-colors" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 15l5-4 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-3 font-heading text-sm font-semibold text-gray-600 group-hover:text-primary/60 transition-colors">
          {uploading ? 'Uploading…' : 'Drag & drop photos here or click to browse'}
        </p>
        <p className="font-body text-xs text-gray-300 mt-1">JPG, PNG, WebP up to 10 MB each</p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-xl border overflow-hidden transition-all ${item.is_visible ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}
            >
              {/* Photo */}
              <div className="relative h-32 w-full bg-gray-100">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.alt_text ?? 'Gallery photo'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-gray-300" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 15l5-4 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Edit form or info */}
              <div className="bg-white p-3">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <input
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Alt text"
                      className="w-full rounded-lg border border-gray-200 px-2 py-1 text-[0.65rem] font-body text-gray-700 outline-none focus:border-primary"
                    />
                    <input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Caption (optional)"
                      className="w-full rounded-lg border border-gray-200 px-2 py-1 text-[0.65rem] font-body text-gray-700 outline-none focus:border-primary"
                    />
                    <select
                      value={editGroupId}
                      onChange={(e) => setEditGroupId(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-2 py-1 text-[0.65rem] font-body text-gray-700 outline-none focus:border-primary"
                    >
                      <option value="">No category</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <div className="flex gap-1.5">
                      <button onClick={() => saveEdit(item)} className="flex-1 rounded-lg bg-primary py-1 font-heading text-[0.58rem] font-semibold text-white">Save</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg border border-gray-200 py-1 font-heading text-[0.58rem] font-semibold text-gray-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-heading text-[0.65rem] font-semibold text-gray-700 truncate">{item.alt_text || 'Untitled'}</p>
                    <p className="font-body text-[0.58rem] text-gray-600 mt-0.5">{item.gallery_groups?.name ?? 'Uncategorised'}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        onClick={() => toggleVisibility(item)}
                        className={`flex-1 rounded-lg border py-1 font-heading text-[0.58rem] font-semibold text-center transition-all ${item.is_visible ? 'border-green-200 bg-green-50 text-green-600' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                      >
                        {item.is_visible ? 'Visible' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:border-primary/30 hover:text-primary"
                        aria-label="Edit"
                      >
                        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-red-100 text-red-400 transition-all hover:border-red-200 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-10 w-10 text-gray-200 mb-3" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 15l5-4 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-heading text-sm text-gray-600 mb-3">No photos yet.</p>
          <button onClick={() => fileRef.current?.click()} className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white hover:bg-primary-dark">
            Upload First Photo
          </button>
        </div>
      )}
    </div>
  )
}
