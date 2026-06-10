'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DOCTORS_STATIC } from '@/lib/constants'

export default function EditDoctorPage() {
  const params = useParams()
  const slug = params.id as string

  const doctor = DOCTORS_STATIC.find((d) => d.slug === slug)

  const [form, setForm] = useState({
    name: doctor?.name ?? '',
    role: doctor?.role ?? '',
    qualification: doctor?.qualification ?? '',
    nmc: doctor?.nmc ?? '',
    experience: doctor?.experience ?? '',
    education: doctor?.education ?? '',
    bio: doctor?.bio ?? '',
    specializations: doctor?.specializations.join(', ') ?? '',
    languages: doctor?.languages.join(', ') ?? '',
    visible: doctor?.visible ?? true,
    bookable: doctor?.bookable ?? false,
  })

  const [saved, setSaved] = useState(false)

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!doctor) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <p className="font-heading text-sm text-gray-400 mb-4">Doctor not found.</p>
        <Link href="/admin/doctors" className="font-heading text-sm font-semibold text-primary hover:underline">
          ← Back to Doctors
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-heading text-xs text-gray-400">
        <Link href="/admin/doctors" className="hover:text-primary transition-colors">Doctors</Link>
        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-gray-600">{doctor.name}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white font-heading"
          style={{ backgroundColor: doctor.color }}
        >
          {doctor.initials}
        </div>
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">{doctor.name}</h2>
          <p className="font-body text-sm text-gray-500">{doctor.role}</p>
        </div>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="font-heading text-xs font-semibold text-green-700">Saved locally · Will persist after Supabase integration</p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm space-y-6">

        {/* Photo upload */}
        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white font-heading flex-shrink-0"
              style={{ backgroundColor: doctor.color }}
            >
              {doctor.initials}
            </div>
            <div className="flex-1 rounded-xl border-2 border-dashed border-gray-200 px-4 py-4 text-center hover:border-primary/30 cursor-pointer transition-colors">
              <p className="font-heading text-xs font-semibold text-gray-400">Upload Photo</p>
              <p className="font-body text-[0.62rem] text-gray-300 mt-0.5">JPG, PNG up to 5 MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={update('name')} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Role / Title</label>
            <input type="text" value={form.role} onChange={update('role')} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Qualification</label>
            <input type="text" value={form.qualification} onChange={update('qualification')} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">NMC Number</label>
            <input type="text" value={form.nmc} onChange={update('nmc')} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Experience</label>
            <input type="text" value={form.experience} onChange={update('experience')} placeholder="e.g. 10+ years" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Education</label>
            <input type="text" value={form.education} onChange={update('education')} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={update('bio')} rows={4} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <p className="mt-1 font-body text-[0.62rem] text-gray-400">{form.bio.length} characters</p>
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
              <p className="font-body text-[0.62rem] text-gray-400">Show on public site</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))}
              className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${form.visible ? 'bg-primary' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={form.visible}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.visible ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {doctor.type === 'lead' && (
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="font-heading text-xs font-semibold text-gray-700">Bookable</p>
                <p className="font-body text-[0.62rem] text-gray-400">Appears in booking flow</p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, bookable: !f.bookable }))}
                className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${form.bookable ? 'bg-primary' : 'bg-gray-200'}`}
                role="switch"
                aria-checked={form.bookable}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.bookable ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-between">
        <button className="font-heading text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
          Delete Doctor
        </button>
        <div className="flex gap-3">
          <Link href="/admin/doctors" className="rounded-xl border border-gray-200 px-5 py-2.5 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            Cancel
          </Link>
          <button onClick={handleSave} className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
