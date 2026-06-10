'use client'

import { useState, useMemo } from 'react'
import { FAQS_STATIC, type FAQ } from '@/lib/constants'

type Tab = 'all' | string

export default function FaqsCmsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(
    FAQS_STATIC.map((f) => ({ ...f })).sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<{ q: string; a: string }>({ q: '', a: '' })
  const [saved, setSaved] = useState(false)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((f) => f.category)))
    return cats
  }, [faqs])

  const filtered = activeTab === 'all' ? faqs : faqs.filter((f) => f.category === activeTab)

  const toggle = (id: string) =>
    setFaqs((prev) => prev.map((f) => f.id === id ? { ...f, visible: !f.visible } : f))

  const remove = (id: string) => setFaqs((prev) => prev.filter((f) => f.id !== id))

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id)
    setEditDraft({ q: faq.q, a: faq.a })
  }

  const saveEdit = (id: string) => {
    setFaqs((prev) => prev.map((f) => f.id === id ? { ...f, q: editDraft.q, a: editDraft.a } : f))
    setEditingId(null)
  }

  const moveUp = (id: string) => {
    setFaqs((prev) => {
      const i = prev.findIndex((f) => f.id === id)
      if (i === 0) return prev
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next.map((f, idx) => ({ ...f, sortOrder: idx + 1 }))
    })
  }

  const moveDown = (id: string) => {
    setFaqs((prev) => {
      const i = prev.findIndex((f) => f.id === id)
      if (i === prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next.map((f, idx) => ({ ...f, sortOrder: idx + 1 }))
    })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">FAQs</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage frequently asked questions displayed on the website.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add FAQ
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
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: faqs.length },
          { label: 'Visible', value: faqs.filter((f) => f.visible).length },
          { label: 'Categories', value: categories.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(['all', ...categories] as Tab[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold capitalize transition-all ${activeTab === cat ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-500 hover:border-primary/30 hover:text-primary'}`}
          >
            {cat === 'all' ? `All (${faqs.length})` : `${cat} (${faqs.filter((f) => f.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-3">
        {filtered.map((faq, i) => (
          <div
            key={faq.id}
            className={`rounded-xl border transition-colors ${faq.visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-55'} shadow-sm`}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 font-heading text-[0.58rem] font-bold text-primary mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {editingId === faq.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Question</label>
                        <input
                          value={editDraft.q}
                          onChange={(e) => setEditDraft((d) => ({ ...d, q: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Answer</label>
                        <textarea
                          value={editDraft.a}
                          onChange={(e) => setEditDraft((d) => ({ ...d, a: e.target.value }))}
                          rows={3}
                          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-700 outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-heading text-sm font-semibold text-gray-800">{faq.q}</p>
                      <p className="mt-1 font-body text-xs text-gray-500 leading-relaxed line-clamp-2">{faq.a}</p>
                    </>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-heading text-[0.55rem] font-semibold text-gray-400 capitalize">{faq.category}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
                <button
                  onClick={() => moveUp(faq.id)}
                  disabled={i === 0}
                  className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20"
                  aria-label="Move up"
                >
                  <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
                    <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => moveDown(faq.id)}
                  disabled={i === filtered.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20"
                  aria-label="Move down"
                >
                  <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>

                {editingId === faq.id ? (
                  <button
                    onClick={() => saveEdit(faq.id)}
                    className="rounded-lg border border-primary/20 bg-primary/8 px-3 py-1 font-heading text-[0.65rem] font-semibold text-primary"
                  >
                    Done
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(faq)}
                    className="rounded-lg border border-gray-200 px-3 py-1 font-heading text-[0.65rem] font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => toggle(faq.id)}
                  className={`rounded-lg border px-3 py-1 font-heading text-[0.65rem] font-semibold transition-all ${faq.visible ? 'border-green-200 bg-green-50 text-green-600' : 'border-gray-200 bg-gray-50 text-gray-400'}`}
                >
                  {faq.visible ? 'Visible' : 'Hidden'}
                </button>

                <button
                  onClick={() => remove(faq.id)}
                  className="ml-auto rounded-lg border border-red-100 px-3 py-1 font-heading text-[0.65rem] font-semibold text-red-400 transition-all hover:border-red-200 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 px-5 py-4 text-center">
        <button className="font-heading text-xs font-semibold text-gray-400 hover:text-primary transition-colors">
          + Add New FAQ
        </button>
      </div>
    </div>
  )
}
