'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import ToothChart from '@/components/tooth-explorer/ToothChart'
import type { ToothWithRelations } from './page'

export default function ToothExplorerClient({
  initialTeeth,
}: {
  initialTeeth: ToothWithRelations[]
}) {
  const router = useRouter()
  const [teeth, setTeeth] = useState(initialTeeth)
  useEffect(() => setTeeth(initialTeeth), [initialTeeth])
  const [selectedNumber, setSelectedNumber] = useState<number>(initialTeeth[0]?.tooth_number ?? 8)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)

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
  }))

  const selectTooth = (num: number) => {
    setSelectedNumber(num)
    const t = teeth.find((x) => x.tooth_number === num)
    setForm({
      description: t?.description ?? '',
      problems: t?.problems ?? '',
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

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Tooth'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
