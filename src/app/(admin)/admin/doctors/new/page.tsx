'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewDoctorPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name:       '',
    title:           '',
    qualification:   '',
    nmc_number:      '',
    experience_text: '',
    education:       '',
    short_bio:       '',
    full_bio:        '',
    specializations: '',
    languages:       'Nepali, Hindi, English',
    doctor_type:     'lead' as 'lead' | 'specialist',
    is_active:       true,
    is_bookable:     false,
  })

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { setError('Full name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:       form.full_name.trim(),
          title:           form.title.trim() || null,
          qualification:   form.qualification.trim() || null,
          nmc_number:      form.nmc_number.trim() || null,
          experience_text: form.experience_text.trim() || null,
          education:       form.education.trim() || null,
          short_bio:       form.short_bio.trim() || null,
          full_bio:        form.full_bio.trim() || null,
          specializations: form.specializations.split(',').map((s) => s.trim()).filter(Boolean),
          languages:       form.languages.split(',').map((s) => s.trim()).filter(Boolean),
          doctor_type:     form.doctor_type,
          is_bookable:     form.is_bookable,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create doctor')
      router.push('/admin/doctors')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating doctor')
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-heading text-xs text-gray-600">
        <Link href="/admin/doctors" className="hover:text-primary transition-colors">Doctors</Link>
        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-gray-600">New Doctor</span>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-xl text-gray-900 tracking-tight">Add Doctor</h2>
        <p className="mt-1 font-body text-sm text-gray-500">Fill in the details to add a new doctor to the clinic directory.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
          <p className="font-heading text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm space-y-6">

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Doctor Type</label>
          <select
            value={form.doctor_type}
            onChange={update('doctor_type')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="lead">Lead Dentist</option>
            <option value="specialist">Specialist</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <input type="text" value={form.full_name} onChange={update('full_name')} placeholder="Dr. Full Name" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Role / Title</label>
            <input type="text" value={form.title} onChange={update('title')} placeholder="e.g. Lead Dentist" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Qualification</label>
            <input type="text" value={form.qualification} onChange={update('qualification')} placeholder="e.g. BDS, MDS" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">NMC Number</label>
            <input type="text" value={form.nmc_number} onChange={update('nmc_number')} placeholder="e.g. NMC 3216" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Experience</label>
            <input type="text" value={form.experience_text} onChange={update('experience_text')} placeholder="e.g. 10+ years" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Education</label>
            <input type="text" value={form.education} onChange={update('education')} placeholder="e.g. BPKIHS, Dharan" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Short Bio</label>
          <textarea value={form.short_bio} onChange={update('short_bio')} rows={2} placeholder="One-line summary for cards..." className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Full Bio</label>
          <textarea value={form.full_bio} onChange={update('full_bio')} rows={4} placeholder="Doctor biography for the public profile page..." className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <p className="mt-1 font-body text-[0.62rem] text-gray-600">{form.full_bio.length} characters</p>
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Specializations</label>
          <input type="text" value={form.specializations} onChange={update('specializations')} placeholder="Comma-separated, e.g. General Dentistry, Root Canal" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Languages</label>
          <input type="text" value={form.languages} onChange={update('languages')} placeholder="Comma-separated, e.g. Nepali, Hindi, English" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="font-heading text-xs font-semibold text-gray-700">Visible</p>
              <p className="font-body text-[0.62rem] text-gray-600">Show on public site</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={form.is_active}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {form.doctor_type === 'lead' && (
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="font-heading text-xs font-semibold text-gray-700">Bookable</p>
                <p className="font-body text-[0.62rem] text-gray-600">Appears in booking flow</p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, is_bookable: !f.is_bookable }))}
                className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${form.is_bookable ? 'bg-primary' : 'bg-gray-200'}`}
                role="switch"
                aria-checked={form.is_bookable}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_bookable ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Link href="/admin/doctors" className="rounded-xl border border-gray-200 px-5 py-2.5 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add Doctor'}
        </button>
      </div>
    </div>
  )
}
