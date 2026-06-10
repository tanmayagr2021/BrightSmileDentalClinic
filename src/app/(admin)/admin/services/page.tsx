'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SERVICE_CATEGORIES_STATIC } from '@/lib/constants'

export default function ServicesCmsPage() {
  const [services, setServices] = useState(
    SERVICE_CATEGORIES_STATIC.map((s) => ({ ...s })).sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [saved, setSaved] = useState(false)

  const toggle = (slug: string) =>
    setServices((prev) => prev.map((s) => s.slug === slug ? { ...s, visible: !s.visible } : s))

  const moveUp = (i: number) => {
    if (i === 0) return
    setServices((prev) => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next.map((s, idx) => ({ ...s, sortOrder: idx + 1 }))
    })
  }

  const moveDown = (i: number) => {
    setServices((prev) => {
      if (i === prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next.map((s, idx) => ({ ...s, sortOrder: idx + 1 }))
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Services</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage treatment categories, descriptions, and visibility.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Service
          </button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Save Order
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="font-heading text-xs font-semibold text-green-700">Order saved locally · Will persist after Supabase integration</p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: services.length },
          { label: 'Visible', value: services.filter((s) => s.visible).length },
          { label: 'Sub-services', value: services.reduce((n, s) => n + s.subServices.length, 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {services.map((service, i) => (
          <div
            key={service.slug}
            className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${service.visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-55'} shadow-sm`}
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
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-heading text-[0.55rem] font-semibold text-gray-400">
                  {service.subServices.length} treatments
                </span>
              </div>
              <p className="mt-0.5 font-body text-xs text-gray-400 truncate">{service.shortDescription}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Move up"
              >
                <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i === services.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Move down"
              >
                <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={() => toggle(service.slug)}
                className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all ${service.visible ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}`}
              >
                {service.visible ? 'Visible' : 'Hidden'}
              </button>

              <Link
                href={`/admin/services/${service.slug}`}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-600 transition-all hover:border-primary/30 hover:text-primary"
              >
                Edit
                <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-gray-200 px-5 py-4 text-center">
        <button className="font-heading text-xs font-semibold text-gray-400 hover:text-primary transition-colors">
          + Add New Service Category
        </button>
      </div>
    </div>
  )
}
