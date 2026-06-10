'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SERVICE_CATEGORIES_STATIC, type ServiceCategory } from '@/lib/constants'

export default function EditServicePage() {
  const params = useParams()
  const slug = params.id as string

  const service = SERVICE_CATEGORIES_STATIC.find((s) => s.slug === slug)

  const [form, setForm] = useState<ServiceCategory | undefined>(
    service ? { ...service, subServices: service.subServices.map((s) => ({ ...s })) } : undefined
  )
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'faqs' | 'seo'>('content')

  if (!service || !form) {
    return (
      <div className="p-6 max-w-2xl mx-auto py-20 text-center">
        <p className="font-heading text-sm text-gray-400 mb-4">Service not found.</p>
        <Link href="/admin/services" className="font-heading text-sm font-semibold text-primary hover:underline">
          ← Back to Services
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-heading text-xs text-gray-400">
        <Link href="/admin/services" className="hover:text-primary transition-colors">Services</Link>
        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-gray-600">{service.name}</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">{service.name}</h2>
          <p className="mt-1 font-body text-sm text-gray-500">{form.subServices.length} sub-services · {service.faqs.length} FAQs</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setForm((f) => f ? { ...f, visible: !f.visible } : f)}
            className={`rounded-xl border px-4 py-2 font-heading text-xs font-semibold transition-all ${form.visible ? 'border-green-200 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400'}`}
          >
            {form.visible ? 'Visible' : 'Hidden'}
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

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
        {(['content', 'faqs', 'seo'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 font-heading text-xs font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab === 'faqs' ? 'FAQs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => f ? { ...f, name: e.target.value } : f)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Short Description</label>
              <input
                value={form.shortDescription}
                onChange={(e) => setForm((f) => f ? { ...f, shortDescription: e.target.value } : f)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
              />
              <p className="mt-1 font-body text-[0.62rem] text-gray-400">Shown on the services grid card on the homepage and /services page.</p>
            </div>
            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Full Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => f ? { ...f, description: e.target.value } : f)}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Sub-services */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold text-gray-800">Sub-services</h3>
              <button className="font-heading text-xs font-semibold text-primary hover:underline">+ Add</button>
            </div>
            <div className="space-y-3">
              {form.subServices.map((sub, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
                  <input
                    value={sub.name}
                    onChange={(e) => setForm((f) => {
                      if (!f) return f
                      const subs = [...f.subServices]
                      subs[i] = { ...subs[i], name: e.target.value }
                      return { ...f, subServices: subs }
                    })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-heading text-xs font-semibold text-gray-900 outline-none focus:border-primary"
                    placeholder="Sub-service name"
                  />
                  <textarea
                    value={sub.description}
                    onChange={(e) => setForm((f) => {
                      if (!f) return f
                      const subs = [...f.subServices]
                      subs[i] = { ...subs[i], description: e.target.value }
                      return { ...f, subServices: subs }
                    })}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-600 outline-none focus:border-primary"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold text-gray-800">Benefits</h3>
              <button className="font-heading text-xs font-semibold text-primary hover:underline">+ Add</button>
            </div>
            <div className="space-y-2">
              {form.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <input
                    value={benefit}
                    onChange={(e) => setForm((f) => {
                      if (!f) return f
                      const benefits = [...f.benefits]
                      benefits[i] = e.target.value
                      return { ...f, benefits }
                    })}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 font-body text-xs text-gray-900 outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="space-y-3">
          {form.faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Question</label>
                <input
                  value={faq.q}
                  onChange={(e) => setForm((f) => {
                    if (!f) return f
                    const faqs = [...f.faqs]
                    faqs[i] = { ...faqs[i], q: e.target.value }
                    return { ...f, faqs }
                  })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Answer</label>
                <textarea
                  value={faq.a}
                  onChange={(e) => setForm((f) => {
                    if (!f) return f
                    const faqs = [...f.faqs]
                    faqs[i] = { ...faqs[i], a: e.target.value }
                    return { ...f, faqs }
                  })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-600 outline-none focus:border-primary"
                />
              </div>
            </div>
          ))}
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-5 py-4 text-center">
            <button className="font-heading text-xs font-semibold text-gray-400 hover:text-primary transition-colors">
              + Add FAQ
            </button>
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 mb-2">
            <p className="font-body text-xs text-blue-700">SEO meta for <code className="font-mono bg-blue-100 px-1 rounded">/services/{slug}</code> — configured in the SEO Settings page. This tab shows per-service overrides for Phase H.</p>
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Page Title Override</label>
            <input
              type="text"
              placeholder={`${service.name} — Bright Smile Dental Clinic`}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Meta Description Override</label>
            <textarea
              rows={2}
              placeholder={service.shortDescription}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <button className="font-heading text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
          Delete Service
        </button>
        <div className="flex gap-3">
          <Link href="/admin/services" className="rounded-xl border border-gray-200 px-5 py-2.5 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            Cancel
          </Link>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
            className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
