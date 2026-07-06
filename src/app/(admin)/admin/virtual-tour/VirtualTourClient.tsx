'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MediaPicker, { type MediaPickerSelection } from '@/components/admin/MediaPicker'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import type { RoomWithRelations } from './page'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Photo Sphere Viewer expects equirectangular panoramas, which are ~2:1.
// Accept a tolerance band rather than hard-blocking, since an admin may
// deliberately choose a slightly different ratio.
function panoramaAspectWarning(width: number | null, height: number | null): string | null {
  if (!width || !height) return null
  const ratio = width / height
  if (ratio >= 1.8 && ratio <= 2.2) return null
  return `This image is ${width}×${height} (~${ratio.toFixed(2)}:1). Panoramas should be roughly 2:1 equirectangular (e.g. 4096×2048) or they'll appear stretched in the viewer.`
}

export default function VirtualTourClient({ initialRooms }: { initialRooms: RoomWithRelations[] }) {
  const router = useRouter()
  const [rooms, setRooms] = useState(initialRooms)

  // router.refresh() re-fetches the Server Component and delivers new props,
  // but useState only reads its initial value once — without this, joined
  // fields (thumbnail/panorama/gallery media) never appear until a hard reload.
  useEffect(() => setRooms(initialRooms), [initialRooms])
  const [selectedId, setSelectedId] = useState<string | null>(initialRooms[0]?.id ?? null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [creating, setCreating] = useState(false)
  const [picker, setPicker] = useState<'thumbnail' | 'panorama' | 'gallery' | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const refresh = () => router.refresh()

  const selected = rooms.find((r) => r.id === selectedId) ?? null

  const [form, setForm] = useState(() => ({
    name: selected?.name ?? '',
    slug: selected?.slug ?? '',
    description: selected?.description ?? '',
    cta_label: selected?.cta_label ?? '',
    cta_link: selected?.cta_link ?? '',
  }))

  const selectRoom = (room: RoomWithRelations) => {
    setSelectedId(room.id)
    setForm({
      name: room.name,
      slug: room.slug,
      description: room.description ?? '',
      cta_label: room.cta_label ?? '',
      cta_link: room.cta_link ?? '',
    })
  }

  const patchRoom = async (id: string, updates: Record<string, unknown>, quiet = false) => {
    const res = await fetch(`/api/admin/virtual-tour/rooms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) { if (!quiet) showToast(data.error ?? 'Failed to save', false); return null }
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...data } : r)))
    return data
  }

  const handleCreate = async () => {
    if (!newRoomName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/virtual-tour/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName.trim(), slug: slugify(newRoomName) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create')
      const newRoom = { ...data, thumbnail: null, panorama: null, gallery: [], hotspots: [] }
      setRooms((rs) => [...rs, newRoom])
      setNewRoomName('')
      showToast('Room created', true)
      refresh()
      selectRoom(newRoom)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setCreating(false)
    }
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const data = await patchRoom(selected.id, {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      description: form.description.trim() || null,
      cta_label: form.cta_label.trim() || null,
      cta_link: form.cta_link.trim() || null,
    })
    setSaving(false)
    if (data) showToast('Room saved', true)
  }

  const handleDelete = async (room: RoomWithRelations) => {
    if (!confirm(`Delete "${room.name}"? Any hotspots linking to it will also be removed.`)) return
    const res = await fetch(`/api/admin/virtual-tour/rooms/${room.id}`, { method: 'DELETE' })
    if (!res.ok) { showToast('Failed to delete', false); return }
    setRooms((rs) => rs.filter((r) => r.id !== room.id))
    if (selectedId === room.id) setSelectedId(null)
    showToast('Room deleted', true)
    refresh()
  }

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= rooms.length) return
    const a = rooms[idx]
    const b = rooms[target]
    const next = [...rooms]
    next[idx] = { ...b, sort_order: a.sort_order }
    next[target] = { ...a, sort_order: b.sort_order }
    next.sort((x, y) => x.sort_order - y.sort_order)
    setRooms(next)
    await Promise.all([
      patchRoom(a.id, { sort_order: b.sort_order }, true),
      patchRoom(b.id, { sort_order: a.sort_order }, true),
    ])
  }

  const handleMediaSelect = async (selection: MediaPickerSelection) => {
    if (!selected || !picker) return
    if (picker === 'thumbnail') {
      await patchRoom(selected.id, { thumbnail_media_id: selection.id })
      showToast('Thumbnail updated', true)
    } else if (picker === 'panorama') {
      await patchRoom(selected.id, { panorama_media_id: selection.id })
      showToast('360° panorama updated', true)
    } else if (picker === 'gallery') {
      const res = await fetch('/api/admin/virtual-tour/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: selected.id, media_id: selection.id }),
      })
      if (res.ok) showToast('Added to gallery', true)
    }
    setPicker(null)
    refresh()
  }

  const removeGalleryImage = async (galleryId: string) => {
    const res = await fetch(`/api/admin/virtual-tour/gallery/${galleryId}`, { method: 'DELETE' })
    if (res.ok) {
      setRooms((rs) => rs.map((r) => r.id === selectedId ? { ...r, gallery: r.gallery.filter((g) => g.id !== galleryId) } : r))
      refresh()
    }
  }

  const addHotspot = async () => {
    if (!selected) return
    const target = rooms.find((r) => r.id !== selected.id)
    if (!target) { showToast('Add another room first', false); return }
    const res = await fetch('/api/admin/virtual-tour/hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: selected.id, target_room_id: target.id, yaw: 0, pitch: 0, label: `Go to ${target.name}` }),
    })
    if (res.ok) { showToast('Hotspot added', true); refresh() }
  }

  const patchHotspot = async (hotspotId: string, updates: Record<string, unknown>) => {
    await fetch(`/api/admin/virtual-tour/hotspots/${hotspotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setRooms((rs) => rs.map((r) => r.id === selectedId
      ? { ...r, hotspots: r.hotspots.map((h) => h.id === hotspotId ? { ...h, ...updates } : h) }
      : r))
  }

  const removeHotspot = async (hotspotId: string) => {
    const res = await fetch(`/api/admin/virtual-tour/hotspots/${hotspotId}`, { method: 'DELETE' })
    if (res.ok) {
      setRooms((rs) => rs.map((r) => r.id === selectedId ? { ...r, hotspots: r.hotspots.filter((h) => h.id !== hotspotId) } : r))
      refresh()
    }
  }

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Room list */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <div className="flex gap-2">
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="New room name…"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newRoomName.trim()}
              className="rounded-lg bg-primary px-3 py-2 font-heading text-xs font-semibold text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {rooms.map((room, idx) => (
            <button
              key={room.id}
              onClick={() => selectRoom(room)}
              className={`w-full text-left rounded-2xl border p-3 transition-all flex items-center gap-3 ${
                selectedId === room.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {room.thumbnail && mediaDisplayUrl(room.thumbnail) ? (
                  <Image src={mediaDisplayUrl(room.thumbnail)!} alt="" fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="flex h-full items-center justify-center font-heading text-[0.55rem] text-gray-400">No img</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-xs font-semibold text-gray-800">{room.name}</p>
                <p className="font-body text-[0.6rem] text-gray-500">{room.is_visible ? 'Visible' : 'Hidden'} · {room.gallery.length} photos · {room.hotspots.length} hotspots</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); void handleMove(idx, -1) }}
                  className="text-gray-400 hover:text-primary disabled:opacity-30 text-[0.6rem]"
                >▲</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); void handleMove(idx, 1) }}
                  className="text-gray-400 hover:text-primary disabled:opacity-30 text-[0.6rem]"
                >▼</span>
              </div>
            </button>
          ))}
          {rooms.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center font-body text-xs text-gray-400">No rooms yet. Add your first room above.</p>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="flex-1 min-w-0 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-gray-900">{selected.name}</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => patchRoom(selected.id, { is_visible: !selected.is_visible })}
                  className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${selected.is_visible ? 'bg-primary' : 'bg-gray-200'}`}
                  role="switch"
                  aria-checked={selected.is_visible}
                  title="Visible on public site"
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${selected.is_visible ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <button onClick={() => handleDelete(selected)} className="font-heading text-xs font-semibold text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Room Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">CTA Label</label>
                <input value={form.cta_label} onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))} placeholder="e.g. Book a Consultation" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">CTA Link</label>
                <input value={form.cta_link} onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))} placeholder="/contact" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Room'}
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-heading text-sm font-semibold text-gray-800">Images</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-1.5 font-body text-xs text-gray-500">Thumbnail</p>
                <button onClick={() => setPicker('thumbnail')} className="relative block h-28 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 hover:border-primary/40">
                  {selected.thumbnail && mediaDisplayUrl(selected.thumbnail) ? (
                    <Image src={mediaDisplayUrl(selected.thumbnail)!} alt="" fill className="object-cover" sizes="200px" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-body text-xs text-gray-400">Choose image</span>
                  )}
                </button>
              </div>
              <div>
                <p className="mb-1.5 font-body text-xs text-gray-500">360° Panorama</p>
                <button onClick={() => setPicker('panorama')} className="relative block h-28 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 hover:border-primary/40">
                  {selected.panorama && mediaDisplayUrl(selected.panorama) ? (
                    <Image src={mediaDisplayUrl(selected.panorama)!} alt="" fill className="object-cover" sizes="200px" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-body text-xs text-gray-400">Choose 360° image</span>
                  )}
                </button>
                {selected.panorama && (() => {
                  const warning = panoramaAspectWarning(selected.panorama.width, selected.panorama.height)
                  return warning ? (
                    <p className="mt-1.5 flex items-start gap-1 font-body text-[0.65rem] leading-snug text-amber-600">
                      <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true">
                        <path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 003.82 21h16.36a2 2 0 001.71-2.96L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {warning}
                    </p>
                  ) : null
                })()}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="font-body text-xs text-gray-500">Gallery</p>
                <button onClick={() => setPicker('gallery')} className="font-heading text-[0.62rem] font-semibold text-primary hover:underline">+ Add photo</button>
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {selected.gallery.map((g) => (
                  <div key={g.id} className="group relative h-16 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {g.media && mediaDisplayUrl(g.media) && (
                      <Image src={mediaDisplayUrl(g.media)!} alt="" fill className="object-cover" sizes="100px" />
                    )}
                    <button
                      onClick={() => removeGalleryImage(g.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 font-heading text-[0.6rem]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {selected.gallery.length === 0 && <p className="col-span-full font-body text-[0.65rem] text-gray-400">No gallery photos yet.</p>}
              </div>
            </div>
          </div>

          {/* Hotspots */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-gray-800">Hotspots (navigate to another room)</h3>
              <button onClick={addHotspot} className="font-heading text-[0.62rem] font-semibold text-primary hover:underline">+ Add Hotspot</button>
            </div>
            <div className="space-y-2">
              {selected.hotspots.map((h) => (
                <div key={h.id} className="grid grid-cols-1 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[1fr_1fr_80px_80px_auto]">
                  <select
                    value={h.target_room_id}
                    onChange={(e) => patchHotspot(h.id, { target_room_id: e.target.value })}
                    className="rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-900 outline-none focus:border-primary"
                  >
                    {rooms.filter((r) => r.id !== selected.id).map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <input
                    value={h.label ?? ''}
                    onChange={(e) => patchHotspot(h.id, { label: e.target.value })}
                    placeholder="Label"
                    className="rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-900 outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={h.yaw}
                    onChange={(e) => patchHotspot(h.id, { yaw: parseFloat(e.target.value) || 0 })}
                    placeholder="Yaw°"
                    title="Horizontal position (degrees)"
                    className="rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-900 outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={h.pitch}
                    onChange={(e) => patchHotspot(h.id, { pitch: parseFloat(e.target.value) || 0 })}
                    placeholder="Pitch°"
                    title="Vertical position (degrees)"
                    className="rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-900 outline-none focus:border-primary"
                  />
                  <button onClick={() => removeHotspot(h.id)} className="font-heading text-[0.65rem] font-semibold text-red-400 hover:text-red-600">Remove</button>
                </div>
              ))}
              {selected.hotspots.length === 0 && <p className="font-body text-[0.65rem] text-gray-400">No hotspots yet — open the panorama viewer on the public page to find good yaw/pitch values, or use 0/0 as a starting point.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 rounded-2xl border border-dashed border-gray-200 p-12 text-center font-body text-sm text-gray-400">
          Select or create a room to edit it.
        </div>
      )}

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={handleMediaSelect}
        bucket="virtual-tour"
      />
    </div>
  )
}
