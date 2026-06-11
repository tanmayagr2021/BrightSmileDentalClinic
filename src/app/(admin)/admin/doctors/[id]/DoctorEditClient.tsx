'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { DoctorRow } from '@/types/db'

export default function DoctorEditClient({ doctor }: { doctor: DoctorRow }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(doctor.profile_image_url ?? null)
  const photoRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadingPhoto(true)
    const fd = new FormData()
    fd.append('file', files[0])
    fd.append('bucket', 'doctor-photos')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (!res.ok) { showToast('Upload failed', false); setUploadingPhoto(false); return }
    const { url } = await res.json()
    setPhotoUrl(url)
    // Immediately save the new photo URL
    await fetch(`/api/admin/doctors/${doctor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_image_url: url }),
    })
    setUploadingPhoto(false)
    showToast('Photo updated', true)
    startTransition(() => router.refresh())
    if (photoRef.current) photoRef.current.value = ''
  }

  const [form, setForm] = useState({
    full_name:       doctor.full_name,
    title:           doctor.title ?? '',
    qualification:   doctor.qualification ?? '',
    nmc_number:      doctor.nmc_number ?? '',
    experience_text: doctor.experience_text ?? '',
    education:       doctor.education ?? '',
    short_bio:       doctor.short_bio ?? '',
    full_bio:        doctor.full_bio ?? '',
    specializations: (doctor.specializations ?? []).join(', '),
    languages:       (doctor.languages ?? []).join(', '),
    doctor_type:     doctor.doctor_type,
    is_active:       doctor.is_active,
    is_bookable:     doctor.is_bookable,
  })

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: 'PATCH',
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
          doctor_type:         form.doctor_type,
          is_active:           form.is_active,
          is_bookable:         form.is_bookable,
          profile_image_url:   photoUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      showToast('Changes saved', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error saving', false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete Dr. ${doctor.full_name}? This will hide them from the website but preserve appointment history.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      router.push('/admin/doctors')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
      setDeleting(false)
    }
  }

  const color = doctor.color_hex ?? '#4A9B6F'
  const initials = doctor.initials ?? doctor.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-heading text-xs text-gray-400">
        <Link href="/admin/doctors" className="hover:text-primary transition-colors">Doctors</Link>
        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-gray-600">{doctor.full_name}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        {/* Avatar / photo upload */}
        <div className="relative flex-shrink-0">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden text-xl font-bold text-white font-heading"
            style={{ backgroundColor: color }}
          >
            {photoUrl ? (
              <Image src={photoUrl} alt={doctor.full_name} fill className="object-cover" sizes="64px" />
            ) : initials}
          </div>
          <button
            onClick={() => photoRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow border border-gray-200 text-gray-500 hover:text-primary transition-colors"
            title="Upload profile photo"
          >
            {uploadingPhoto
              ? <span className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
              : <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3"><path d="M6 1v8M2 5l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
            }
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e.target.files)} />
        </div>
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">{doctor.full_name}</h2>
          <p className="font-body text-sm text-gray-500">{doctor.title ?? 'No title set'}</p>
          <button onClick={() => photoRef.current?.click()} className="mt-1 font-heading text-[0.62rem] font-semibold text-primary hover:underline">
            {photoUrl ? 'Change photo' : 'Upload profile photo'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm space-y-6">

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input type="text" value={form.full_name} onChange={update('full_name')} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
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
          <textarea value={form.full_bio} onChange={update('full_bio')} rows={4} placeholder="Detailed biography for the public profile page..." className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          <p className="mt-1 font-body text-[0.62rem] text-gray-400">{form.full_bio.length} characters</p>
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Specializations</label>
          <input type="text" value={form.specializations} onChange={update('specializations')} placeholder="Comma-separated, e.g. General Dentistry, Root Canal" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
        </div>

        <div>
          <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Languages</label>
          <input type="text" value={form.languages} onChange={update('languages')} placeholder="Comma-separated, e.g. Nepali, Hindi, English" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
        </div>

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

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="font-heading text-xs font-semibold text-gray-700">Visible</p>
              <p className="font-body text-[0.62rem] text-gray-400">Show on public site</p>
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
                <p className="font-body text-[0.62rem] text-gray-400">Appears in booking flow</p>
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
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="font-heading text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete Doctor'}
        </button>
        <div className="flex gap-3">
          <Link href="/admin/doctors" className="rounded-xl border border-gray-200 px-5 py-2.5 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-gray-300">
            Cancel
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
    </div>
  )
}
