'use client'

import { useState, useEffect, useTransition, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { DoctorAvailabilityRow, BlockedDateRow } from '@/types/db'

export const dynamic = 'force-dynamic'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type AvailabilityDraft = {
  day_of_week: number
  is_available: boolean
  start_time: string
  end_time: string
  slot_duration_minutes: number
  max_appointments_per_day: string
}

function defaultDays(): AvailabilityDraft[] {
  return Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    is_available: i !== 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
    max_appointments_per_day: '',
  }))
}

export default function DoctorAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [days, setDays] = useState<AvailabilityDraft[]>(defaultDays())
  const [blockedDates, setBlockedDates] = useState<BlockedDateRow[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(true)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [addingDate, setAddingDate] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/doctors/${id}/availability`).then((r) => r.json()),
      fetch(`/api/admin/doctors/${id}/blocked-dates`).then((r) => r.json()),
    ])
      .then(([avail, blocked]: [DoctorAvailabilityRow[], BlockedDateRow[]]) => {
        if (Array.isArray(avail) && avail.length > 0) {
          setDays((prev) =>
            prev.map((d) => {
              const row = avail.find((a) => a.day_of_week === d.day_of_week)
              if (!row) return d
              return {
                day_of_week: row.day_of_week,
                is_available: row.is_available,
                start_time: row.start_time ?? '09:00',
                end_time: row.end_time ?? '17:00',
                slot_duration_minutes: row.slot_duration_minutes ?? 30,
                max_appointments_per_day: row.max_appointments_per_day != null ? String(row.max_appointments_per_day) : '',
              }
            })
          )
        }
        if (Array.isArray(blocked)) setBlockedDates(blocked)
      })
      .catch(() => showToast('Failed to load availability', false))
      .finally(() => setLoadingSchedule(false))
  }, [id])

  const updateDay = (index: number, key: keyof AvailabilityDraft, value: unknown) => {
    setDays((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  const saveSchedule = async () => {
    setSavingSchedule(true)
    try {
      const rows = days.map((d) => ({
        day_of_week: d.day_of_week,
        is_available: d.is_available,
        start_time: d.start_time || null,
        end_time: d.end_time || null,
        slot_duration_minutes: d.slot_duration_minutes,
        max_appointments_per_day: d.max_appointments_per_day ? parseInt(d.max_appointments_per_day, 10) : null,
      }))
      const res = await fetch(`/api/admin/doctors/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Schedule saved', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setSavingSchedule(false)
    }
  }

  const addBlockedDate = async () => {
    if (!newDate) { showToast('Please select a date', false); return }
    setAddingDate(true)
    try {
      const res = await fetch(`/api/admin/doctors/${id}/blocked-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_date: newDate, reason: newReason.trim() || null }),
      })
      const data = await res.json() as BlockedDateRow & { error?: string }
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed')
      setBlockedDates((prev) => [...prev, data].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date)))
      setNewDate('')
      setNewReason('')
      showToast('Date blocked', true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setAddingDate(false)
    }
  }

  const removeBlockedDate = async (date: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${id}/blocked-dates?date=${date}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setBlockedDates((prev) => prev.filter((b) => b.blocked_date !== date))
      showToast('Date unblocked', true)
    } catch {
      showToast('Failed to remove date', false)
    }
  }

  if (loadingSchedule) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
        ))}
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

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/doctors" className="font-body text-xs text-gray-600 hover:text-primary transition-colors">
              Doctors
            </Link>
            <span className="font-body text-xs text-gray-300">/</span>
            <span className="font-body text-xs text-gray-600">Availability</span>
          </div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Doctor Availability</h2>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-5">
        <h3 className="font-heading text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">Weekly Schedule</h3>
        <div className="space-y-3">
          {days.map((day, i) => (
            <div key={day.day_of_week} className={`rounded-xl border p-4 ${day.is_available ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                  <button
                    onClick={() => updateDay(i, 'is_available', !day.is_available)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${day.is_available ? 'bg-primary' : 'bg-gray-200'}`}
                    role="switch"
                    aria-checked={day.is_available}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${day.is_available ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className={`font-heading text-xs font-semibold ${day.is_available ? 'text-gray-700' : 'text-gray-600'}`}>
                    {DAY_NAMES[day.day_of_week]}
                  </span>
                </div>
                {day.is_available && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <label className="font-heading text-[0.6rem] font-semibold text-gray-600">From</label>
                      <input
                        type="time"
                        value={day.start_time}
                        onChange={(e) => updateDay(i, 'start_time', e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-700 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-heading text-[0.6rem] font-semibold text-gray-600">To</label>
                      <input
                        type="time"
                        value={day.end_time}
                        onChange={(e) => updateDay(i, 'end_time', e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-700 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-heading text-[0.6rem] font-semibold text-gray-600">Slot (min)</label>
                      <input
                        type="number"
                        min={15}
                        max={120}
                        step={15}
                        value={day.slot_duration_minutes}
                        onChange={(e) => updateDay(i, 'slot_duration_minutes', parseInt(e.target.value, 10))}
                        className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-700 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-heading text-[0.6rem] font-semibold text-gray-600">Max/day</label>
                      <input
                        type="number"
                        min={1}
                        value={day.max_appointments_per_day}
                        onChange={(e) => updateDay(i, 'max_appointments_per_day', e.target.value)}
                        placeholder="—"
                        className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 font-body text-xs text-gray-700 outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={saveSchedule}
            disabled={savingSchedule}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {savingSchedule ? 'Saving…' : 'Save Schedule'}
          </button>
        </div>
      </div>

      {/* Blocked Dates */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="font-heading text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">Blocked Dates</h3>
        <div className="flex items-end gap-3 flex-wrap mb-5">
          <div>
            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Reason (optional)</label>
            <input
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g. Conference, Leave"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button
            onClick={addBlockedDate}
            disabled={addingDate}
            className="rounded-xl bg-primary px-5 py-2.5 font-heading text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {addingDate ? 'Adding…' : 'Block Date'}
          </button>
        </div>

        {blockedDates.length > 0 ? (
          <div className="space-y-2">
            {blockedDates.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                <div>
                  <p className="font-heading text-sm font-semibold text-gray-700">
                    {new Date(b.blocked_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {b.reason && <p className="font-body text-xs text-gray-600">{b.reason}</p>}
                </div>
                <button
                  onClick={() => removeBlockedDate(b.blocked_date)}
                  className="rounded-lg border border-red-100 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-red-400 hover:bg-red-50"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body text-xs text-gray-600">No upcoming blocked dates.</p>
        )}
      </div>
    </div>
  )
}
