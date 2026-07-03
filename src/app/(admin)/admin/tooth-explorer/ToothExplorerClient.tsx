'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ToothChart from '@/components/tooth-explorer/ToothChart'
import MediaPicker, { type MediaPickerSelection } from '@/components/admin/MediaPicker'
import { mediaDisplayUrl } from '@/lib/admin/media-url'
import type { DoctorRow } from '@/types/db'
import type { ToothWithRelations } from './page'

type ServiceRow = { id: string; name: string; category_id: string | null }

export default function ToothExplorerClient({
  initialTeeth,
  doctors,
  services,
}: {
  initialTeeth: ToothWithRelations[]
  doctors: DoctorRow[]
  services: ServiceRow[]
}) {
  const router = useRouter()
  const [teeth, setTeeth] = useState(initialTeeth)
  useEffect(() => setTeeth(initialTeeth), [initialTeeth])
  const [selectedNumber, setSelectedNumber] = useState<number>(initialTeeth[0]?.tooth_number ?? 8)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [imagePicker, setImagePicker] = useState<'gallery' | 'before' | 'after' | null>(null)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const tooth = teeth.find((t) => t.tooth_number === selectedNumber) ?? null

  const activeToothNumbers = useMemo(
    () => new Set(teeth.filter((t) => (t.description ?? '').trim().length > 0).map((t) => t.tooth_number)),
    [teeth]
  )
  const toothNames = useMemo(() => Object.fromEntries(teeth.map((t) => [t.tooth_number, t.name])), [teeth])

  const [form, setForm] = useState(() => ({
    description: tooth?.description ?? '',
    problems: tooth?.problems ?? '',
    treatments: tooth?.treatments ?? '',
    duration_text: tooth?.duration_text ?? '',
    recovery_text: tooth?.recovery_text ?? '',
  }))

  const selectTooth = (num: number) => {
    setSelectedNumber(num)
    const t = teeth.find((x) => x.tooth_number === num)
    setForm({
      description: t?.description ?? '',
      problems: t?.problems ?? '',
      treatments: t?.treatments ?? '',
      duration_text: t?.duration_text ?? '',
      recovery_text: t?.recovery_text ?? '',
    })
  }

  const updateLocalTooth = (updater: (t: ToothWithRelations) => ToothWithRelations) => {
    setTeeth((ts) => ts.map((t) => (t.tooth_number === selectedNumber ? updater(t) : t)))
  }

  const handleSave = async () => {
    if (!tooth) return
    setSaving(true)
    const res = await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: form.description.trim() || null,
        problems: form.problems.trim() || null,
        treatments: form.treatments.trim() || null,
        duration_text: form.duration_text.trim() || null,
        recovery_text: form.recovery_text.trim() || null,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { showToast(data.error ?? 'Failed to save', false); return }
    updateLocalTooth((t) => ({ ...t, ...data }))
    showToast(`Tooth #${tooth.tooth_number} saved`, true)
    router.refresh()
  }

  const toggleActive = async () => {
    if (!tooth) return
    const res = await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !tooth.is_active }),
    })
    const data = await res.json()
    if (res.ok) { updateLocalTooth((t) => ({ ...t, ...data })); router.refresh() }
  }

  const addFaq = async () => {
    if (!tooth || !newFaq.question.trim() || !newFaq.answer.trim()) return
    const res = await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFaq),
    })
    const data = await res.json()
    if (res.ok) {
      updateLocalTooth((t) => ({ ...t, faqs: [...t.faqs, data] }))
      setNewFaq({ question: '', answer: '' })
      router.refresh()
    }
  }

  const removeFaq = async (faqId: string) => {
    const res = await fetch(`/api/admin/tooth-explorer/faqs/${faqId}`, { method: 'DELETE' })
    if (res.ok) {
      updateLocalTooth((t) => ({ ...t, faqs: t.faqs.filter((f) => f.id !== faqId) }))
      router.refresh()
    }
  }

  const handleImageSelect = async (selection: MediaPickerSelection) => {
    if (!tooth || !imagePicker) return
    const res = await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: selection.id, image_type: imagePicker }),
    })
    const data = await res.json()
    if (res.ok) {
      updateLocalTooth((t) => ({ ...t, images: [...t.images, data] }))
      showToast('Image added', true)
      router.refresh()
    }
    setImagePicker(null)
  }

  const removeImage = async (imageId: string) => {
    const res = await fetch(`/api/admin/tooth-explorer/images/${imageId}`, { method: 'DELETE' })
    if (res.ok) {
      updateLocalTooth((t) => ({ ...t, images: t.images.filter((i) => i.id !== imageId) }))
      router.refresh()
    }
  }

  const toggleDoctor = async (doctorId: string) => {
    if (!tooth) return
    const isLinked = tooth.tooth_doctors.some((d) => d.doctor_id === doctorId)
    if (isLinked) {
      await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}/doctors/${doctorId}`, { method: 'DELETE' })
      updateLocalTooth((t) => ({ ...t, tooth_doctors: t.tooth_doctors.filter((d) => d.doctor_id !== doctorId) }))
    } else {
      await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}/doctors`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doctor_id: doctorId }),
      })
      updateLocalTooth((t) => ({ ...t, tooth_doctors: [...t.tooth_doctors, { doctor_id: doctorId }] }))
    }
    router.refresh()
  }

  const toggleService = async (serviceId: string) => {
    if (!tooth) return
    const isLinked = tooth.tooth_services.some((s) => s.service_id === serviceId)
    if (isLinked) {
      await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}/services/${serviceId}`, { method: 'DELETE' })
      updateLocalTooth((t) => ({ ...t, tooth_services: t.tooth_services.filter((s) => s.service_id !== serviceId) }))
    } else {
      await fetch(`/api/admin/tooth-explorer/teeth/${tooth.id}/services`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service_id: serviceId }),
      })
      updateLocalTooth((t) => ({ ...t, tooth_services: [...t.tooth_services, { service_id: serviceId }] }))
    }
    router.refresh()
  }

  return (
    <div className="p-6 flex flex-col xl:flex-row gap-6">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Chart */}
      <div className="w-full xl:w-[420px] flex-shrink-0">
        <div className="sticky top-6 rounded-2xl border border-gray-100 p-5 shadow-sm" style={{ background: '#0E1B2E' }}>
          <p className="mb-3 font-heading text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">Click a tooth to edit</p>
          <ToothChart activeToothNumbers={activeToothNumbers} selectedToothNumber={selectedNumber} onSelectTooth={selectTooth} toothNames={toothNames} />
          <p className="mt-3 font-body text-[0.65rem] text-white/40">{activeToothNumbers.size} / 32 teeth have content configured</p>
        </div>
      </div>

      {/* Editor */}
      {tooth && (
        <div className="flex-1 min-w-0 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg text-gray-900">Tooth #{tooth.tooth_number} — {tooth.name}</h2>
                <p className="font-body text-xs text-gray-500">FDI {tooth.fdi_number} · {tooth.arch} arch · {tooth.quadrant}</p>
              </div>
              <button
                onClick={toggleActive}
                className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${tooth.is_active ? 'bg-primary' : 'bg-gray-200'}`}
                role="switch"
                aria-checked={tooth.is_active}
                title="Visible on public site"
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${tooth.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Common Problems</label>
              <textarea value={form.problems} onChange={(e) => setForm((f) => ({ ...f, problems: e.target.value }))} rows={2} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Treatments</label>
              <textarea value={form.treatments} onChange={(e) => setForm((f) => ({ ...f, treatments: e.target.value }))} rows={2} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Treatment Duration</label>
                <input value={form.duration_text} onChange={(e) => setForm((f) => ({ ...f, duration_text: e.target.value }))} placeholder="e.g. 45-60 minutes" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Recovery</label>
                <input value={form.recovery_text} onChange={(e) => setForm((f) => ({ ...f, recovery_text: e.target.value }))} placeholder="e.g. 1-2 days" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Tooth'}
              </button>
            </div>
          </div>

          {/* Doctors & services mapping */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="mb-2 font-heading text-sm font-semibold text-gray-800">Doctors who treat this tooth</h3>
              <div className="flex flex-wrap gap-2">
                {doctors.map((d) => {
                  const checked = tooth.tooth_doctors.some((td) => td.doctor_id === d.id)
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDoctor(d.id)}
                      className={`rounded-full border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-colors ${
                        checked ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {d.full_name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-heading text-sm font-semibold text-gray-800">Related services</h3>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => {
                  const checked = tooth.tooth_services.some((ts) => ts.service_id === s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`rounded-full border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-colors ${
                        checked ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-semibold text-gray-800">Images</h3>
            {(['gallery', 'before', 'after'] as const).map((type) => (
              <div key={type}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="font-body text-xs text-gray-500 capitalize">{type === 'gallery' ? 'Gallery' : `${type} treatment`}</p>
                  <button onClick={() => setImagePicker(type)} className="font-heading text-[0.62rem] font-semibold text-primary hover:underline">+ Add</button>
                </div>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {tooth.images.filter((i) => i.image_type === type).map((img) => (
                    <div key={img.id} className="group relative h-16 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      {img.media && mediaDisplayUrl(img.media) && (
                        <Image src={mediaDisplayUrl(img.media)!} alt="" fill className="object-cover" sizes="100px" />
                      )}
                      <button onClick={() => removeImage(img.id)} className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 font-heading text-[0.6rem]">
                        Remove
                      </button>
                    </div>
                  ))}
                  {tooth.images.filter((i) => i.image_type === type).length === 0 && (
                    <p className="col-span-full font-body text-[0.65rem] text-gray-400">None yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-semibold text-gray-800">FAQs</h3>
            <div className="space-y-2">
              {tooth.faqs.map((f) => (
                <div key={f.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading text-xs font-semibold text-gray-800">{f.question}</p>
                      <p className="mt-1 font-body text-xs text-gray-500">{f.answer}</p>
                    </div>
                    <button onClick={() => removeFaq(f.id)} className="flex-shrink-0 font-heading text-[0.6rem] font-semibold text-red-400 hover:text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 p-3 space-y-2">
              <input value={newFaq.question} onChange={(e) => setNewFaq((f) => ({ ...f, question: e.target.value }))} placeholder="Question" className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary" />
              <textarea value={newFaq.answer} onChange={(e) => setNewFaq((f) => ({ ...f, answer: e.target.value }))} placeholder="Answer" rows={2} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary" />
              <button onClick={addFaq} className="rounded-lg bg-primary px-4 py-1.5 font-heading text-[0.65rem] font-semibold text-white">Add FAQ</button>
            </div>
          </div>
        </div>
      )}

      <MediaPicker open={imagePicker !== null} onClose={() => setImagePicker(null)} onSelect={handleImageSelect} bucket="tooth-explorer" />
    </div>
  )
}
