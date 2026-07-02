'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

type ValueItem = { title: string; description: string }

type AboutForm = {
  founded: string
  story: string
  mission: string
  vision: string
  values: ValueItem[]
  why_choose_us: string[]
}

function emptyForm(): AboutForm {
  return {
    founded: '',
    story: '',
    mission: '',
    vision: '',
    values: [],
    why_choose_us: [],
  }
}

export default function AdminAboutPage() {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [form, setForm] = useState<AboutForm>(emptyForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch('/api/admin/about')
      .then((r) => r.json())
      .then((data: { about_content: AboutForm | null }) => {
        if (data.about_content) {
          setForm({
            founded: data.about_content.founded ?? '',
            story: data.about_content.story ?? '',
            mission: data.about_content.mission ?? '',
            vision: data.about_content.vision ?? '',
            values: data.about_content.values ?? [],
            why_choose_us: data.about_content.why_choose_us ?? [],
          })
        }
      })
      .catch(() => showToast('Failed to load about content', false))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/about', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about_content: form }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('About page saved', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setSaving(false)
    }
  }

  const addValue = () =>
    setForm((f) => ({ ...f, values: [...f.values, { title: '', description: '' }] }))

  const updateValue = (i: number, key: keyof ValueItem, val: string) =>
    setForm((f) => {
      const values = [...f.values]
      values[i] = { ...values[i], [key]: val }
      return { ...f, values }
    })

  const removeValue = (i: number) =>
    setForm((f) => ({ ...f, values: f.values.filter((_, idx) => idx !== i) }))

  const addWhyItem = () =>
    setForm((f) => ({ ...f, why_choose_us: [...f.why_choose_us, ''] }))

  const updateWhyItem = (i: number, val: string) =>
    setForm((f) => {
      const why_choose_us = [...f.why_choose_us]
      why_choose_us[i] = val
      return { ...f, why_choose_us }
    })

  const removeWhyItem = (i: number) =>
    setForm((f) => ({ ...f, why_choose_us: f.why_choose_us.filter((_, idx) => idx !== i) }))

  const inp = (key: 'founded' | 'story' | 'mission' | 'vision') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-display text-xl text-gray-900 tracking-tight">About Page</h2>
        <p className="mt-1 font-body text-sm text-gray-500">Edit the clinic story and values shown on the public About page.</p>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-xs font-semibold text-gray-700 uppercase tracking-wide">Clinic Info</h3>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Founded Year</label>
            <input
              value={form.founded}
              onChange={inp('founded')}
              placeholder="e.g. 2013"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Story</label>
            <textarea
              value={form.story}
              onChange={inp('story')}
              rows={6}
              placeholder="Clinic origin story (paragraphs separated by blank lines)…"
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-xs font-semibold text-gray-700 uppercase tracking-wide">Mission &amp; Vision</h3>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Mission</label>
            <textarea
              value={form.mission}
              onChange={inp('mission')}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Vision</label>
            <textarea
              value={form.vision}
              onChange={inp('vision')}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs font-semibold text-gray-700 uppercase tracking-wide">Values</h3>
            <button
              onClick={addValue}
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 font-heading text-xs font-semibold text-primary hover:bg-primary/15"
            >
              + Add Value
            </button>
          </div>
          {form.values.map((v, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={v.title}
                  onChange={(e) => updateValue(i, 'title', e.target.value)}
                  placeholder="Value title"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  onClick={() => removeValue(i)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                  aria-label="Remove value"
                >
                  <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.5a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <textarea
                value={v.description}
                onChange={(e) => updateValue(i, 'description', e.target.value)}
                rows={2}
                placeholder="Value description"
                className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          ))}
          {form.values.length === 0 && (
            <p className="font-body text-xs text-gray-600">No values yet. Click &ldquo;Add Value&rdquo;.</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs font-semibold text-gray-700 uppercase tracking-wide">Why Choose Us</h3>
            <button
              onClick={addWhyItem}
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 font-heading text-xs font-semibold text-primary hover:bg-primary/15"
            >
              + Add Point
            </button>
          </div>
          {form.why_choose_us.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => updateWhyItem(i, e.target.value)}
                placeholder="e.g. 6 experienced NMC-registered dentists"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                onClick={() => removeWhyItem(i)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                aria-label="Remove point"
              >
                <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.5a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
          {form.why_choose_us.length === 0 && (
            <p className="font-body text-xs text-gray-600">No points yet. Click &ldquo;Add Point&rdquo;.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save About Page'}
          </button>
        </div>
      </div>
    </div>
  )
}
