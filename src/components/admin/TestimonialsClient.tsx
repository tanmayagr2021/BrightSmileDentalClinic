'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { TestimonialRow } from '@/types/db'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
      <path
        d="M6 1l1.35 2.73 3.01.44-2.18 2.12.51 3.01L6 7.9 3.31 9.3l.51-3.01L1.64 4.17l3.01-.44L6 1z"
        fill={filled ? '#4A9B6F' : 'none'}
        stroke={filled ? '#4A9B6F' : '#d1d5db'}
        strokeWidth="0.8"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.5a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending'  },
  approved: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Approved' },
  rejected: { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Rejected' },
}

export default function TestimonialsClient({ testimonials }: { testimonials: TestimonialRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<{ patient_name: string; review_text: string }>({ patient_name: '', review_text: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ patient_name: '', rating: 5, review_text: '', treatment_type: '' })

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePatch = async (id: string, updates: Record<string, unknown>) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Saved successfully', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from ${name}? This cannot be undone.`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Testimonial deleted', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const handleAdd = async () => {
    if (!addForm.patient_name.trim() || !addForm.review_text.trim()) {
      showToast('Name and review text are required', false)
      return
    }
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: addForm.patient_name,
          rating: addForm.rating,
          review_text: addForm.review_text,
          treatment_type: addForm.treatment_type || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Testimonial added', true)
      setShowAddForm(false)
      setAddForm({ patient_name: '', rating: 5, review_text: '', treatment_type: '' })
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    }
  }

  const startEdit = (t: TestimonialRow) => {
    setEditingId(t.id)
    setEditDraft({ patient_name: t.patient_name, review_text: t.review_text })
  }

  const saveEdit = (id: string) => {
    handlePatch(id, { patient_name: editDraft.patient_name, review_text: editDraft.review_text })
    setEditingId(null)
  }

  const sorted = [...testimonials].sort((a, b) => a.sort_order - b.sort_order)

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
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Testimonials</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage patient reviews shown on the public website.</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/8 px-4 py-2 font-heading text-xs font-semibold text-primary transition-all hover:bg-primary/15"
        >
          <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: sorted.length },
          { label: 'Approved', value: sorted.filter((t) => t.status === 'approved').length },
          { label: 'Pending', value: sorted.filter((t) => t.status === 'pending').length },
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
          <p className="font-heading text-sm font-semibold text-gray-800">New Testimonial</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Patient Name *</label>
              <input
                value={addForm.patient_name}
                onChange={(e) => setAddForm((f) => ({ ...f, patient_name: e.target.value }))}
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Treatment Type</label>
              <input
                value={addForm.treatment_type}
                onChange={(e) => setAddForm((f) => ({ ...f, treatment_type: e.target.value }))}
                placeholder="e.g. Dental Implant"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
              />
            </div>
          </div>
          <div>
            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setAddForm((f) => ({ ...f, rating: n }))}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border font-heading text-sm font-semibold transition-all ${addForm.rating >= n ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Review Text *</label>
            <textarea
              value={addForm.review_text}
              onChange={(e) => setAddForm((f) => ({ ...f, review_text: e.target.value }))}
              rows={3}
              placeholder="Patient's review..."
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
            >
              Add Testimonial
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

      {/* List */}
      <div className="space-y-4">
        {sorted.map((t) => {
          const statusStyle = STATUS_STYLES[t.status] ?? STATUS_STYLES.pending
          const isEditing = editingId === t.id
          const isLoading = loadingId === t.id

          return (
            <div
              key={t.id}
              className={`rounded-2xl border transition-colors ${t.status === 'rejected' ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-100 bg-white'} shadow-sm`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-white">
                      {t.patient_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          value={editDraft.patient_name}
                          onChange={(e) => setEditDraft((d) => ({ ...d, patient_name: e.target.value }))}
                          className="rounded-lg border border-gray-200 px-2 py-1 font-heading text-sm font-semibold text-gray-800 outline-none focus:border-primary"
                        />
                      ) : (
                        <p className="font-heading text-sm font-semibold text-gray-800">{t.patient_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {t.treatment_type && (
                      <span className="rounded-full bg-tint px-2.5 py-1 font-heading text-[0.58rem] font-semibold text-primary">
                        {t.treatment_type}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-1 font-heading text-[0.58rem] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} filled={i < t.rating} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {isEditing ? (
                    <textarea
                      value={editDraft.review_text}
                      onChange={(e) => setEditDraft((d) => ({ ...d, review_text: e.target.value }))}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                    />
                  ) : (
                    <p className="font-body text-sm text-gray-600 leading-relaxed line-clamp-2">&ldquo;{t.review_text}&rdquo;</p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-4">
                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(t.id)}
                      disabled={isLoading}
                      className="rounded-lg border border-primary/20 bg-primary/8 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-primary disabled:opacity-50"
                    >
                      Save Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(t)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary"
                    >
                      Edit
                    </button>
                  )}

                  {t.status === 'approved' ? (
                    <button
                      onClick={() => handlePatch(t.id, { status: 'rejected' })}
                      disabled={isLoading}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePatch(t.id, { status: 'approved' })}
                      disabled={isLoading}
                      className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-green-600 transition-all hover:bg-green-100 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(t.id, t.patient_name)}
                    disabled={isLoading}
                    className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-red-400 transition-all hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 px-5 py-12 text-center">
          <p className="font-heading text-sm font-semibold text-gray-400">No testimonials yet</p>
          <p className="mt-1 font-body text-xs text-gray-300">Click &ldquo;Add Testimonial&rdquo; to add the first review.</p>
        </div>
      )}
    </div>
  )
}
