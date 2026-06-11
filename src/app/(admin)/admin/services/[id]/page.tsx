'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type ServiceRow = {
  id: string
  slug: string
  name: string
  description: string | null
  short_description: string | null
  icon_name: string | null
  is_visible: boolean
  sort_order: number
}

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string

  const [service, setService] = useState<ServiceRow | null>(null)
  const [form, setForm] = useState({ name: '', description: '', short_description: '', icon_name: '', is_visible: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    // Find the service by slug via the batch endpoint
    fetch('/api/admin/services')
      .then(r => r.json())
      .then((rows: ServiceRow[]) => {
        const found = rows.find(r => r.slug === slug)
        if (found) {
          setService(found)
          setForm({
            name: found.name,
            description: found.description ?? '',
            short_description: found.short_description ?? '',
            icon_name: found.icon_name ?? '',
            is_visible: found.is_visible,
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const handleSave = async () => {
    if (!service) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          short_description: form.short_description.trim() || null,
          icon_name: form.icon_name.trim() || null,
          is_visible: form.is_visible,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      showToast('Service saved', true)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error saving', false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-100 mb-2" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="p-6 max-w-2xl mx-auto py-20 text-center">
        <p className="font-heading text-sm text-gray-400 mb-4">Service not found.</p>
        <Link href="/admin/services" className="font-heading text-sm font-semibold text-primary hover:underline">← Back to Services</Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

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
          <p className="mt-1 font-body text-sm text-gray-500">slug: <code className="font-mono text-xs text-gray-600">{service.slug}</code></p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setForm(f => ({ ...f, is_visible: !f.is_visible }))}
            className={`rounded-xl border px-4 py-2 font-heading text-xs font-semibold transition-all ${form.is_visible ? 'border-green-200 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400'}`}
          >
            {form.is_visible ? 'Visible' : 'Hidden'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm space-y-5">
        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Service Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Short Description</label>
          <textarea
            value={form.short_description}
            onChange={(e) => setForm(f => ({ ...f, short_description: e.target.value }))}
            rows={2}
            placeholder="One-sentence summary shown on homepage services card"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <p className="mt-1 font-body text-[0.62rem] text-gray-400">{form.short_description.length} chars · Keep under 120 for best display</p>
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Full Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Longer description shown on the service detail page"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Icon Name</label>
          <input
            value={form.icon_name}
            onChange={(e) => setForm(f => ({ ...f, icon_name: e.target.value }))}
            placeholder="e.g. tooth, star (Lucide icon name)"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Link href="/admin/services" className="rounded-xl border border-gray-200 px-5 py-2.5 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
          ← Back to Services
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
