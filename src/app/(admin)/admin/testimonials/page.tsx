'use client'

import { useState } from 'react'
import { TESTIMONIALS_STATIC, type Testimonial } from '@/lib/constants'

function StarIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
      <path d="M6 1l1.35 2.73 3.01.44-2.18 2.12.51 3.01L6 7.9 3.31 9.3l.51-3.01L1.64 4.17l3.01-.44L6 1z" fill="#4A9B6F" />
    </svg>
  )
}

function TestimonialCard({
  testimonial,
  visible,
  onToggle,
  onDelete,
}: {
  testimonial: Testimonial
  visible: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(testimonial.text)

  return (
    <div className={`rounded-2xl border transition-colors ${visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-55'} shadow-sm`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white font-heading">
              {testimonial.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-gray-800">{testimonial.name}</p>
              <p className="font-body text-xs text-gray-400">{testimonial.location}</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {testimonial.treatment && (
              <span className="rounded-full bg-tint px-2.5 py-1 font-heading text-[0.58rem] font-semibold text-primary">
                {testimonial.treatment}
              </span>
            )}
            <div className="flex">
              {Array.from({ length: testimonial.rating }).map((_, i) => <StarIcon key={i} />)}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
            />
          ) : (
            <p className="font-body text-sm text-gray-600 leading-relaxed line-clamp-2">&ldquo;{text}&rdquo;</p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-4">
          <button
            onClick={() => setEditing((v) => !v)}
            className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all ${editing ? 'border-primary bg-primary/8 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary'}`}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={onToggle}
            className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all ${visible ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}`}
          >
            {visible ? 'Visible' : 'Hidden'}
          </button>
          <button
            onClick={onDelete}
            className="ml-auto rounded-lg border border-red-100 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-red-400 transition-all hover:border-red-200 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsCmsPage() {
  const [testimonials] = useState(
    TESTIMONIALS_STATIC.map((t) => ({ ...t })).sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)

  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>(
    TESTIMONIALS_STATIC.reduce<Record<string, boolean>>((acc, t) => { acc[t.id] = t.visible; return acc }, {})
  )

  const toggle = (id: string) => setVisibleMap((prev) => ({ ...prev, [id]: !prev[id] }))
  const remove = (id: string) => setDeleted((prev) => new Set([...prev, id]))

  const visible = testimonials.filter((t) => !deleted.has(t.id))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Testimonials</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage patient reviews shown on the public website.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Review
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

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: testimonials.length },
          { label: 'Visible', value: Object.values(visibleMap).filter(Boolean).length },
          { label: 'Hidden', value: Object.values(visibleMap).filter((v) => !v).length + deleted.size },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((t) => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            visible={visibleMap[t.id] ?? t.visible}
            onToggle={() => toggle(t.id)}
            onDelete={() => remove(t.id)}
          />
        ))}
      </div>

      {deleted.size > 0 && (
        <p className="mt-4 font-body text-xs text-gray-400 text-center">
          {deleted.size} review{deleted.size > 1 ? 's' : ''} removed · Will be deleted after Supabase integration
        </p>
      )}
    </div>
  )
}
