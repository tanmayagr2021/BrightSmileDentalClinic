'use client'

import { useState } from 'react'
import { CLINIC_NAME_SHORT } from '@/lib/constants'

type PageSeo = {
  id: string
  page: string
  path: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  noIndex: boolean
}

const INITIAL_PAGES: PageSeo[] = [
  {
    id: 'home',
    page: 'Homepage',
    path: '/',
    title: `${CLINIC_NAME_SHORT} — Creating Smiles, Changing Lives`,
    description: 'Bright Smile Dental Clinic in Naxal, Kathmandu. Expert dental care from NMC-registered dentists — general dentistry, orthodontics, implants, cosmetic dentistry and more.',
    ogTitle: `${CLINIC_NAME_SHORT} — Premium Dental Care in Kathmandu`,
    ogDescription: 'Experience world-class dental care at Bright Smile. NMC-registered dentists. 1,000+ happy patients. Book your appointment today.',
    noIndex: false,
  },
  {
    id: 'services',
    page: 'Services',
    path: '/services',
    title: `Dental Services — ${CLINIC_NAME_SHORT}`,
    description: 'Comprehensive dental services including general dentistry, orthodontics, cosmetic treatments, dental implants, oral surgery, and paediatric care in Kathmandu.',
    ogTitle: `Our Services — ${CLINIC_NAME_SHORT}`,
    ogDescription: 'From routine checkups to complex restorations — explore all our dental treatment categories.',
    noIndex: false,
  },
  {
    id: 'doctors',
    page: 'Our Doctors',
    path: '/doctors',
    title: `Our Doctors — ${CLINIC_NAME_SHORT}`,
    description: 'Meet our NMC-registered lead dentists and specialist team. Dr. Sachin Shrestha and Dr. Binita Rana lead Bright Smile\'s expert dental team.',
    ogTitle: `Meet Our Dentists — ${CLINIC_NAME_SHORT}`,
    ogDescription: 'Our experienced, NMC-registered dental team is dedicated to exceptional care.',
    noIndex: false,
  },
  {
    id: 'appointments',
    page: 'Appointments',
    path: '/appointments',
    title: `Book an Appointment — ${CLINIC_NAME_SHORT}`,
    description: 'Book your dental appointment at Bright Smile Dental Clinic, Naxal, Kathmandu. Choose your dentist, pick a time, and confirm in minutes.',
    ogTitle: `Book Your Appointment — ${CLINIC_NAME_SHORT}`,
    ogDescription: 'Choose your dentist and book a time that suits you — quick, easy, and online.',
    noIndex: false,
  },
  {
    id: 'contact',
    page: 'Contact',
    path: '/contact',
    title: `Contact Us — ${CLINIC_NAME_SHORT}`,
    description: 'Get in touch with Bright Smile Dental Clinic. Call, WhatsApp, or email us. Located at Nagpokhari, Naxal, Kathmandu.',
    ogTitle: `Contact Bright Smile — ${CLINIC_NAME_SHORT}`,
    ogDescription: 'We\'re here to help. Call, WhatsApp, or visit us at Naxal, Kathmandu.',
    noIndex: false,
  },
  {
    id: 'faq',
    page: 'FAQ',
    path: '/faq',
    title: `Frequently Asked Questions — ${CLINIC_NAME_SHORT}`,
    description: 'Answers to common questions about our dental services, appointment process, costs, treatments, and more.',
    ogTitle: `FAQ — ${CLINIC_NAME_SHORT}`,
    ogDescription: 'Your questions answered — from first visits to advanced treatments.',
    noIndex: false,
  },
  {
    id: 'gallery',
    page: 'Gallery',
    path: '/gallery',
    title: `Clinic Gallery — ${CLINIC_NAME_SHORT}`,
    description: 'See our modern dental clinic, treatment rooms, and smile transformations. Bright Smile Dental Clinic, Naxal, Kathmandu.',
    ogTitle: `Clinic Gallery — ${CLINIC_NAME_SHORT}`,
    ogDescription: 'Our clinic, our team, and our patients\' smiles.',
    noIndex: false,
  },
  {
    id: 'admin',
    page: 'Admin Dashboard',
    path: '/admin',
    title: 'Admin — Bright Smile CMS',
    description: '',
    ogTitle: '',
    ogDescription: '',
    noIndex: true,
  },
]

export default function SeoSettingsPage() {
  const [pages, setPages] = useState<PageSeo[]>(INITIAL_PAGES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const update = (id: string, key: keyof PageSeo, value: string | boolean) =>
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, [key]: value } : p))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">SEO Settings</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Configure meta titles, descriptions, and Open Graph tags per page.</p>
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
          className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Save All
        </button>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="font-heading text-xs font-semibold text-green-700">SEO settings saved locally · Will be applied after Supabase integration</p>
        </div>
      )}

      {/* Info */}
      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="font-body text-xs text-blue-700 leading-relaxed">
          <strong>Phase H note:</strong> SEO metadata is currently managed via Next.js <code className="font-mono bg-blue-100 px-1 rounded">generateMetadata</code> in each page file. After Supabase integration, these fields will be fetched dynamically and override the static defaults.
        </p>
      </div>

      <div className="space-y-3">
        {pages.map((page) => (
          <div key={page.id} className={`rounded-2xl border transition-all ${editingId === page.id ? 'border-primary/20 shadow-md' : 'border-gray-100 shadow-sm'} bg-white`}>
            {/* Header row */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm font-semibold text-gray-800">{page.page}</p>
                  {page.noIndex && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 font-heading text-[0.55rem] font-semibold text-red-500">noindex</span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[0.6rem] text-gray-400">{page.path}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {/* Title length indicator */}
                <span className={`font-heading text-[0.6rem] font-semibold ${page.title.length > 60 ? 'text-red-400' : page.title.length > 50 ? 'text-amber-400' : 'text-green-500'}`}>
                  {page.title.length}/60
                </span>
                <button
                  onClick={() => setEditingId(editingId === page.id ? null : page.id)}
                  className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all ${editingId === page.id ? 'border-primary/20 bg-primary/8 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary'}`}
                >
                  {editingId === page.id ? 'Close' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {editingId === page.id && (
              <div className="border-t border-gray-50 px-5 pb-5 pt-4 space-y-4">
                <div>
                  <label className="block font-heading text-[0.65rem] font-semibold text-gray-600 mb-1.5">
                    Meta Title
                    <span className="ml-1.5 font-normal text-gray-400">({page.title.length}/60 chars)</span>
                  </label>
                  <input
                    value={page.title}
                    onChange={(e) => update(page.id, 'title', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
                  />
                  {page.title.length > 60 && (
                    <p className="mt-1 font-body text-[0.62rem] text-red-400">Title exceeds 60 characters — may be truncated in search results.</p>
                  )}
                </div>
                <div>
                  <label className="block font-heading text-[0.65rem] font-semibold text-gray-600 mb-1.5">
                    Meta Description
                    <span className="ml-1.5 font-normal text-gray-400">({page.description.length}/160 chars)</span>
                  </label>
                  <textarea
                    value={page.description}
                    onChange={(e) => update(page.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
                  />
                  {page.description.length > 160 && (
                    <p className="mt-1 font-body text-[0.62rem] text-amber-500">Description exceeds 160 characters.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-50">
                  <p className="font-heading text-[0.65rem] font-semibold text-gray-500 mb-3 uppercase tracking-wide">Open Graph (Social Sharing)</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-heading text-[0.65rem] font-semibold text-gray-600 mb-1.5">OG Title</label>
                      <input
                        value={page.ogTitle}
                        onChange={(e) => update(page.id, 'ogTitle', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-heading text-[0.65rem] font-semibold text-gray-600 mb-1.5">OG Description</label>
                      <textarea
                        value={page.ogDescription}
                        onChange={(e) => update(page.id, 'ogDescription', e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="font-heading text-xs font-semibold text-gray-700">No Index</p>
                    <p className="font-body text-[0.62rem] text-gray-400">Hide from search engines (e.g. admin, login pages)</p>
                  </div>
                  <button
                    onClick={() => update(page.id, 'noIndex', !page.noIndex)}
                    className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${page.noIndex ? 'bg-red-400' : 'bg-gray-200'}`}
                    role="switch"
                    aria-checked={page.noIndex}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${page.noIndex ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* SERP preview */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="font-heading text-[0.6rem] font-semibold text-gray-400 uppercase tracking-wide mb-2">Search Preview</p>
                  <p className="font-heading text-sm font-semibold text-blue-600 leading-snug truncate">{page.title || 'Untitled'}</p>
                  <p className="font-mono text-[0.6rem] text-green-600 mt-0.5">brightsmiledentalclinic.com{page.path}</p>
                  <p className="font-body text-xs text-gray-500 mt-1 line-clamp-2">{page.description || 'No description set.'}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
