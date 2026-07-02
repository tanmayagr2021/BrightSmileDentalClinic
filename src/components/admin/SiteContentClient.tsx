'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SITE_CONTENT_RESOURCES, SITE_CONTENT_RESOURCE_SLUGS, type SiteContentResourceSlug } from '@/lib/admin/site-content-config'
import type { SiteContentRow } from '@/types/db'

const RESOURCE_SLUGS = SITE_CONTENT_RESOURCE_SLUGS

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

export default function SiteContentClient({ initialData }: { initialData: Record<SiteContentResourceSlug, SiteContentRow[]> }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeResource, setActiveResource] = useState<SiteContentResourceSlug>(RESOURCE_SLUGS[0])
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Record<string, string>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<Record<string, string>>({})

  const config = SITE_CONTENT_RESOURCES[activeResource]
  const rows = [...(initialData[activeResource] ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const switchResource = (slug: SiteContentResourceSlug) => {
    setActiveResource(slug)
    setEditingId(null)
    setShowAddForm(false)
    setAddForm({})
  }

  const patch = async (id: string, updates: Record<string, unknown>, quiet = false) => {
    if (!quiet) setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/site-content/${activeResource}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      if (!quiet) showToast('Saved', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      if (!quiet) setLoadingId(null)
    }
  }

  const handleDelete = async (row: SiteContentRow) => {
    const title = String(row[config.titleField] ?? '')
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setLoadingId(row.id)
    try {
      const res = await fetch(`/api/admin/site-content/${activeResource}/${row.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast(`${config.singularLabel} deleted`, true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const other = idx + dir
    if (other < 0 || other >= rows.length) return
    const a = rows[idx]
    const b = rows[other]
    await Promise.all([
      patch(a.id, { sort_order: b.sort_order }, true),
      patch(b.id, { sort_order: a.sort_order }, true),
    ])
    showToast('Order updated', true)
  }

  const startEdit = (row: SiteContentRow) => {
    setEditingId(row.id)
    const draft: Record<string, string> = {}
    for (const field of config.fields) draft[field.key] = String(row[field.key] ?? '')
    setEditDraft(draft)
  }

  const saveEdit = async (id: string) => {
    await patch(id, editDraft)
    setEditingId(null)
  }

  const handleAdd = async () => {
    for (const field of config.fields) {
      if (field.required && !addForm[field.key]?.trim()) {
        showToast(`${field.label} is required`, false)
        return
      }
    }
    try {
      const res = await fetch(`/api/admin/site-content/${activeResource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast(`${config.singularLabel} added`, true)
      setShowAddForm(false)
      setAddForm({})
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    }
  }

  function renderField(
    field: (typeof config.fields)[number],
    value: string,
    onChange: (v: string) => void
  ) {
    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary"
        >
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary"
        />
      )
    }
    return (
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary"
      />
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-display text-xl text-gray-900 tracking-tight">Site Content</h2>
        <p className="mt-1 font-body text-sm text-gray-500">
          Manage repeating homepage sections — trust indicators, patient journey, before/after cases, and more.
        </p>
      </div>

      {/* Resource tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
        {RESOURCE_SLUGS.map((slug) => (
          <button
            key={slug}
            onClick={() => switchResource(slug)}
            className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold transition-all ${
              activeResource === slug ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:border-primary/30'
            }`}
          >
            {SITE_CONTENT_RESOURCES[slug].label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <p className="font-body text-sm text-gray-500">{rows.length} {rows.length === 1 ? 'item' : 'items'}</p>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 font-heading text-xs font-semibold text-primary transition-all hover:bg-primary/15"
        >
          <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add {config.singularLabel}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-5 rounded-2xl border border-primary/15 bg-tint p-5 space-y-3">
          <p className="font-heading text-sm font-semibold text-gray-800">New {config.singularLabel}</p>
          {config.fields.map((field) => (
            <div key={field.key}>
              <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">
                {field.label}{field.required && ' *'}
              </label>
              {renderField(field, addForm[field.key] ?? '', (v) => setAddForm((f) => ({ ...f, [field.key]: v })))}
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark">
              Add {config.singularLabel}
            </button>
            <button onClick={() => setShowAddForm(false)} className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 transition-all hover:border-gray-300">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row, i) => {
          const isEditing = editingId === row.id
          const isLoading = loadingId === row.id
          return (
            <div key={row.id} className={`rounded-xl border transition-colors ${row.is_visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'} shadow-sm`}>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-[0.58rem] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        {config.fields.map((field) => (
                          <div key={field.key}>
                            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">{field.label}</label>
                            {renderField(field, editDraft[field.key] ?? '', (v) => setEditDraft((d) => ({ ...d, [field.key]: v })))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="font-heading text-sm font-semibold text-gray-800">{String(row[config.titleField] ?? '')}</p>
                        {config.fields
                          .filter((f) => f.key !== config.titleField && f.type !== 'select')
                          .map((f) => (
                            <p key={f.key} className="mt-0.5 font-body text-xs text-gray-500 leading-relaxed line-clamp-2">
                              {String(row[f.key] ?? '')}
                            </p>
                          ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
                  <button onClick={() => handleMove(i, -1)} disabled={i === 0 || isLoading} className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-600 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20" aria-label="Move up">
                    <ArrowUpIcon />
                  </button>
                  <button onClick={() => handleMove(i, 1)} disabled={i === rows.length - 1 || isLoading} className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-600 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20" aria-label="Move down">
                    <ArrowDownIcon />
                  </button>

                  {isEditing ? (
                    <button onClick={() => saveEdit(row.id)} disabled={isLoading} className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 font-heading text-[0.65rem] font-semibold text-primary disabled:opacity-50">
                      Save
                    </button>
                  ) : (
                    <button onClick={() => startEdit(row)} className="rounded-lg border border-gray-200 px-3 py-1 font-heading text-[0.65rem] font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary">
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => patch(row.id, { is_visible: !row.is_visible })}
                    disabled={isLoading}
                    className={`rounded-lg border px-3 py-1 font-heading text-[0.65rem] font-semibold transition-all disabled:opacity-50 ${row.is_visible ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                  >
                    {row.is_visible ? 'Visible' : 'Hidden'}
                  </button>

                  <button onClick={() => handleDelete(row)} disabled={isLoading} className="ml-auto rounded-lg border border-red-100 px-3 py-1 font-heading text-[0.65rem] font-semibold text-red-400 transition-all hover:border-red-200 hover:bg-red-50 disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {rows.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-5 py-12 text-center">
            <p className="font-heading text-sm font-semibold text-gray-600">No {config.label.toLowerCase()} yet</p>
            <p className="mt-1 font-body text-xs text-gray-300">Click &ldquo;Add {config.singularLabel}&rdquo; to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
