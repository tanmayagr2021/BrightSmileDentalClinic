'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SHOWCASE_SLIDES_STATIC, type ShowcaseSlide } from '@/lib/constants'

function SaveBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-3"
    >
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-green-600" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 8l2.5 2.5 4-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-heading text-xs font-semibold text-green-700">Changes saved locally · Will persist after Supabase integration</p>
      </div>
      <button onClick={onDismiss} className="font-heading text-xs text-green-500 hover:text-green-700">Dismiss</button>
    </motion.div>
  )
}

function SlideEditor({
  slide,
  index,
  total,
  onToggle,
  onMoveUp,
  onMoveDown,
}: {
  slide: ShowcaseSlide & { visible: boolean }
  index: number
  total: number
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(slide.title)
  const [desc, setDesc] = useState(slide.description)

  return (
    <div className={`rounded-2xl border transition-colors ${slide.visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'} shadow-sm`}>
      <div className="flex items-start gap-4 p-5">

        {/* Gradient preview */}
        <div
          className="h-14 w-20 flex-shrink-0 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${slide.gradientFrom}, ${slide.gradientTo})` }}
          aria-hidden="true"
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40" style={{ boxShadow: `0 0 0 3px ${slide.accentColor}40` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-sm font-semibold text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-600 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          ) : (
            <>
              <p className="font-heading text-sm font-semibold text-gray-900 truncate">{title}</p>
              <p className="mt-0.5 font-body text-xs text-gray-500 line-clamp-2">{desc}</p>
            </>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="font-body text-[0.6rem] text-gray-400">Slide {slide.sortOrder}</span>
            <span
              className="rounded-full px-2 py-0.5 font-heading text-[0.58rem] font-semibold"
              style={{ backgroundColor: slide.accentColor + '20', color: slide.accentColor }}
            >
              {slide.category}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          {/* Visibility toggle */}
          <button
            onClick={onToggle}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-[0.6rem] font-semibold transition-all ${
              slide.visible
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${slide.visible ? 'bg-green-500' : 'bg-gray-400'}`} />
            {slide.visible ? 'Visible' : 'Hidden'}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move up"
            >
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move down"
            >
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setEditing((v) => !v)}
              className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${editing ? 'border-primary bg-primary/8 text-primary' : 'border-gray-200 text-gray-400 hover:border-primary/30 hover:text-primary'}`}
              aria-label="Edit slide"
            >
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Image upload zone */}
      <div className="mx-5 mb-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center hover:border-primary/30 transition-colors cursor-pointer group">
        <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-6 w-6 text-gray-300 group-hover:text-primary/40 transition-colors" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 15l5-4 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-2 font-heading text-xs font-semibold text-gray-400 group-hover:text-primary/60 transition-colors">Upload Photo</p>
        <p className="font-body text-[0.6rem] text-gray-300 mt-0.5">JPG, PNG up to 10 MB · Replaces gradient preview</p>
      </div>
    </div>
  )
}

export default function ShowcaseCmsPage() {
  const [slides, setSlides] = useState(
    SHOWCASE_SLIDES_STATIC.map((s) => ({ ...s })).sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [saved, setSaved] = useState(false)

  const toggle = (i: number) => setSlides((prev) => prev.map((s, idx) => idx === i ? { ...s, visible: !s.visible } : s))

  const moveUp = (i: number) => {
    if (i === 0) return
    setSlides((prev) => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next.map((s, idx) => ({ ...s, sortOrder: idx + 1 }))
    })
  }

  const moveDown = (i: number) => {
    setSlides((prev) => {
      if (i === prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next.map((s, idx) => ({ ...s, sortOrder: idx + 1 }))
    })
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 4000) }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Clinic Showcase</h2>
          <p className="mt-1 font-body text-sm text-gray-500">
            The full-screen hero section. Upload real clinic photos to replace the gradient previews.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300"
          >
            Add Slide
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Save Changes
          </button>
        </div>
      </div>

      {saved && <SaveBanner onDismiss={() => setSaved(false)} />}

      {/* Legend */}
      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm">
        <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-gray-400">How to use</p>
        <div className="flex flex-wrap gap-4 font-body text-xs text-gray-500">
          <span>↑↓ Reorder slides</span>
          <span>Toggle visibility on/off</span>
          <span>Edit title & description</span>
          <span>Upload real photos</span>
        </div>
      </div>

      {/* Slides */}
      <div className="space-y-4">
        {slides.map((slide, i) => (
          <SlideEditor
            key={slide.id}
            slide={slide}
            index={i}
            total={slides.length}
            onToggle={() => toggle(i)}
            onMoveUp={() => moveUp(i)}
            onMoveDown={() => moveDown(i)}
          />
        ))}
      </div>

      {/* Note */}
      <p className="mt-6 font-body text-xs text-gray-400 text-center">
        Changes are UI-only until Supabase integration. The public showcase section reads from static constants until then.
      </p>
    </div>
  )
}
