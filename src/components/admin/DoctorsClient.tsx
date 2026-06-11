'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { DoctorRow } from '@/types/db'

type TabId = 'lead' | 'specialist'

const TABS: { id: TabId; label: string }[] = [
  { id: 'lead',       label: 'Lead Dentists' },
  { id: 'specialist', label: 'Specialists'   },
]

function Avatar({ doctor }: { doctor: DoctorRow }) {
  const color = doctor.color_hex ?? '#4A9B6F'
  const initials = doctor.initials ?? doctor.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white font-heading"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

function DoctorRow({
  doctor,
  onPatch,
  loadingId,
}: {
  doctor: DoctorRow
  onPatch: (id: string, updates: Record<string, unknown>) => Promise<void>
  loadingId: string | null
}) {
  const isLoading = loadingId === doctor.id

  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4 transition-colors shadow-sm ${
        doctor.is_active ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-55'
      }`}
    >
      <Avatar doctor={doctor} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-sm font-semibold text-gray-800">{doctor.full_name}</p>
          {doctor.qualification && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-heading text-[0.58rem] font-semibold text-gray-500">
              {doctor.qualification}
            </span>
          )}
          {doctor.is_bookable && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 font-heading text-[0.58rem] font-semibold text-green-600">
              Bookable
            </span>
          )}
        </div>
        <p className="mt-0.5 font-body text-xs text-gray-400 truncate">
          {doctor.title ?? '—'}{doctor.nmc_number ? ` · ${doctor.nmc_number}` : ''}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        {doctor.doctor_type === 'lead' && (
          <button
            onClick={() => onPatch(doctor.id, { is_bookable: !doctor.is_bookable })}
            disabled={isLoading}
            className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all disabled:opacity-50 ${
              doctor.is_bookable
                ? 'border-primary/20 bg-primary/8 text-primary hover:bg-primary/15'
                : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
            }`}
          >
            {doctor.is_bookable ? 'Bookable ✓' : 'Not Bookable'}
          </button>
        )}
        <button
          onClick={() => onPatch(doctor.id, { is_active: !doctor.is_active })}
          disabled={isLoading}
          className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all disabled:opacity-50 ${
            doctor.is_active
              ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
              : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
          }`}
        >
          {doctor.is_active ? 'Visible' : 'Hidden'}
        </button>
        <Link
          href={`/admin/doctors/${doctor.slug}`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-600 transition-all hover:border-primary/30 hover:text-primary"
        >
          Edit
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default function DoctorsClient({ doctors }: { doctors: DoctorRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<TabId>('lead')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePatch = async (id: string, updates: Record<string, unknown>) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Saved', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const sorted = [...doctors].sort((a, b) => a.sort_order - b.sort_order)
  const filtered = sorted.filter((d) => d.doctor_type === activeTab)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.ok ? 'bg-green-200' : 'bg-red-200'}`} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Doctors</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage doctor profiles, booking status and visibility.</p>
        </div>
        <Link
          href="/admin/doctors/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
        >
          <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add Doctor
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: sorted.length },
          { label: 'Active',   value: sorted.filter((d) => d.is_active).length },
          { label: 'Bookable', value: sorted.filter((d) => d.is_bookable).length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
        {TABS.map((tab) => {
          const count = sorted.filter((d) => d.doctor_type === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-heading text-xs font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 font-heading text-[0.55rem] font-bold ${activeTab === tab.id ? 'bg-gray-100 text-gray-500' : 'bg-gray-200/50 text-gray-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Doctor list */}
      <div className="space-y-3">
        {filtered.map((doc) => (
          <DoctorRow
            key={doc.id}
            doctor={doc}
            onPatch={handlePatch}
            loadingId={loadingId}
          />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-5 py-10 text-center">
            <p className="font-heading text-sm font-semibold text-gray-400">No {activeTab === 'lead' ? 'lead dentists' : 'specialists'} yet</p>
          </div>
        )}
      </div>

      {activeTab === 'lead' && (
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="font-body text-xs text-blue-700 leading-relaxed">
            <strong>Bookable</strong> controls whether a doctor appears in the appointment booking flow. Only lead dentists can be made bookable.
          </p>
        </div>
      )}
    </div>
  )
}
