'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ServiceCategoryRow, ServiceItemRow } from '@/types/db'

type ServiceWithCount = ServiceCategoryRow & { subServiceCount: number }

// ── Icons ──────────────────────────────────────────────────────────────────────

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
      <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4.5M8.5 6v4.5M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Treatments Manager ─────────────────────────────────────────────────────────

function TreatmentsManager({ categoryId }: { categoryId: string }) {
  const [items, setItems] = useState<ServiceItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newDraft, setNewDraft] = useState({ name: '', description: '' })
  const [apiError, setApiError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/services/${categoryId}/items`)
      const data = await res.json()
      if (Array.isArray(data)) setItems(data)
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => { load() }, [load])

  const startEdit = (item: ServiceItemRow) => {
    setEditingId(item.id)
    setEditDraft({ name: item.name, description: item.description ?? '' })
    setApiError(null)
  }

  const saveEdit = async (itemId: string) => {
    if (!editDraft.name.trim()) return
    setSaving(itemId)
    setApiError(null)
    try {
      const res = await fetch(`/api/admin/services/${categoryId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editDraft.name.trim(), description: editDraft.description.trim() || null }),
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error)
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, ...updated } : i))
      setEditingId(null)
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const toggleVisible = async (item: ServiceItemRow) => {
    const newVal = !item.is_visible
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_visible: newVal } : i))
    await fetch(`/api/admin/services/${categoryId}/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: newVal }),
    })
  }

  const deleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
    const res = await fetch(`/api/admin/services/${categoryId}/items/${itemId}`, { method: 'DELETE' })
    if (!res.ok) load() // reload if delete failed
  }

  const moveItem = async (idx: number, dir: 'up' | 'down') => {
    const next = dir === 'up' ? idx - 1 : idx + 1
    if (next < 0 || next >= items.length) return
    const updated = [...items]
    const tmpOrder = updated[idx].sort_order
    updated[idx] = { ...updated[idx], sort_order: updated[next].sort_order }
    updated[next] = { ...updated[next], sort_order: tmpOrder }
    updated.sort((a, b) => a.sort_order - b.sort_order)
    setItems(updated)
    await fetch(`/api/admin/services/${categoryId}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated.map((i) => ({ id: i.id, sort_order: i.sort_order, is_visible: i.is_visible }))),
    })
  }

  const addItem = async () => {
    if (!newDraft.name.trim()) return
    setSaving('new')
    setApiError(null)
    try {
      const res = await fetch(`/api/admin/services/${categoryId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDraft.name.trim(), description: newDraft.description.trim() || null }),
      })
      const created = await res.json()
      if (!res.ok) throw new Error(created.error)
      setItems((prev) => [...prev, created])
      setNewDraft({ name: '', description: '' })
      setAddingNew(false)
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Failed to add')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="py-4 text-center font-body text-xs text-gray-400">Loading treatments…</div>
    )
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-heading text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Treatments ({items.length})
        </span>
        {!addingNew && (
          <button
            type="button"
            onClick={() => { setAddingNew(true); setApiError(null) }}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            <PlusIcon /> Add Treatment
          </button>
        )}
      </div>

      {apiError && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 font-body text-xs text-red-600">{apiError}</p>
      )}

      {/* Items list */}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`rounded-xl border px-3 py-2.5 transition-colors ${item.is_visible ? 'border-gray-100 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}
          >
            {editingId === item.id ? (
              /* Edit mode */
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Treatment name"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 font-body text-xs text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/10"
                  autoFocus
                />
                <textarea
                  value={editDraft.description}
                  onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Short description (optional)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 font-body text-xs text-gray-800 outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary/10"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveEdit(item.id)}
                    disabled={saving === item.id}
                    className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold text-white disabled:opacity-60"
                  >
                    <CheckIcon /> {saving === item.id ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="flex items-start gap-2">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
                  <button
                    type="button"
                    onClick={() => moveItem(i, 'up')}
                    disabled={i === 0}
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-300 hover:text-gray-500 disabled:opacity-20"
                    aria-label="Move treatment up"
                  >
                    <ArrowUpIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(i, 'down')}
                    disabled={i === items.length - 1}
                    className="flex h-5 w-5 items-center justify-center rounded text-gray-300 hover:text-gray-500 disabled:opacity-20"
                    aria-label="Move treatment down"
                  >
                    <ArrowDownIcon />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-xs font-semibold text-gray-800 leading-snug">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 font-body text-[0.68rem] text-gray-400 leading-snug line-clamp-2">{item.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => toggleVisible(item)}
                    className={`rounded-md px-1.5 py-0.5 font-heading text-[0.55rem] font-semibold transition-colors ${item.is_visible ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    aria-label={item.is_visible ? 'Hide treatment' : 'Show treatment'}
                  >
                    {item.is_visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-primary"
                    aria-label="Edit treatment"
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-red-500"
                    aria-label="Delete treatment"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && !addingNew && (
          <p className="py-3 text-center font-body text-xs text-gray-400">No treatments yet. Add one above.</p>
        )}

        {/* Add new item form */}
        {addingNew && (
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] px-3 py-2.5 space-y-1.5">
            <input
              type="text"
              value={newDraft.name}
              onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Treatment name *"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 font-body text-xs text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/10"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
            />
            <textarea
              value={newDraft.description}
              onChange={(e) => setNewDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Short description (optional)"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 font-body text-xs text-gray-800 outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary/10"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addItem}
                disabled={saving === 'new' || !newDraft.name.trim()}
                className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold text-white disabled:opacity-60"
              >
                <PlusIcon /> {saving === 'new' ? 'Adding…' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setAddingNew(false); setNewDraft({ name: '', description: '' }); setApiError(null) }}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Edit/Add Modal ─────────────────────────────────────────────────────────────

type ModalMode = 'edit' | 'add'

type ServiceFormData = {
  name: string
  slug: string
  description: string
  long_description: string
  icon_name: string
}

function ServiceModal({
  mode,
  service,
  onClose,
  onSave,
}: {
  mode: ModalMode
  service?: ServiceWithCount
  onClose: () => void
  onSave: (data: ServiceFormData) => Promise<void>
}) {
  const [form, setForm] = useState<ServiceFormData>({
    name: service?.name ?? '',
    slug: service?.slug ?? '',
    description: service?.description ?? '',
    long_description: service?.long_description ?? '',
    icon_name: service?.icon_name ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      ...(mode === 'add' && {
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    if (mode === 'add' && !form.slug.trim()) { setError('Slug is required'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const isEdit = mode === 'edit'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Panel — wider in edit mode to accommodate treatments */}
      <div className={`relative z-10 flex flex-col w-full rounded-2xl border border-gray-100 bg-white shadow-2xl ${isEdit ? 'max-w-2xl max-h-[90vh]' : 'max-w-lg'}`}>
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-heading text-sm font-semibold text-gray-900">
            {isEdit ? `Edit — ${service?.name}` : 'Add New Service'}
          </h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600">
            <XIcon />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} id="service-modal-form">
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-500 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cosmetic Dentistry"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-body text-sm text-gray-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Slug (add mode only) */}
              {mode === 'add' && (
                <div>
                  <label className="block font-heading text-xs font-semibold text-gray-500 mb-1.5">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="e.g. cosmetic-dentistry"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-body text-sm text-gray-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <p className="mt-1 font-body text-[0.65rem] text-gray-400">URL-safe identifier. Auto-generated from name.</p>
                </div>
              )}

              {/* Short Description */}
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-500 mb-1.5">
                  Short Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="One or two sentences summarising this service."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-body text-sm text-gray-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-500 mb-1.5">
                  Full Description
                </label>
                <textarea
                  value={form.long_description}
                  onChange={(e) => setForm((f) => ({ ...f, long_description: e.target.value }))}
                  placeholder="Detailed description shown on the service detail page."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-body text-sm text-gray-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-500 mb-1.5">
                  Icon Name
                </label>
                <input
                  type="text"
                  value={form.icon_name}
                  onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))}
                  placeholder="e.g. tooth, implant, smile"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-body text-sm text-gray-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Treatments section — edit mode only */}
              {isEdit && service && (
                <div className="border-t border-gray-100 pt-4">
                  <TreatmentsManager categoryId={service.id} />
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 font-body text-xs text-red-600">{error}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer actions — sticky */}
        <div className="flex flex-shrink-0 justify-end gap-2.5 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 font-heading text-xs font-semibold text-gray-500 transition-colors hover:text-gray-700"
          >
            {isEdit ? 'Close' : 'Cancel'}
          </button>
          <button
            type="submit"
            form="service-modal-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Service'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────

function DeleteModal({
  service,
  onClose,
  onConfirm,
}: {
  service: ServiceWithCount
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <h3 className="font-heading text-sm font-semibold text-gray-900">Delete Service</h3>
        <p className="mt-2 font-body text-sm text-gray-500">
          Are you sure you want to delete <strong className="text-gray-800">{service.name}</strong>?
          This cannot be undone.
        </p>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 font-body text-xs text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 font-heading text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Client Component ──────────────────────────────────────────────────────

export default function ServiceCategoriesClient({ services }: { services: ServiceWithCount[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [optimistic, setOptimistic] = useState<ServiceWithCount[]>(
    [...services].sort((a, b) => a.sort_order - b.sort_order)
  )
  const [editTarget, setEditTarget] = useState<ServiceWithCount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServiceWithCount | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const refresh = () => startTransition(() => router.refresh())

  const persistBulk = async (updated: ServiceWithCount[]) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.map((s) => ({ id: s.id, is_visible: s.is_visible, sort_order: s.sort_order }))),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      showToast('Saved', true)
      refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error saving', false)
      setOptimistic([...services].sort((a, b) => a.sort_order - b.sort_order))
    }
  }

  const handleToggle = (idx: number) => {
    const updated = optimistic.map((s, i) => i === idx ? { ...s, is_visible: !s.is_visible } : s)
    setOptimistic(updated)
    persistBulk(updated)
  }

  const handleMove = (idx: number, dir: 'up' | 'down') => {
    const next = dir === 'up' ? idx - 1 : idx + 1
    if (next < 0 || next >= optimistic.length) return
    const updated = [...optimistic]
    const tempOrder = updated[idx].sort_order
    updated[idx] = { ...updated[idx], sort_order: updated[next].sort_order }
    updated[next] = { ...updated[next], sort_order: tempOrder }
    updated.sort((a, b) => a.sort_order - b.sort_order)
    setOptimistic(updated)
    persistBulk(updated)
  }

  const handleEditSave = async (data: ServiceFormData) => {
    if (!editTarget) return
    const res = await fetch(`/api/admin/services/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        long_description: data.long_description,
        icon_name: data.icon_name,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed to save')
    setOptimistic((prev) => prev.map((s) => s.id === editTarget.id ? { ...s, ...json } : s))
    showToast('Service updated', true)
    refresh()
  }

  const handleAddSave = async (data: ServiceFormData) => {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed to create')
    showToast('Service created', true)
    refresh()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/services/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed to delete')
    setOptimistic((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    showToast('Service deleted', true)
    refresh()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {editTarget && (
        <ServiceModal
          mode="edit"
          service={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          service={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {showAdd && (
        <ServiceModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSave={handleAddSave}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Services</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage visibility, order, and content. Changes save automatically.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <PlusIcon />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: optimistic.length },
          { label: 'Visible', value: optimistic.filter((s) => s.is_visible).length },
          { label: 'Sub-services', value: optimistic.reduce((n, s) => n + s.subServiceCount, 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Service list */}
      <div className="space-y-3">
        {optimistic.map((service, i) => (
          <div
            key={service.id}
            className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${service.is_visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-55'} shadow-sm`}
          >
            {/* Drag handle */}
            <div className="flex flex-col gap-0.5 flex-shrink-0 cursor-grab" aria-hidden="true">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex gap-0.5">
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                </div>
              ))}
            </div>

            {/* Order */}
            <span className="w-5 flex-shrink-0 text-center font-heading text-[0.65rem] font-bold text-gray-300">{i + 1}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-heading text-sm font-semibold text-gray-800">{service.name}</p>
                {service.subServiceCount > 0 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-heading text-[0.55rem] font-semibold text-gray-400">
                    {service.subServiceCount} treatments
                  </span>
                )}
                {service.long_description && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-heading text-[0.55rem] font-semibold text-primary">
                    has description
                  </span>
                )}
              </div>
              {service.description && (
                <p className="mt-0.5 font-body text-xs text-gray-400 truncate">{service.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <button
                onClick={() => handleMove(i, 'up')}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Move up"
              >
                <ArrowUpIcon />
              </button>
              <button
                onClick={() => handleMove(i, 'down')}
                disabled={i === optimistic.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Move down"
              >
                <ArrowDownIcon />
              </button>
              <button
                onClick={() => handleToggle(i)}
                className={`rounded-lg border px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold transition-all ${service.is_visible ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}`}
              >
                {service.is_visible ? 'Visible' : 'Hidden'}
              </button>
              <button
                onClick={() => setEditTarget(service)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary"
                aria-label="Edit service"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => setDeleteTarget(service)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:text-red-500"
                aria-label="Delete service"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {optimistic.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="font-heading text-sm font-semibold text-gray-400">No services yet</p>
          <p className="mt-1 font-body text-xs text-gray-300">Click &quot;Add Service&quot; to create your first one.</p>
        </div>
      )}
    </div>
  )
}
