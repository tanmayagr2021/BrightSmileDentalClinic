'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MediaPicker, { type MediaPickerSelection } from '@/components/admin/MediaPicker'

type Slide = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  category: string
  image_url: string | null
  gradient_from: string
  gradient_to: string
  accent_color: string
  sort_order: number
  is_visible: boolean
}

export default function ShowcaseClient({ slides: initialSlides }: { slides: Slide[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [slides, setSlides] = useState(initialSlides)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Slide>>({})
  const [pickerForSlide, setPickerForSlide] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const toggle = (slide: Slide) => setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, is_visible: !s.is_visible } : s))

  const moveUp = (i: number) => {
    if (i === 0) return
    setSlides((prev) => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next.map((s, idx) => ({ ...s, sort_order: idx + 1 }))
    })
  }

  const moveDown = (i: number) => {
    setSlides((prev) => {
      if (i === prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next.map((s, idx) => ({ ...s, sort_order: idx + 1 }))
    })
  }

  const handleSaveAll = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/showcase', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slides.map((s) => ({ id: s.id, is_visible: s.is_visible, sort_order: s.sort_order }))),
    })
    setSaving(false)
    if (!res.ok) { showToast('Failed to save', false); return }
    showToast('Order & visibility saved', true)
    startTransition(() => router.refresh())
  }

  const startEdit = (slide: Slide) => {
    setEditingId(slide.id)
    setEditForm({ title: slide.title, subtitle: slide.subtitle ?? '', description: slide.description ?? '' })
  }

  const saveEdit = async (slide: Slide) => {
    const res = await fetch(`/api/admin/showcase/${slide.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editForm.title?.trim() || slide.title,
        subtitle: editForm.subtitle?.trim() || null,
        description: editForm.description?.trim() || null,
      }),
    })
    if (!res.ok) { showToast('Failed to save', false); return }
    const updated = await res.json()
    setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, ...updated } : s))
    setEditingId(null)
    showToast('Slide updated', true)
  }

  const handleImageSelect = async (slideId: string, selection: MediaPickerSelection) => {
    const patchRes = await fetch(`/api/admin/showcase/${slideId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: selection.url }),
    })
    if (!patchRes.ok) { showToast('Failed to save image', false); return }
    const updated = await patchRes.json()
    setSlides((prev) => prev.map((s) => s.id === slideId ? { ...s, ...updated } : s))
    showToast('Photo updated', true)
  }

  const deleteSlide = async (slide: Slide) => {
    if (!confirm(`Delete slide "${slide.title}"?`)) return
    const res = await fetch(`/api/admin/showcase/${slide.id}`, { method: 'DELETE' })
    if (!res.ok) { showToast('Failed to delete', false); return }
    setSlides((prev) => prev.filter((s) => s.id !== slide.id))
    showToast('Slide deleted', true)
    startTransition(() => router.refresh())
  }

  const addSlide = async () => {
    if (!newTitle.trim()) return
    const res = await fetch('/api/admin/showcase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() || null }),
    })
    if (!res.ok) { showToast('Failed to add slide', false); return }
    const created = await res.json()
    setSlides((prev) => [...prev, created])
    setNewTitle(''); setNewDesc(''); setShowAddForm(false)
    showToast('Slide added', true)
    startTransition(() => router.refresh())
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Clinic Showcase</h2>
          <p className="mt-1 font-body text-sm text-gray-500">The full-screen hero section. Upload real clinic photos to replace gradient previews.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShowAddForm((v) => !v)} className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            Add Slide
          </button>
          <button onClick={handleSaveAll} disabled={saving} className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Order & Visibility'}
          </button>
        </div>
      </div>

      {/* Add slide form */}
      {showAddForm && (
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <p className="font-heading text-xs font-semibold text-gray-700">New Slide</p>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Slide title" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm outline-none focus:border-primary" />
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm outline-none focus:border-primary" />
          <div className="flex gap-2">
            <button onClick={addSlide} className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white hover:bg-primary-dark">Add</button>
            <button onClick={() => setShowAddForm(false)} className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Slides */}
      <div className="space-y-4">
        {slides.map((slide, i) => (
          <div key={slide.id} className={`rounded-2xl border transition-colors ${slide.is_visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'} shadow-sm`}>
            <div className="flex items-start gap-4 p-5">

              {/* Preview */}
              <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                {slide.image_url ? (
                  <Image src={slide.image_url} alt={slide.title} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${slide.gradient_from}, ${slide.gradient_to})` }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingId === slide.id ? (
                  <div className="space-y-2">
                    <input
                      value={editForm.title ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-sm font-semibold text-gray-900 outline-none focus:border-primary"
                    />
                    <input
                      value={editForm.subtitle ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                      placeholder="Subtitle"
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-600 outline-none focus:border-primary"
                    />
                    <textarea
                      value={editForm.description ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-600 outline-none focus:border-primary"
                    />
                    <div className="flex gap-1.5">
                      <button onClick={() => saveEdit(slide)} className="rounded-lg bg-primary px-3 py-1 font-heading text-xs font-semibold text-white">Save</button>
                      <button onClick={() => setEditingId(null)} className="rounded-lg border border-gray-200 px-3 py-1 font-heading text-xs font-semibold text-gray-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-heading text-sm font-semibold text-gray-900 truncate">{slide.title}</p>
                    {slide.subtitle && <p className="font-body text-xs text-primary mt-0.5">{slide.subtitle}</p>}
                    {slide.description && <p className="mt-0.5 font-body text-xs text-gray-500 line-clamp-2">{slide.description}</p>}
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="font-body text-[0.6rem] text-gray-600">Order {slide.sort_order}</span>
                      <span className="rounded-full px-2 py-0.5 font-heading text-[0.58rem] font-semibold" style={{ backgroundColor: slide.accent_color + '20', color: slide.accent_color }}>
                        {slide.category}
                      </span>
                      {slide.image_url && <span className="rounded-full bg-green-50 px-2 py-0.5 font-heading text-[0.58rem] font-semibold text-green-600">Has Photo</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 flex-col items-end gap-2">
                <button
                  onClick={() => toggle(slide)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-[0.6rem] font-semibold transition-all ${slide.is_visible ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${slide.is_visible ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {slide.is_visible ? 'Visible' : 'Hidden'}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-30">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === slides.length - 1} className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-30">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => startEdit(slide)} className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${editingId === slide.id ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary'}`}>
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => deleteSlide(slide)} className="flex h-6 w-6 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Image picker row */}
            <div
              className="mx-5 mb-5 flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 hover:border-primary/30 transition-colors cursor-pointer group"
              onClick={() => setPickerForSlide(slide.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-gray-300 group-hover:text-primary/40 transition-colors flex-shrink-0"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              <div>
                <p className="font-heading text-xs font-semibold text-gray-600 group-hover:text-primary/60 transition-colors">
                  {slide.image_url ? 'Replace Photo' : 'Choose Photo'}
                </p>
                <p className="font-body text-[0.6rem] text-gray-300">From the Media Library · Replaces gradient preview</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MediaPicker
        open={pickerForSlide !== null}
        onClose={() => setPickerForSlide(null)}
        onSelect={(selection) => pickerForSlide && handleImageSelect(pickerForSlide, selection)}
        bucket="gallery"
        usageContext={pickerForSlide ? { table: 'showcase_slides', column: 'image_url', recordId: pickerForSlide } : undefined}
      />
    </div>
  )
}
