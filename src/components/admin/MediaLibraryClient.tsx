'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { MediaLibraryRow } from '@/types/db'
import { mediaDisplayUrl, RASTER_MIME_TYPES } from '@/lib/admin/media-url'

const BUCKETS = [
  'doctor-photos',
  'service-images',
  'gallery',
  'blog-images',
  'testimonial-photos',
  'branding',
  'og-images',
  'documents',
  'misc',
]

const displayUrl = mediaDisplayUrl
const RASTER_MIME = RASTER_MIME_TYPES

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-gray-300" aria-hidden="true">
      <path d="M6 2h9l5 5v15H6V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function MediaLibraryClient({ initialItems }: { initialItems: MediaLibraryRow[] }) {
  const [items, setItems] = useState(initialItems)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [search, setSearch] = useState('')
  const [bucketFilter, setBucketFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadBucket, setUploadBucket] = useState('gallery')
  const [uploadFolder, setUploadFolder] = useState('')
  const [selected, setSelected] = useState<MediaLibraryRow | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editFolder, setEditFolder] = useState('')
  const [editTags, setEditTags] = useState('')
  const [usageBlock, setUsageBlock] = useState<{ table_name: string; column_name: string; record_id: string }[] | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const replaceRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const refresh = async () => {
    const params = new URLSearchParams()
    if (showTrash) params.set('trash', 'true')
    const res = await fetch(`/api/admin/media?${params.toString()}`)
    if (res.ok) setItems(await res.json())
  }

  const switchView = async (trash: boolean) => {
    setShowTrash(trash)
    const params = new URLSearchParams()
    if (trash) params.set('trash', 'true')
    const res = await fetch(`/api/admin/media?${params.toString()}`)
    if (res.ok) setItems(await res.json())
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (bucketFilter && item.bucket !== bucketFilter) return false
      if (tagFilter && !item.tags.includes(tagFilter)) return false
      if (search) {
        const q = search.toLowerCase()
        if (!item.file_name.toLowerCase().includes(q) && !(item.alt_text ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [items, bucketFilter, tagFilter, search])

  const allTags = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    let successCount = 0
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', uploadBucket)
      if (uploadFolder.trim()) fd.append('folder', uploadFolder.trim())
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        showToast(`${file.name}: ${data.error ?? 'upload failed'}`, false)
        continue
      }
      successCount++
    }
    if (successCount > 0) {
      showToast(`${successCount} file${successCount > 1 ? 's' : ''} uploaded`, true)
      await refresh()
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const openDetail = (item: MediaLibraryRow) => {
    setSelected(item)
    setEditAlt(item.alt_text ?? '')
    setEditCaption(item.caption ?? '')
    setEditFolder(item.folder ?? '')
    setEditTags(item.tags.join(', '))
    setUsageBlock(null)
  }

  const saveDetail = async () => {
    if (!selected) return
    const res = await fetch(`/api/admin/media/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alt_text: editAlt.trim() || null,
        caption: editCaption.trim() || null,
        folder: editFolder.trim() || null,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    })
    if (!res.ok) { showToast('Failed to save', false); return }
    const updated = await res.json()
    setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
    setSelected((prev) => (prev ? { ...prev, ...updated } : prev))
    showToast('Saved', true)
  }

  const handleReplace = async (file: File | null) => {
    if (!file || !selected) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/admin/media/${selected.id}/replace`, { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({}))
    setUploading(false)
    if (!res.ok) { showToast(data.error ?? 'Replace failed', false); return }
    showToast(data.cascaded?.length ? `Replaced — updated ${data.cascaded.length} live reference(s)` : 'Replaced', true)
    await refresh()
    setSelected(null)
    if (replaceRef.current) replaceRef.current.value = ''
  }

  const handleDelete = async (item: MediaLibraryRow, permanent: boolean) => {
    if (permanent && !confirm(`Permanently delete "${item.file_name}"? This cannot be undone.`)) return
    if (!permanent && !confirm(`Move "${item.file_name}" to Trash?`)) return

    const res = await fetch(`/api/admin/media/${item.id}${permanent ? '?permanent=true' : ''}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (res.status === 409) {
      setUsageBlock(data.usage ?? [])
      showToast('Cannot delete — this asset is still in use', false)
      return
    }
    if (!res.ok) { showToast(data.error ?? 'Delete failed', false); return }
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    setSelected(null)
    showToast(permanent ? 'Permanently deleted' : 'Moved to Trash', true)
  }

  const handleRestore = async (item: MediaLibraryRow) => {
    const res = await fetch(`/api/admin/media/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_deleted: false }),
    })
    if (!res.ok) { showToast('Restore failed', false); return }
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    showToast('Restored', true)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Media Library</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Every image used across the site — searchable, tagged, and safe to replace.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => switchView(false)}
            className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold transition-all ${!showTrash ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600'}`}
          >
            Library
          </button>
          <button
            onClick={() => switchView(true)}
            className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold transition-all ${showTrash ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600'}`}
          >
            Trash
          </button>
        </div>
      </div>

      {!showTrash && (
        <>
          <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div>
              <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Bucket</label>
              <select value={uploadBucket} onChange={(e) => setUploadBucket(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary">
                {BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Folder (optional)</label>
              <input value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} placeholder="e.g. hero" className="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary" />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : 'Upload Files'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </div>

          <div
            className="mb-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center hover:border-primary/30 cursor-pointer transition-colors group"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
          >
            <p className="font-heading text-sm font-semibold text-gray-600 group-hover:text-primary/60 transition-colors">
              {uploading ? 'Uploading…' : 'Drag & drop files here, or click Upload Files above'}
            </p>
          </div>
        </>
      )}

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search filename or alt text…"
          className="flex-1 min-w-[200px] rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <select value={bucketFilter} onChange={(e) => setBucketFilter(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary">
          <option value="">All buckets</option>
          {BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        {allTags.length > 0 && (
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary">
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      <p className="mb-3 font-body text-xs text-gray-500">{filtered.length} of {items.length} {showTrash ? 'items in Trash' : 'items'}</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((item) => {
            const url = displayUrl(item)
            const canPreview = url && RASTER_MIME.has(item.mime_type ?? '')
            return (
              <div key={item.id} className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <button onClick={() => openDetail(item)} className="block w-full">
                  <div className="relative h-28 w-full bg-gray-100">
                    {canPreview ? (
                      <Image src={url} alt={item.alt_text ?? item.file_name} fill className="object-cover" sizes="200px" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><FileIcon /></div>
                    )}
                    {item.usage_count > 0 && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-green-600 px-1.5 py-0.5 font-heading text-[0.55rem] font-bold text-white">
                        In use ×{item.usage_count}
                      </span>
                    )}
                  </div>
                </button>
                <div className="bg-white p-2.5">
                  <p className="font-heading text-[0.65rem] font-semibold text-gray-700 truncate">{item.file_name}</p>
                  <p className="font-body text-[0.58rem] text-gray-400 mt-0.5">{item.bucket} · {formatSize(item.file_size)}</p>
                  {showTrash && (
                    <div className="mt-2 flex gap-1.5">
                      <button onClick={() => handleRestore(item)} className="flex-1 rounded-lg border border-gray-200 py-1 font-heading text-[0.58rem] font-semibold text-gray-600 hover:border-primary/30">Restore</button>
                      <button onClick={() => handleDelete(item, true)} className="flex-1 rounded-lg border border-red-100 py-1 font-heading text-[0.58rem] font-semibold text-red-500 hover:bg-red-50">Delete Forever</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <p className="font-heading text-sm text-gray-600">{showTrash ? 'Trash is empty.' : 'No media yet.'}</p>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold text-gray-800">{selected.file_name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {displayUrl(selected) && RASTER_MIME.has(selected.mime_type ?? '') && (
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                <Image src={displayUrl(selected)!} alt={selected.alt_text ?? selected.file_name} fill className="object-contain" sizes="500px" />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Alt text</label>
                <input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Caption</label>
                <input value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Folder</label>
                <input value={editFolder} onChange={(e) => setEditFolder(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Tags (comma-separated)</label>
                <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
              <p className="font-body text-xs text-gray-400">{selected.width && selected.height ? `${selected.width}×${selected.height} · ` : ''}{formatSize(selected.file_size)} · {selected.bucket}</p>

              {usageBlock && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="font-heading text-xs font-semibold text-amber-700">Cannot delete — in use:</p>
                  <ul className="mt-1 space-y-0.5">
                    {usageBlock.map((u, i) => (
                      <li key={i} className="font-body text-[0.7rem] text-amber-700">{u.table_name}.{u.column_name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={saveDetail} className="rounded-xl bg-primary px-4 py-2 font-heading text-xs font-semibold text-white hover:bg-primary-dark">Save</button>
                <button onClick={() => replaceRef.current?.click()} disabled={uploading} className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 hover:border-primary/30 disabled:opacity-60">
                  {uploading ? 'Replacing…' : 'Replace File'}
                </button>
                <input ref={replaceRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleReplace(e.target.files?.[0] ?? null)} />
                <button onClick={() => handleDelete(selected, false)} className="ml-auto rounded-xl border border-red-100 px-4 py-2 font-heading text-xs font-semibold text-red-500 hover:bg-red-50">
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
