'use client'

import { useState } from 'react'
import { GALLERY_ITEMS_STATIC, GALLERY_CATEGORIES_STATIC, type GalleryItem } from '@/lib/constants'

type Cat = typeof GALLERY_CATEGORIES_STATIC[number]['id']

export default function GalleryCmsPage() {
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS_STATIC.map((g) => ({ ...g })))
  const [activeCategory, setActiveCategory] = useState<Cat>('all')
  const [saved, setSaved] = useState(false)

  const toggle = (id: string) =>
    setItems((prev) => prev.map((g) => g.id === id ? { ...g, visible: !g.visible } : g))

  const remove = (id: string) => setItems((prev) => prev.filter((g) => g.id !== id))

  const filtered = activeCategory === 'all' ? items : items.filter((g) => g.category === activeCategory)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Gallery</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage clinic photos shown on the public gallery page.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Upload Photos
          </button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Save
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="font-heading text-xs font-semibold text-green-700">Saved locally · Will persist after Supabase integration</p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: items.length },
          { label: 'Visible', value: items.filter((g) => g.visible).length },
          { label: 'Hidden', value: items.filter((g) => !g.visible).length },
          { label: 'Categories', value: GALLERY_CATEGORIES_STATIC.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {GALLERY_CATEGORIES_STATIC.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold capitalize transition-all ${activeCategory === cat.id ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-500 hover:border-primary/30 hover:text-primary'}`}
          >
            {cat.label} ({cat.id === 'all' ? items.length : items.filter((g) => g.category === cat.id).length})
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div className="mb-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center hover:border-primary/30 cursor-pointer transition-colors group">
        <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-10 w-10 text-gray-300 group-hover:text-primary/30 transition-colors" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 15l5-4 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-3 font-heading text-sm font-semibold text-gray-400 group-hover:text-primary/60 transition-colors">Drag & drop photos here</p>
        <p className="font-body text-xs text-gray-300 mt-1">or click to browse · JPG, PNG up to 10 MB each</p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 font-heading text-xs font-semibold text-gray-500 group-hover:border-primary/20 group-hover:text-primary transition-all">
          Browse Files
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-xl border overflow-hidden transition-all ${item.visible ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}
            >
              {/* Photo placeholder */}
              <div
                className="h-32 w-full"
                style={{
                  background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                }}
              />

              {/* Info + actions */}
              <div className="bg-white p-3">
                <p className="font-heading text-[0.65rem] font-semibold text-gray-700 truncate">{item.title}</p>
                <p className="font-body text-[0.58rem] text-gray-400 capitalize mt-0.5">{item.category}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => toggle(item.id)}
                    className={`flex-1 rounded-lg border py-1 font-heading text-[0.58rem] font-semibold text-center transition-all ${item.visible ? 'border-green-200 bg-green-50 text-green-600' : 'border-gray-200 bg-gray-50 text-gray-400'}`}
                  >
                    {item.visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg border border-red-100 text-red-400 transition-all hover:border-red-200 hover:bg-red-50"
                    aria-label="Remove photo"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                      <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <p className="font-heading text-sm text-gray-400">No photos in this category.</p>
        </div>
      )}
    </div>
  )
}
