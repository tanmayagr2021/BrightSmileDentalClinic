'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MediaPicker, { type MediaPickerSelection } from '@/components/admin/MediaPicker'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import type { TrustWallModule, TrustWallCategory } from '@/types/db'
import type { TrustWallItemWithImage } from './page'

const MODULES: { key: TrustWallModule; label: string; categories: TrustWallCategory[] }[] = [
  { key: 'trust-certifications', label: 'Trust & Certifications', categories: ['award', 'certification', 'membership'] },
  { key: 'technology', label: 'Technology', categories: ['equipment', 'technology'] },
  { key: 'clinical-standards', label: 'Clinical Standards', categories: ['sterilization', 'research', 'verification'] },
]

const CATEGORY_LABEL: Record<TrustWallCategory, string> = {
  award: 'Award',
  certification: 'Certification',
  membership: 'Membership',
  equipment: 'Equipment',
  sterilization: 'Sterilization',
  technology: 'Technology',
  research: 'Research',
  verification: 'Verification',
}

export default function TrustWallClient({ initialItems }: { initialItems: TrustWallItemWithImage[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  useEffect(() => setItems(initialItems), [initialItems])
  const [activeModule, setActiveModule] = useState<TrustWallModule>('trust-certifications')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [picker, setPicker] = useState<string | null>(null) // item id
  const [newItem, setNewItem] = useState({ title: '', category: MODULES[0].categories[0] as TrustWallCategory })

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const moduleConfig = MODULES.find((m) => m.key === activeModule)!
  const moduleItems = items.filter((i) => i.module === activeModule).sort((a, b) => a.sort_order - b.sort_order)

  const patchItem = async (id: string, updates: Record<string, unknown>, quiet = false) => {
    const res = await fetch(`/api/admin/trust-wall/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) { if (!quiet) showToast(data.error ?? 'Failed to save', false); return null }
    setItems((its) => its.map((i) => (i.id === id ? { ...i, ...data } : i)))
    return data
  }

  const handleCreate = async () => {
    if (!newItem.title.trim()) return
    const res = await fetch('/api/admin/trust-wall/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: activeModule, category: newItem.category, title: newItem.title.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { showToast(data.error ?? 'Failed to create', false); return }
    setItems((its) => [...its, data])
    setNewItem({ title: '', category: moduleConfig.categories[0] })
    showToast('Item added', true)
    router.refresh()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    const res = await fetch(`/api/admin/trust-wall/items/${id}`, { method: 'DELETE' })
    if (!res.ok) { showToast('Failed to delete', false); return }
    setItems((its) => its.filter((i) => i.id !== id))
    showToast('Item deleted', true)
    router.refresh()
  }

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= moduleItems.length) return
    const a = moduleItems[idx]
    const b = moduleItems[target]
    setItems((its) => its.map((i) => {
      if (i.id === a.id) return { ...i, sort_order: b.sort_order }
      if (i.id === b.id) return { ...i, sort_order: a.sort_order }
      return i
    }))
    await Promise.all([
      patchItem(a.id, { sort_order: b.sort_order }, true),
      patchItem(b.id, { sort_order: a.sort_order }, true),
    ])
  }

  const handleImageSelect = async (selection: MediaPickerSelection) => {
    if (!picker) return
    await patchItem(picker, { image_id: selection.id })
    setPicker(null)
  }

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Module tabs */}
      <div className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm w-fit">
        {MODULES.map((m) => (
          <button
            key={m.key}
            onClick={() => { setActiveModule(m.key); setNewItem({ title: '', category: m.categories[0] }) }}
            className={`rounded-xl px-4 py-2 font-heading text-xs font-semibold transition-all ${
              activeModule === m.key ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Add new */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          value={newItem.title}
          onChange={(e) => setNewItem((f) => ({ ...f, title: e.target.value }))}
          placeholder={`New ${moduleConfig.label.toLowerCase()} item…`}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem((f) => ({ ...f, category: e.target.value as TrustWallCategory }))}
          className="rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
        >
          {moduleConfig.categories.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
        <button onClick={handleCreate} disabled={!newItem.title.trim()} className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white disabled:opacity-50">
          Add
        </button>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {moduleItems.map((item, idx) => {
          const url = item.image ? mediaDisplayUrl(item.image) : null
          return (
            <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <button onClick={() => setPicker(item.id)} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 hover:border-primary/40">
                  {url ? (
                    <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-body text-[0.55rem] text-gray-400">Add image</span>
                  )}
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.category}
                      onChange={(e) => patchItem(item.id, { category: e.target.value })}
                      className="rounded-lg border border-gray-200 px-2 py-1 font-heading text-[0.65rem] font-semibold text-gray-600 outline-none focus:border-primary"
                    >
                      {moduleConfig.categories.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                    </select>
                    <span className="font-body text-[0.6rem] text-gray-400">#{idx + 1}</span>
                  </div>
                  <input
                    defaultValue={item.title}
                    onBlur={(e) => e.target.value !== item.title && patchItem(item.id, { title: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-sm font-semibold text-gray-900 outline-none focus:border-primary"
                  />
                  <textarea
                    defaultValue={item.description ?? ''}
                    onBlur={(e) => e.target.value !== (item.description ?? '') && patchItem(item.id, { description: e.target.value || null })}
                    rows={2}
                    placeholder="Description"
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-700 outline-none focus:border-primary"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      defaultValue={item.issuer ?? ''}
                      onBlur={(e) => e.target.value !== (item.issuer ?? '') && patchItem(item.id, { issuer: e.target.value || null })}
                      placeholder="Issuer / Organization"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-700 outline-none focus:border-primary"
                    />
                    <input
                      defaultValue={item.year ?? ''}
                      onBlur={(e) => e.target.value !== (item.year ?? '') && patchItem(item.id, { year: e.target.value || null })}
                      placeholder="Year"
                      className="rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleMove(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-primary disabled:opacity-20 text-xs">▲</button>
                    <button onClick={() => handleMove(idx, 1)} disabled={idx === moduleItems.length - 1} className="text-gray-400 hover:text-primary disabled:opacity-20 text-xs">▼</button>
                  </div>
                  <button
                    onClick={() => patchItem(item.id, { is_visible: !item.is_visible })}
                    className={`relative flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${item.is_visible ? 'bg-primary' : 'bg-gray-200'}`}
                    role="switch"
                    aria-checked={item.is_visible}
                    title="Visible on public site"
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${item.is_visible ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                  <button onClick={() => handleDelete(item.id, item.title)} className="font-heading text-[0.6rem] font-semibold text-red-400 hover:text-red-600">Delete</button>
                </div>
              </div>
            </div>
          )
        })}
        {moduleItems.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-200 p-10 text-center font-body text-sm text-gray-400">No items in {moduleConfig.label} yet.</p>
        )}
      </div>

      <MediaPicker open={picker !== null} onClose={() => setPicker(null)} onSelect={handleImageSelect} bucket="trust-wall" />
    </div>
  )
}
