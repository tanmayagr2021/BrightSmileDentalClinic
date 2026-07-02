'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentBlockRow } from '@/types/db'

export default function ContentBlocksClient({ blocks }: { blocks: ContentBlockRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return blocks
    return blocks.filter(
      (b) =>
        b.key.toLowerCase().includes(q) ||
        b.value.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q)
    )
  }, [blocks, search])

  const groups = useMemo(() => {
    const map = new Map<string, ContentBlockRow[]>()
    for (const block of filtered) {
      const groupKey = `${block.page ?? 'other'} / ${block.section ?? 'general'}`
      if (!map.has(groupKey)) map.set(groupKey, [])
      map.get(groupKey)!.push(block)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const save = async (block: ContentBlockRow) => {
    const value = drafts[block.id] ?? block.value
    if (value === block.value) return
    setSavingId(block.id)
    try {
      const res = await fetch(`/api/admin/content-blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      showToast('Saved', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setSavingId(null)
    }
  }

  const isMultiline = (value: string) => value.length > 60

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-display text-xl text-gray-900 tracking-tight">Content Management</h2>
        <p className="mt-1 font-body text-sm text-gray-500">
          Edit headings, CTA labels, intros, and banner copy used across the public website. Changes appear on the next page load.
        </p>
      </div>

      <div className="mb-5">
        <div className="relative max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by key, text, or description…"
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 font-body text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-8">
        {groups.map(([groupKey, groupBlocks]) => (
          <div key={groupKey}>
            <h3 className="mb-3 font-heading text-xs font-semibold uppercase tracking-widest text-gray-500 capitalize">
              {groupKey}
            </h3>
            <div className="space-y-3">
              {groupBlocks.map((block) => {
                const value = drafts[block.id] ?? block.value
                const dirty = value !== block.value
                const saving = savingId === block.id
                return (
                  <div key={block.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[0.68rem] text-gray-400">{block.key}</p>
                        {block.description && (
                          <p className="mt-0.5 font-body text-xs text-gray-500">{block.description}</p>
                        )}
                      </div>
                      {dirty && (
                        <button
                          onClick={() => save(block)}
                          disabled={saving}
                          className="flex-shrink-0 rounded-lg bg-primary px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                      )}
                    </div>
                    {isMultiline(block.value) ? (
                      <textarea
                        value={value}
                        onChange={(e) => setDrafts((d) => ({ ...d, [block.id]: e.target.value }))}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/15"
                      />
                    ) : (
                      <input
                        value={value}
                        onChange={(e) => setDrafts((d) => ({ ...d, [block.id]: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/15"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-5 py-12 text-center">
            <p className="font-heading text-sm font-semibold text-gray-600">No matching content blocks</p>
          </div>
        )}
      </div>
    </div>
  )
}
