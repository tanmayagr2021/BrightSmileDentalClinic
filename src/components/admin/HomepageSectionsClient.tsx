'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { HomepageSectionRow } from '@/types/db'

type SectionWithMeta = HomepageSectionRow & {
  label: string
  desc: string
  editHref?: string
  locked?: boolean
}

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

export default function HomepageSectionsClient({ sections }: { sections: SectionWithMeta[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [optimistic, setOptimistic] = useState<SectionWithMeta[]>(
    [...sections].sort((a, b) => a.sort_order - b.sort_order)
  )

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const persist = async (updated: SectionWithMeta[]) => {
    try {
      const res = await fetch('/api/admin/homepage-sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.map((s) => ({ id: s.id, is_visible: s.is_visible, sort_order: s.sort_order }))),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      showToast('Layout saved', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error saving', false)
      // revert optimistic state
      setOptimistic([...sections].sort((a, b) => a.sort_order - b.sort_order))
    }
  }

  const handleToggle = (idx: number) => {
    if (optimistic[idx].locked) return
    const updated = optimistic.map((s, i) => i === idx ? { ...s, is_visible: !s.is_visible } : s)
    setOptimistic(updated)
    persist(updated)
  }

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return
    const updated = [...optimistic]
    const tempOrder = updated[idx].sort_order
    updated[idx] = { ...updated[idx], sort_order: updated[idx - 1].sort_order }
    updated[idx - 1] = { ...updated[idx - 1], sort_order: tempOrder }
    updated.sort((a, b) => a.sort_order - b.sort_order)
    setOptimistic(updated)
    persist(updated)
  }

  const handleMoveDown = (idx: number) => {
    if (idx === optimistic.length - 1) return
    const updated = [...optimistic]
    const tempOrder = updated[idx].sort_order
    updated[idx] = { ...updated[idx], sort_order: updated[idx + 1].sort_order }
    updated[idx + 1] = { ...updated[idx + 1], sort_order: tempOrder }
    updated.sort((a, b) => a.sort_order - b.sort_order)
    setOptimistic(updated)
    persist(updated)
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
      <div className="mb-6">
        <h2 className="font-display text-xl text-gray-900 tracking-tight">Homepage Sections</h2>
        <p className="mt-1 font-body text-sm text-gray-500">
          Control which sections appear on the homepage and in what order. Changes save automatically.
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
        <p className="font-body text-xs text-gray-500">
          <strong className="text-gray-700">Clinic Showcase</strong> and <strong className="text-gray-700">Appointment CTA</strong> sections are always shown and cannot be hidden.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: optimistic.length },
          { label: 'Visible', value: optimistic.filter((s) => s.is_visible).length },
          { label: 'Hidden', value: optimistic.filter((s) => !s.is_visible).length },
          { label: 'Required', value: optimistic.filter((s) => s.locked).length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <p className="font-display text-xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section list */}
      <div className="space-y-2">
        {optimistic.map((section, i) => (
          <div
            key={section.id}
            className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${section.is_visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'} shadow-sm`}
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

            {/* Order badge */}
            <span className="w-6 flex-shrink-0 text-center font-heading text-[0.65rem] font-bold text-gray-300">
              {i + 1}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-heading text-sm font-semibold text-gray-800">{section.label}</p>
                {section.locked && (
                  <span className="rounded-full border border-gray-200 px-1.5 py-0.5 font-heading text-[0.55rem] font-semibold text-gray-600">
                    Required
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-body text-xs text-gray-600 truncate">{section.desc}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
              {section.editHref && (
                <Link
                  href={section.editHref}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary"
                >
                  Edit
                </Link>
              )}

              <button
                onClick={() => handleMoveUp(i)}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Move section up"
              >
                <ArrowUpIcon />
              </button>
              <button
                onClick={() => handleMoveDown(i)}
                disabled={i === optimistic.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Move section down"
              >
                <ArrowDownIcon />
              </button>

              {!section.locked ? (
                <button
                  onClick={() => handleToggle(i)}
                  className={`flex h-7 min-w-[60px] items-center justify-center rounded-lg px-2 font-heading text-[0.6rem] font-semibold transition-all ${
                    section.is_visible
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {section.is_visible ? 'Visible' : 'Hidden'}
                </button>
              ) : (
                <div className="flex h-7 min-w-[60px] items-center justify-center rounded-lg bg-gray-50">
                  <span className="font-heading text-[0.58rem] text-gray-300">Always on</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
