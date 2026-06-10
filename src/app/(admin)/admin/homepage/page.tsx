'use client'

import { useState } from 'react'
import Link from 'next/link'

type Section = {
  id: string
  label: string
  desc: string
  visible: boolean
  editLink?: string
  locked?: boolean
}

const INITIAL_SECTIONS: Section[] = [
  { id: 'showcase', label: 'Clinic Showcase', desc: 'Full-screen cinematic hero slideshow', visible: true, editLink: '/admin/showcase', locked: true },
  { id: 'stats', label: 'Stats Bar', desc: '1,000+ patients · 10+ years · 20+ treatments · 6 doctors', visible: true },
  { id: 'trust', label: 'Trust Indicators', desc: 'NMC registration, modern equipment, gentle care, transparent pricing', visible: true },
  { id: 'journey', label: 'Patient Journey', desc: '6-step care pathway — Book through Follow-up', visible: true },
  { id: 'services', label: 'Services', desc: '6 treatment categories with links to detail pages', visible: true, editLink: '/admin/services' },
  { id: 'doctors', label: 'Lead Dentists', desc: 'Dr. Sachin & Dr. Binita cards + specialist teaser', visible: true, editLink: '/admin/doctors' },
  { id: 'beforeafter', label: 'Before & After', desc: 'Smile transformation showcase (placeholder photos)', visible: true, editLink: '/admin/gallery' },
  { id: 'testimonials', label: 'Testimonials', desc: 'Featured review + patient stories grid', visible: true, editLink: '/admin/testimonials' },
  { id: 'whychoose', label: 'Why Choose Us', desc: '6-reason premium grid + certifications strip', visible: true },
  { id: 'faq', label: 'FAQs', desc: 'Accordion FAQ section with schema.org markup', visible: true, editLink: '/admin/faqs' },
  { id: 'cta', label: 'Appointment CTA', desc: 'Dark split section — CTA + hours', visible: true, locked: true },
]

function SectionRow({
  section,
  index,
  total,
  onToggle,
  onMoveUp,
  onMoveDown,
}: {
  section: Section
  index: number
  total: number
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${section.visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'} shadow-sm`}>

      {/* Drag handle placeholder */}
      <div className="flex flex-col gap-0.5 flex-shrink-0 cursor-grab" aria-hidden="true">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-0.5">
            <div className="h-1 w-1 rounded-full bg-gray-300" />
            <div className="h-1 w-1 rounded-full bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Order badge */}
      <span className="w-6 flex-shrink-0 text-center font-heading text-[0.65rem] font-bold text-gray-300">
        {index + 1}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-heading text-sm font-semibold text-gray-800">{section.label}</p>
          {section.locked && (
            <span className="rounded-full border border-gray-200 px-1.5 py-0.5 font-heading text-[0.55rem] font-semibold text-gray-400">
              Required
            </span>
          )}
        </div>
        <p className="mt-0.5 font-body text-xs text-gray-400 truncate">{section.desc}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {section.editLink && (
          <Link
            href={section.editLink}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary"
          >
            Edit Content
          </Link>
        )}

        <button
          onClick={onMoveUp}
          disabled={index === 0 || section.id === 'showcase'}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Move section up"
        >
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1 || section.id === 'cta'}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Move section down"
        >
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {!section.locked ? (
          <button
            onClick={onToggle}
            className={`flex h-7 min-w-[60px] items-center justify-center rounded-lg px-2 font-heading text-[0.6rem] font-semibold transition-all ${
              section.visible
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {section.visible ? 'Visible' : 'Hidden'}
          </button>
        ) : (
          <div className="h-7 min-w-[60px] flex items-center justify-center rounded-lg bg-gray-50">
            <span className="font-heading text-[0.58rem] text-gray-300">Always on</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomepageCmsPage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS)
  const [saved, setSaved] = useState(false)

  const toggle = (i: number) => {
    if (sections[i].locked) return
    setSections((prev) => prev.map((s, idx) => idx === i ? { ...s, visible: !s.visible } : s))
  }

  const moveUp = (i: number) => {
    if (i === 0 || sections[i].id === 'showcase') return
    setSections((prev) => { const n = [...prev]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n })
  }

  const moveDown = (i: number) => {
    if (i === sections.length - 1 || sections[i].id === 'cta') return
    setSections((prev) => { const n = [...prev]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Homepage Sections</h2>
          <p className="mt-1 font-body text-sm text-gray-500">
            Control which sections appear on the homepage and in what order.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            Reset Order
          </button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Save Layout
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="font-heading text-xs font-semibold text-green-700">Layout saved · Active after Supabase integration</p>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
        <p className="font-body text-xs text-gray-500">
          <strong className="text-gray-700">Showcase</strong> and <strong className="text-gray-700">CTA</strong> sections are always shown and cannot be hidden or reordered past their positions.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => (
          <SectionRow
            key={section.id}
            section={section}
            index={i}
            total={sections.length}
            onToggle={() => toggle(i)}
            onMoveUp={() => moveUp(i)}
            onMoveDown={() => moveDown(i)}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="font-display text-xl text-gray-900">{sections.length}</p>
          <p className="font-body text-xs text-gray-400 mt-0.5">Total sections</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="font-display text-xl text-green-600">{sections.filter((s) => s.visible).length}</p>
          <p className="font-body text-xs text-gray-400 mt-0.5">Visible</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="font-display text-xl text-gray-400">{sections.filter((s) => !s.visible).length}</p>
          <p className="font-body text-xs text-gray-400 mt-0.5">Hidden</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="font-display text-xl text-gray-900">{sections.filter((s) => s.locked).length}</p>
          <p className="font-body text-xs text-gray-400 mt-0.5">Required</p>
        </div>
      </div>
    </div>
  )
}
