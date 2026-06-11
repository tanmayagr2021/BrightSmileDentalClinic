'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { FaqRow } from '@/types/db'

const CATEGORIES = ['general', 'cosmetic', 'paediatric', 'emergency', 'implants']

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
      <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function FaqsClient({ faqs }: { faqs: FaqRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<{ question: string; answer: string; category: string }>({ question: '', answer: '', category: 'general' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ question: '', answer: '', category: 'general' })

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order)

  const handlePatch = async (id: string, updates: Record<string, unknown>, quiet = false) => {
    if (!quiet) setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      if (!quiet) showToast('Saved successfully', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      if (!quiet) setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete this FAQ?\n\n"${question.slice(0, 60)}..."`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('FAQ deleted', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return
    const a = sorted[idx]
    const b = sorted[idx - 1]
    await Promise.all([
      handlePatch(a.id, { sort_order: b.sort_order }, true),
      handlePatch(b.id, { sort_order: a.sort_order }, true),
    ])
    showToast('Order updated', true)
  }

  const handleMoveDown = async (idx: number) => {
    if (idx === sorted.length - 1) return
    const a = sorted[idx]
    const b = sorted[idx + 1]
    await Promise.all([
      handlePatch(a.id, { sort_order: b.sort_order }, true),
      handlePatch(b.id, { sort_order: a.sort_order }, true),
    ])
    showToast('Order updated', true)
  }

  const startEdit = (faq: FaqRow) => {
    setEditingId(faq.id)
    setEditDraft({ question: faq.question, answer: faq.answer, category: faq.category ?? 'general' })
  }

  const saveEdit = async (id: string) => {
    await handlePatch(id, { question: editDraft.question, answer: editDraft.answer, category: editDraft.category })
    setEditingId(null)
  }

  const handleAdd = async () => {
    if (!addForm.question.trim() || !addForm.answer.trim()) {
      showToast('Question and answer are required', false)
      return
    }
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('FAQ added', true)
      setShowAddForm(false)
      setAddForm({ question: '', answer: '', category: 'general' })
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
          <h2 className="font-display text-xl text-gray-900 tracking-tight">FAQs</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage frequently asked questions displayed on the website.</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/8 px-4 py-2 font-heading text-xs font-semibold text-primary transition-all hover:bg-primary/15"
        >
          <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: sorted.length },
          { label: 'Visible', value: sorted.filter((f) => f.is_visible).length },
          { label: 'Hidden', value: sorted.filter((f) => !f.is_visible).length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="mb-5 rounded-2xl border border-primary/15 bg-tint p-5 space-y-3">
          <p className="font-heading text-sm font-semibold text-gray-800">New FAQ</p>
          <div>
            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Category</label>
            <select
              value={addForm.category}
              onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Question *</label>
            <input
              value={addForm.question}
              onChange={(e) => setAddForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="e.g. How often should I visit the dentist?"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Answer *</label>
            <textarea
              value={addForm.answer}
              onChange={(e) => setAddForm((f) => ({ ...f, answer: e.target.value }))}
              rows={3}
              placeholder="Detailed answer..."
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
            >
              Add FAQ
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 transition-all hover:border-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAQ list */}
      <div className="space-y-3">
        {sorted.map((faq, i) => {
          const isEditing = editingId === faq.id
          const isLoading = loadingId === faq.id

          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-colors ${faq.is_visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'} shadow-sm`}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-[0.58rem] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Question</label>
                          <input
                            value={editDraft.question}
                            onChange={(e) => setEditDraft((d) => ({ ...d, question: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Answer</label>
                          <textarea
                            value={editDraft.answer}
                            onChange={(e) => setEditDraft((d) => ({ ...d, answer: e.target.value }))}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-700 outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Category</label>
                          <select
                            value={editDraft.category}
                            onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}
                            className="rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-heading text-sm font-semibold text-gray-800">{faq.question}</p>
                        <p className="mt-1 font-body text-xs text-gray-500 leading-relaxed line-clamp-2">{faq.answer}</p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-heading text-[0.55rem] font-semibold text-gray-400 capitalize">
                      {faq.category ?? 'general'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
                  <button
                    onClick={() => handleMoveUp(i)}
                    disabled={i === 0 || isLoading}
                    className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20"
                    aria-label="Move up"
                  >
                    <ArrowUpIcon />
                  </button>
                  <button
                    onClick={() => handleMoveDown(i)}
                    disabled={i === sorted.length - 1 || isLoading}
                    className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20"
                    aria-label="Move down"
                  >
                    <ArrowDownIcon />
                  </button>

                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(faq.id)}
                      disabled={isLoading}
                      className="rounded-lg border border-primary/20 bg-primary/8 px-3 py-1 font-heading text-[0.65rem] font-semibold text-primary disabled:opacity-50"
                    >
                      Save
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
                    onClick={() => handlePatch(faq.id, { is_visible: !faq.is_visible })}
                    disabled={isLoading}
                    className={`rounded-lg border px-3 py-1 font-heading text-[0.65rem] font-semibold transition-all disabled:opacity-50 ${faq.is_visible ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}`}
                  >
                    {faq.is_visible ? 'Visible' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => handleDelete(faq.id, faq.question)}
                    disabled={isLoading}
                    className="ml-auto rounded-lg border border-red-100 px-3 py-1 font-heading text-[0.65rem] font-semibold text-red-400 transition-all hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 px-5 py-12 text-center">
          <p className="font-heading text-sm font-semibold text-gray-400">No FAQs yet</p>
          <p className="mt-1 font-body text-xs text-gray-300">Click &ldquo;Add FAQ&rdquo; to get started.</p>
        </div>
      )}
    </div>
  )
}
