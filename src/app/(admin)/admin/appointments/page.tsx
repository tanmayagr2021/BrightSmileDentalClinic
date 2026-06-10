'use client'

import { useState } from 'react'
import { DOCTORS_STATIC, OPENING_HOURS } from '@/lib/constants'

export default function AppointmentsCmsPage() {
  const [bookableMap, setBookableMap] = useState<Record<string, boolean>>(
    DOCTORS_STATIC.reduce<Record<string, boolean>>((acc, d) => { acc[d.slug] = d.bookable; return acc }, {})
  )
  const [bufferMinutes, setBufferMinutes] = useState('30')
  const [maxAdvanceDays, setMaxAdvanceDays] = useState('30')
  const [confirmMethod, setConfirmMethod] = useState<'email' | 'whatsapp' | 'phone'>('whatsapp')
  const [saved, setSaved] = useState(false)

  const leadDoctors = DOCTORS_STATIC.filter((d) => d.type === 'lead')

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Appointment Settings</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Configure the public booking flow — bookable doctors, slots, and confirmation.</p>
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
          className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Save Settings
        </button>
      </div>

      {/* Phase note */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-heading text-xs font-semibold text-amber-800">Booking Backend — Phase H</p>
            <p className="mt-0.5 font-body text-xs text-amber-700">Settings configured here will activate when the Supabase appointment backend is implemented. The current public booking flow is UI-only.</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="font-heading text-xs font-semibold text-green-700">Settings saved locally · Will activate after Phase H backend</p>
        </div>
      )}

      {/* Bookable doctors */}
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-gray-800 mb-1">Bookable Doctors</h3>
        <p className="font-body text-xs text-gray-400 mb-4">Select which lead dentists appear in the public booking flow.</p>
        <div className="space-y-3">
          {leadDoctors.map((doc) => (
            <div key={doc.slug} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white font-heading flex-shrink-0"
                  style={{ backgroundColor: doc.color }}
                >
                  {doc.initials}
                </div>
                <div>
                  <p className="font-heading text-xs font-semibold text-gray-800">{doc.name}</p>
                  <p className="font-body text-[0.62rem] text-gray-400">{doc.role}</p>
                </div>
              </div>
              <button
                onClick={() => setBookableMap((prev) => ({ ...prev, [doc.slug]: !prev[doc.slug] }))}
                className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${bookableMap[doc.slug] ? 'bg-primary' : 'bg-gray-200'}`}
                role="switch"
                aria-checked={bookableMap[doc.slug]}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${bookableMap[doc.slug] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 font-body text-[0.62rem] text-gray-400">
          {Object.values(bookableMap).filter(Boolean).length} doctor{Object.values(bookableMap).filter(Boolean).length !== 1 ? 's' : ''} bookable. Specialists are referral-only and never appear in booking.
        </p>
      </div>

      {/* Slot configuration */}
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-gray-800 mb-1">Slot Configuration</h3>
        <p className="font-body text-xs text-gray-400 mb-4">Set appointment duration, buffer time, and booking window.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Buffer Time (minutes)</label>
            <select
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
          <div>
            <label className="block font-heading text-xs font-semibold text-gray-700 mb-1.5">Max Advance Booking</label>
            <select
              value={maxAdvanceDays}
              onChange={(e) => setMaxAdvanceDays(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-body text-sm text-gray-900 outline-none focus:border-primary"
            >
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Confirmation method */}
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-gray-800 mb-1">Confirmation Method</h3>
        <p className="font-body text-xs text-gray-400 mb-4">How the clinic confirms appointments with patients after booking.</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: 'whatsapp', label: 'WhatsApp', desc: 'Message via WhatsApp Business' },
            { id: 'email', label: 'Email', desc: 'Automated email confirmation' },
            { id: 'phone', label: 'Phone Call', desc: 'Manual call from reception' },
          ] as const).map((method) => (
            <button
              key={method.id}
              onClick={() => setConfirmMethod(method.id)}
              className={`rounded-xl border p-4 text-left transition-all ${confirmMethod === method.id ? 'border-primary/30 bg-tint' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
            >
              <p className={`font-heading text-xs font-semibold ${confirmMethod === method.id ? 'text-primary' : 'text-gray-700'}`}>{method.label}</p>
              <p className="mt-0.5 font-body text-[0.62rem] text-gray-400">{method.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Opening hours */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-gray-800 mb-1">Opening Hours</h3>
        <p className="font-body text-xs text-gray-400 mb-4">Used to generate available time slots. Edit via <span className="font-semibold text-gray-600">Settings → Website</span>.</p>
        <div className="space-y-2">
          {OPENING_HOURS.map((h) => (
            <div key={h.days} className="flex items-center justify-between font-body text-xs">
              <span className="text-gray-500">{h.days}</span>
              <span className={!h.open ? 'text-red-400 font-heading font-semibold text-[0.65rem]' : 'text-gray-700 font-heading font-semibold text-[0.65rem]'}>
                {!h.open ? 'Closed' : h.hours}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
