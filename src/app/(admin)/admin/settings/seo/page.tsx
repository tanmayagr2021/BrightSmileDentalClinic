'use client'

import { useState, useEffect } from 'react'

const PAGES = [
  { slug: 'home',         page: 'Homepage',     path: '/' },
  { slug: 'services',     page: 'Services',     path: '/services' },
  { slug: 'doctors',      page: 'Our Doctors',  path: '/doctors' },
  { slug: 'appointments', page: 'Appointments', path: '/appointments' },
  { slug: 'contact',      page: 'Contact',      path: '/contact' },
  { slug: 'faq',          page: 'FAQ',           path: '/faq' },
  { slug: 'gallery',      page: 'Gallery',      path: '/gallery' },
  { slug: 'about',        page: 'About',        path: '/about' },
]

type PageSeo = {
  slug: string
  meta_title: string
  meta_description: string
  og_image_url: string
  is_noindex: boolean
}

function makeDefault(slug: string): PageSeo {
  return { slug, meta_title: '', meta_description: '', og_image_url: '', is_noindex: false }
}

export default function SeoSettingsPage() {
  const [pages, setPages] = useState<PageSeo[]>(PAGES.map(p => makeDefault(p.slug)))
  const [activeSlug, setActiveSlug] = useState(PAGES[0].slug)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch('/api/admin/settings/seo')
      .then(r => r.json())
      .then((rows: PageSeo[]) => {
        setPages(PAGES.map(p => {
          const found = rows.find(r => r.slug === p.slug)
          return found ? {
            slug: found.slug,
            meta_title: found.meta_title ?? '',
            meta_description: found.meta_description ?? '',
            og_image_url: found.og_image_url ?? '',
            is_noindex: found.is_noindex ?? false,
          } : makeDefault(p.slug)
        }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const current = pages.find(p => p.slug === activeSlug) ?? makeDefault(activeSlug)

  const update = (patch: Partial<PageSeo>) =>
    setPages(prev => prev.map(p => p.slug === activeSlug ? { ...p, ...patch } : p))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pages.map(p => ({
          slug: p.slug,
          meta_title: p.meta_title || null,
          meta_description: p.meta_description || null,
          og_image_url: p.og_image_url || null,
          is_noindex: p.is_noindex,
        }))),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      showToast('SEO settings saved', true)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error saving', false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100 mb-2" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  const titleLen = current.meta_title.length
  const descLen = current.meta_description.length
  const activePage = PAGES.find(p => p.slug === activeSlug)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">SEO Settings</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Meta titles, descriptions and social sharing per page.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60">
          {saving ? 'Saving…' : 'Save All Pages'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        {/* Page list */}
        <div className="space-y-1">
          {PAGES.map((p) => {
            const seo = pages.find(x => x.slug === p.slug)
            const filled = !!(seo?.meta_title && seo?.meta_description)
            return (
              <button
                key={p.slug}
                onClick={() => setActiveSlug(p.slug)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${activeSlug === p.slug ? 'bg-primary/8 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div>
                  <p className="font-heading text-xs font-semibold">{p.page}</p>
                  <p className="font-body text-[0.58rem] text-gray-400">{p.path}</p>
                </div>
                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${filled ? 'bg-green-400' : 'bg-gray-200'}`} />
              </button>
            )
          })}
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div>
              <p className="font-heading text-sm font-semibold text-gray-900">{activePage?.page}</p>
              <p className="font-body text-xs text-gray-400">{activePage?.path}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-gray-400">No-index</span>
              <button
                onClick={() => update({ is_noindex: !current.is_noindex })}
                className={`relative flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${current.is_noindex ? 'bg-red-400' : 'bg-gray-200'}`}
                role="switch" aria-checked={current.is_noindex}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${current.is_noindex ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-heading text-xs font-semibold text-gray-700">Meta Title</label>
              <span className={`font-body text-[0.6rem] ${titleLen > 60 ? 'text-red-400' : titleLen > 50 ? 'text-amber-400' : 'text-gray-400'}`}>
                {titleLen}/60
              </span>
            </div>
            <input
              value={current.meta_title}
              onChange={(e) => update({ meta_title: e.target.value })}
              placeholder="Page title shown in browser tab and search results"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-heading text-xs font-semibold text-gray-700">Meta Description</label>
              <span className={`font-body text-[0.6rem] ${descLen > 160 ? 'text-red-400' : descLen > 140 ? 'text-amber-400' : 'text-gray-400'}`}>
                {descLen}/160
              </span>
            </div>
            <textarea
              value={current.meta_description}
              onChange={(e) => update({ meta_description: e.target.value })}
              rows={3}
              placeholder="Brief description shown below the title in search results"
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">OG Image URL</label>
            <input
              value={current.og_image_url}
              onChange={(e) => update({ og_image_url: e.target.value })}
              placeholder="https://… (1200×630px recommended)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <p className="mt-1 font-body text-[0.62rem] text-gray-400">Shown when sharing on social media. 1200×630px, JPG or PNG.</p>
          </div>

          {(current.meta_title || current.meta_description) && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="font-heading text-[0.6rem] font-semibold uppercase tracking-wide text-gray-400 mb-2">Search Preview</p>
              <p className="font-body text-xs text-gray-400">{activePage?.path}</p>
              <p className="font-heading text-sm font-semibold text-blue-600 mt-0.5">{current.meta_title || '(No title)'}</p>
              <p className="font-body text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{current.meta_description || '(No description)'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
