'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Appointment = {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  status: string
  notes: string | null
  is_new_patient: boolean
  created_at: string
}

type Tab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function doctorName(notes: string | null): string {
  if (!notes) return '—'
  const match = notes.match(/^Doctor: (.+?)(?:\n|$)/)
  return match ? match[1] : '—'
}

function patientNote(notes: string | null): string {
  if (!notes) return ''
  return notes.replace(/^Doctor: .+?\n\n?/, '').trim()
}

const STATUS: Record<string, { label: string; bg: string; text: string }> = {
  pending:     { label: 'Pending',     bg: 'bg-amber-100',  text: 'text-amber-700' },
  confirmed:   { label: 'Confirmed',   bg: 'bg-blue-100',   text: 'text-blue-700'  },
  completed:   { label: 'Completed',   bg: 'bg-green-100',  text: 'text-green-700' },
  cancelled:   { label: 'Cancelled',   bg: 'bg-gray-100',   text: 'text-gray-500'  },
  no_show:     { label: 'No Show',     bg: 'bg-red-100',    text: 'text-red-600'   },
  rescheduled: { label: 'Rescheduled', bg: 'bg-purple-100', text: 'text-purple-700'},
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const counts: Record<Tab, number> = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      showToast(`Appointment marked as ${status}.`, true)
      startTransition(() => router.refresh())
    } catch {
      showToast('Something went wrong. Please try again.', false)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-xl text-gray-900 tracking-tight">Appointments</h2>
        <p className="mt-1 font-body text-sm text-gray-500">
          Review and confirm patient booking requests.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg font-heading text-sm font-semibold text-white transition-all ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Pending alert */}
      {counts.pending > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-500 animate-pulse" />
          <p className="font-heading text-xs font-semibold text-amber-800">
            {counts.pending} pending appointment{counts.pending !== 1 ? 's' : ''} — call patient to confirm
          </p>
          <button
            onClick={() => setActiveTab('pending')}
            className="ml-auto font-heading text-xs font-semibold text-amber-700 underline underline-offset-2"
          >
            View
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-heading text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold leading-none ${
                tab.key === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : activeTab === tab.key
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <p className="font-heading text-sm font-semibold text-gray-600">No appointments</p>
          <p className="mt-1 font-body text-xs text-gray-300">
            {activeTab === 'all'
              ? 'No appointments have been booked yet.'
              : `No ${activeTab} appointments.`}
          </p>
        </div>
      )}

      {/* Appointment cards */}
      <div className="space-y-3">
        {filtered.map(appt => {
          const s = STATUS[appt.status] ?? { label: appt.status, bg: 'bg-gray-100', text: 'text-gray-500' }
          const doctor = doctorName(appt.notes)
          const note = patientNote(appt.notes)
          const loading = loadingId === appt.id
          const dateObj = new Date(appt.appointment_date + 'T00:00:00')

          return (
            <div
              key={appt.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-opacity ${
                loading ? 'opacity-60 pointer-events-none' : ''
              } ${appt.status === 'pending' ? 'border-amber-200' : 'border-gray-100'}`}
            >
              <div className="flex flex-wrap items-start gap-4">

                {/* Date block */}
                <div className="flex-shrink-0 w-16 rounded-xl border border-gray-100 bg-gray-50 px-2 py-3 text-center">
                  <p className="font-display text-2xl leading-none text-gray-900">
                    {dateObj.getDate()}
                  </p>
                  <p className="mt-0.5 font-body text-[0.62rem] text-gray-600">
                    {dateObj.toLocaleDateString('en-GB', { month: 'short' })}
                  </p>
                  <p className="mt-1.5 font-heading text-[0.65rem] font-bold text-primary">
                    {formatTime(appt.appointment_time)}
                  </p>
                </div>

                {/* Patient info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-heading text-sm font-semibold text-gray-900">
                      {appt.patient_name}
                    </p>
                    {appt.is_new_patient && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 font-heading text-[0.58rem] font-bold text-blue-600 uppercase tracking-wide">
                        New
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 font-heading text-[0.6rem] font-bold ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-1.5">
                    <a href={`tel:${appt.patient_phone}`} className="font-heading text-xs font-semibold text-primary hover:underline">
                      {appt.patient_phone}
                    </a>
                    <a href={`mailto:${appt.patient_email}`} className="font-body text-xs text-gray-600 hover:underline truncate">
                      {appt.patient_email}
                    </a>
                  </div>

                  <p className="font-body text-xs text-gray-600">
                    <span className="font-semibold">{doctor}</span>
                    {note && <span className="text-gray-600"> · {note}</span>}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
                  {appt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(appt.id, 'confirmed')}
                        className="rounded-xl bg-primary px-4 py-2 font-heading text-xs font-semibold text-white transition hover:bg-primary-dark"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(appt.id, 'cancelled')}
                        className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:text-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appt.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => updateStatus(appt.id, 'completed')}
                        className="rounded-xl bg-green-600 px-4 py-2 font-heading text-xs font-semibold text-white transition hover:bg-green-700"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateStatus(appt.id, 'cancelled')}
                        className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:text-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {['completed', 'cancelled', 'no_show'].includes(appt.status) && (
                    <span className="self-center font-body text-xs text-gray-300">Done</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
