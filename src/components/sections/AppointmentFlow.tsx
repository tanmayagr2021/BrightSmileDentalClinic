'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { CLINIC_CONTACT, OPENING_HOURS } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'
import type { DoctorRow } from '@/types/db'

type BookableDoctor = {
  slug: string
  color: string
  initials: string
  name: string
  shortName: string
  role: string
  specializations: string[]
  nmc: string
  experience: string
}

function adaptDoctor(d: DoctorRow): BookableDoctor {
  return {
    slug: d.slug,
    color: d.color_hex ?? '#4A9B6F',
    initials: d.initials ?? d.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2),
    name: d.full_name,
    shortName: d.short_name ?? d.full_name,
    role: d.title ?? '',
    specializations: d.specializations ?? [],
    nmc: d.nmc_number ?? '',
    experience: d.experience_text ?? '',
  }
}

// Steps
type Step = 'doctor' | 'date' | 'time' | 'details' | 'confirm' | 'success'
const STEPS: Step[] = ['doctor', 'date', 'time', 'details', 'confirm']
const STEP_LABELS = ['Doctor', 'Date', 'Time', 'Details', 'Confirm']

// Pre-mark some slots as unavailable for realism
const UNAVAILABLE_SLOTS = new Set(['10:00 AM', '11:00 AM', '2:30 PM'])

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Offset so week starts Monday (0=Mon…6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7
  const days: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

function getTimeSlots(date: Date): string[] {
  const isSaturday = date.getDay() === 6
  const endHour = isSaturday ? 13 : 18
  const slots: string[] = []
  for (let h = 9; h < endHour; h++) {
    for (const m of [0, 30]) {
      if (h === endHour - 1 && m === 30) continue
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h >= 12 ? 'PM' : 'AM'
      slots.push(`${h12}:${m === 0 ? '00' : '30'} ${ampm}`)
    }
  }
  return slots
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Step components ─────────────────────────────────────────

function StepDoctor({ selected, onSelect, doctors }: { selected: string | null; onSelect: (slug: string) => void; doctors: BookableDoctor[] }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-dark tracking-display mb-2">Select Your Dentist</h2>
      <p className="font-body text-sm text-gray-500 mb-8">Choose from our lead dentists. Appointments are available with both.</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {doctors.map((doc) => (
          <button
            key={doc.slug}
            onClick={() => onSelect(doc.slug)}
            className={`group text-left rounded-2xl border-2 p-6 transition-all duration-200 ${
              selected === doc.slug
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm'
            }`}
          >
            {/* Avatar banner */}
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: doc.color }}
            >
              <span className="font-display text-2xl font-bold text-white">{doc.initials}</span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading text-base font-semibold text-dark">{doc.name}</h3>
                <p className="font-body text-sm text-gray-500 mt-0.5">{doc.role}</p>
              </div>
              {selected === doc.slug && (
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {doc.specializations.slice(0, 3).map((s) => (
                <span key={s} className="rounded-lg bg-tint px-2 py-0.5 font-heading text-[0.65rem] font-semibold text-dark/70">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0 text-teal" aria-hidden="true">
                <path d="M8 1L2 3.5v5c0 3.5 2.7 6.7 6 7.5 3.3-.8 6-4 6-7.5v-5L8 1z" fill="#0C3C2D" fillOpacity="0.12" stroke="#0C3C2D" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M5.5 8l2 2 3.5-3.5" stroke="#0C3C2D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-heading text-[0.62rem] font-semibold text-teal">{doc.nmc} · {doc.experience}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepDate({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const days = getCalendarDays(viewYear, viewMonth)

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }, [viewMonth])

  const isPast = (d: Date) => {
    const t = new Date(today); t.setHours(0, 0, 0, 0)
    const cd = new Date(d); cd.setHours(0, 0, 0, 0)
    return cd <= t
  }

  const isSelected = (d: Date) =>
    selected
      ? d.getFullYear() === selected.getFullYear() && d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate()
      : false

  return (
    <div>
      <h2 className="font-display text-2xl text-dark tracking-display mb-2">Select a Date</h2>
      <p className="font-body text-sm text-gray-500 mb-8">
        We&apos;re open Sunday–Friday 9am–6pm and Saturday 9am–1pm.
      </p>

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        {/* Calendar header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-dark transition-colors"
            aria-label="Previous month"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="font-heading text-sm font-semibold text-dark">
            {MONTHS[viewMonth]} {viewYear}
          </p>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-dark transition-colors"
            aria-label="Next month"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-50 px-4 py-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center font-heading text-[0.62rem] font-semibold uppercase tracking-wide text-gray-600">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1 p-4">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const past = isPast(day)
            const sel = isSelected(day)
            return (
              <button
                key={day.toISOString()}
                onClick={() => !past && onSelect(day)}
                disabled={past}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl font-heading text-sm transition-all ${
                  sel
                    ? 'bg-primary text-white font-semibold'
                    : past
                    ? 'text-gray-200 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-tint hover:text-primary'
                }`}
                aria-label={formatDate(day)}
                aria-pressed={sel}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <p className="mt-3 font-body text-xs text-primary font-medium">
          Selected: {formatDate(selected)}
        </p>
      )}
    </div>
  )
}

function StepTime({ date, selected, onSelect }: { date: Date; selected: string | null; onSelect: (t: string) => void }) {
  const slots = getTimeSlots(date)

  return (
    <div>
      <h2 className="font-display text-2xl text-dark tracking-display mb-2">Select a Time</h2>
      <p className="font-body text-sm text-gray-500 mb-8">
        Available slots for <span className="font-medium text-dark">{formatDateShort(date)}</span>
      </p>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {slots.map((slot) => {
          const unavailable = UNAVAILABLE_SLOTS.has(slot)
          const sel = selected === slot
          return (
            <button
              key={slot}
              onClick={() => !unavailable && onSelect(slot)}
              disabled={unavailable}
              className={`rounded-xl border px-3 py-3 font-heading text-xs font-semibold transition-all ${
                sel
                  ? 'border-primary bg-primary text-white'
                  : unavailable
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through decoration-gray-300'
                  : 'border-gray-200 text-dark hover:border-primary hover:text-primary hover:bg-primary/5'
              }`}
            >
              {slot}
              {unavailable && <span className="block text-[0.5rem] font-normal text-gray-300 no-underline">Booked</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type FormData = { name: string; phone: string; email: string; notes: string }

function StepDetails({ form, onChange }: { form: FormData; onChange: (f: FormData) => void }) {
  const update = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [key]: e.target.value })

  return (
    <div>
      <h2 className="font-display text-2xl text-dark tracking-display mb-2">Your Details</h2>
      <p className="font-body text-sm text-gray-500 mb-8">We&apos;ll use this to confirm your appointment by phone.</p>

      <div className="space-y-5">
        <div>
          <label htmlFor="apt-name" className="block font-heading text-xs font-semibold text-dark mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="apt-name"
            type="text"
            value={form.name}
            onChange={update('name')}
            placeholder="e.g. Priya Sharma"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            required
          />
        </div>
        <div>
          <label htmlFor="apt-phone" className="block font-heading text-xs font-semibold text-dark mb-1.5">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            id="apt-phone"
            type="tel"
            value={form.phone}
            onChange={update('phone')}
            placeholder="e.g. 9801234567"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            required
          />
        </div>
        <div>
          <label htmlFor="apt-email" className="block font-heading text-xs font-semibold text-dark mb-1.5">
            Email Address <span className="text-gray-600 font-normal">(optional)</span>
          </label>
          <input
            id="apt-email"
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="e.g. priya@example.com"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div>
          <label htmlFor="apt-notes" className="block font-heading text-xs font-semibold text-dark mb-1.5">
            Reason for Visit <span className="text-gray-600 font-normal">(optional)</span>
          </label>
          <textarea
            id="apt-notes"
            value={form.notes}
            onChange={update('notes')}
            placeholder="e.g. Toothache, routine check-up, whitening consultation..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 font-body text-sm text-dark placeholder-gray-300 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <p className="mt-4 font-body text-xs text-gray-600">
        Your information is kept private and used solely to confirm your appointment.
      </p>
    </div>
  )
}

function StepConfirm({
  doctor,
  date,
  time,
  form,
}: {
  doctor: BookableDoctor
  date: Date
  time: string
  form: FormData
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-dark tracking-display mb-2">Review Your Request</h2>
      <p className="font-body text-sm text-gray-500 mb-8">
        Please review your details before submitting. We&apos;ll call you to confirm.
      </p>

      <div className="space-y-3 rounded-2xl border border-gray-100 bg-tint p-6">
        <Row label="Dentist" value={doctor.name} />
        <Row label="Date" value={formatDate(date)} />
        <Row label="Time" value={time} />
        <div className="border-t border-gray-200 my-2" />
        <Row label="Name" value={form.name} />
        <Row label="Phone" value={form.phone} />
        {form.email && <Row label="Email" value={form.email} />}
        {form.notes && <Row label="Notes" value={form.notes} />}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="font-body text-xs text-amber-700 leading-relaxed">
          This is a <strong>request</strong>, not a confirmed booking. Our team will call you on{' '}
          <strong>{form.phone}</strong> within 2 hours during opening hours to confirm your slot.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-20 flex-shrink-0 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</span>
      <span className="font-body text-sm text-dark">{value}</span>
    </div>
  )
}

function StepSuccess({ doctor, date, time, name, phone }: { doctor: BookableDoctor; date: Date; time: string; name: string; phone: string }) {
  return (
    <div className="py-6 text-center">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
      >
        <motion.svg
          viewBox="0 0 40 40"
          fill="none"
          className="h-10 w-10 text-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.path
            d="M8 20l8 8 16-16"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </motion.svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="font-display text-3xl text-dark tracking-display">Request Received!</h2>
        <p className="mt-3 font-body text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
          Thank you, <strong className="text-dark">{name}</strong>. Your request for <strong className="text-dark">{time}</strong> on{' '}
          <strong className="text-dark">{formatDateShort(date)}</strong> with <strong className="text-dark">{doctor.shortName}</strong> has been received.
        </p>

        <div className="mt-7 rounded-2xl border border-gray-100 bg-tint p-5 text-left max-w-sm mx-auto">
          <p className="font-heading text-xs font-semibold text-dark mb-3">What happens next?</p>
          <ol className="space-y-2">
            {[
              'Our team will call you within 2 hours (during opening hours)',
              'We\'ll confirm your exact time slot and any prep instructions',
              'See you at Nagpokhari, Naxal, Kathmandu!',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-[0.6rem] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="font-body text-xs text-gray-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-dark transition-all hover:border-primary hover:text-primary"
          >
            Back to Home
          </Link>
          <Link
            href="/services"
            className="rounded-xl bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Explore Our Services
          </Link>
        </div>

        <p className="mt-8 font-body text-xs text-gray-600">
          Need to speak to us directly?{' '}
          <a href={`tel:${phone}`} className="text-primary hover:underline">
            {phone}
          </a>
        </p>
      </motion.div>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="Booking progress">
      <div className="flex items-center gap-1.5 mb-3">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-400 ${
              i <= currentStep ? 'bg-primary' : 'bg-gray-100'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`font-heading text-[0.62rem] font-semibold transition-colors ${
              i === currentStep ? 'text-primary' : i < currentStep ? 'text-gray-600' : 'text-gray-500'
            }`}
          >
            {STEP_LABELS[i]}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────

export default function AppointmentFlow({
  doctors: doctorRows,
  phone,
  phoneWhatsApp,
  address,
  openingHours,
}: {
  doctors: DoctorRow[]
  phone?: string
  phoneWhatsApp?: string
  address?: string
  openingHours?: { days: string; hours: string; open: boolean }[]
}) {
  const displayPhone = phone ?? CLINIC_CONTACT.phone
  const displayPhoneWhatsApp = phoneWhatsApp ?? CLINIC_CONTACT.phoneWhatsApp
  const displayAddress = address ?? CLINIC_CONTACT.addressFull
  const displayHours = (openingHours && openingHours.length > 0) ? openingHours : [...OPENING_HOURS]
  const bookableDoctors = doctorRows.filter((d) => d.is_bookable && d.is_active).map(adaptDoctor)

  const [step, setStep] = useState<Step>('doctor')
  const [selectedDoctorSlug, setSelectedDoctorSlug] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const startedTracked = useRef(false)

  const stepIndex = STEPS.indexOf(step)
  const selectedDoctor = bookableDoctors.find((d) => d.slug === selectedDoctorSlug) ?? bookableDoctors[0]

  const canProceed = (() => {
    if (step === 'doctor') return !!selectedDoctorSlug
    if (step === 'date') return !!selectedDate
    if (step === 'time') return !!selectedTime
    if (step === 'details') return !!form.name.trim() && !!form.phone.trim()
    if (step === 'confirm') return true
    return false
  })()

  const submitAppointment = async () => {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: form.name,
          patientEmail: form.email || 'no-email@placeholder.com',
          patientPhone: form.phone,
          doctorName: selectedDoctor.name,
          doctorSlug: selectedDoctor.slug,
          appointmentDate: dateStr,
          appointmentTime: selectedTime,
          notes: form.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong. Please call us directly.')
      } else {
        trackEvent('Appointment Completed', { doctor: selectedDoctor.slug })
        setStep('success')
      }
    } catch {
      setSubmitError('Network error. Please check your connection or call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const goNext = () => {
    if (step === 'doctor' && canProceed) setStep('date')
    else if (step === 'date' && canProceed) setStep('time')
    else if (step === 'time' && canProceed) setStep('details')
    else if (step === 'details' && canProceed) setStep('confirm')
    // 'confirm' step uses submitAppointment directly
  }

  const goBack = () => {
    if (step === 'date') setStep('doctor')
    else if (step === 'time') setStep('date')
    else if (step === 'details') setStep('time')
    else if (step === 'confirm') { setStep('details'); setSubmitError('') }
  }

  const isSuccess = step === 'success'

  return (
    <div>
      {/* Sidebar: opening hours */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className={`grid grid-cols-1 gap-10 ${!isSuccess ? 'lg:grid-cols-[1fr_320px]' : ''}`}>

          {/* Main flow */}
          <div className="rounded-2xl border border-gray-100 bg-white p-7 sm:p-10 shadow-sm">
            {!isSuccess && <ProgressBar currentStep={stepIndex} />}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 'doctor' && (
                  <StepDoctor
                    selected={selectedDoctorSlug}
                    onSelect={(s) => {
                      if (!startedTracked.current) { startedTracked.current = true; trackEvent('Appointment Started') }
                      setSelectedDoctorSlug(s)
                      setSelectedTime(null)
                    }}
                    doctors={bookableDoctors}
                  />
                )}
                {step === 'date' && (
                  <StepDate selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setSelectedTime(null) }} />
                )}
                {step === 'time' && selectedDate && (
                  <StepTime date={selectedDate} selected={selectedTime} onSelect={setSelectedTime} />
                )}
                {step === 'details' && (
                  <StepDetails form={form} onChange={setForm} />
                )}
                {step === 'confirm' && selectedDate && selectedTime && (
                  <StepConfirm doctor={selectedDoctor} date={selectedDate} time={selectedTime} form={form} />
                )}
                {step === 'success' && selectedDate && selectedTime && (
                  <StepSuccess doctor={selectedDoctor} date={selectedDate} time={selectedTime} name={form.name} phone={displayPhone} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {!isSuccess && (
              <div className="mt-10 flex items-center justify-between border-t border-gray-50 pt-7">
                {stepIndex > 0 ? (
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 font-heading text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:text-dark"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={step === 'confirm' ? submitAppointment : goNext}
                  disabled={!canProceed || submitting}
                  className={`flex items-center gap-2 rounded-xl px-7 py-2.5 font-heading text-sm font-semibold transition-all ${
                    canProceed && !submitting
                      ? 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {step === 'confirm' && submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Booking...
                    </>
                  ) : step === 'confirm' ? 'Confirm Request' : 'Continue'}
                  {!(step === 'confirm' && submitting) && (
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            )}
            {submitError && (
              <p role="alert" className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 font-body text-xs text-red-700">{submitError}</p>
            )}
          </div>

          {/* Sidebar */}
          {!isSuccess && (
            <div className="space-y-5">
              {/* Opening hours */}
              <div className="rounded-2xl border border-gray-100 bg-tint p-6">
                <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">Opening Hours</h3>
                <div className="space-y-2.5">
                  {displayHours.map((h) => (
                    <div key={h.days} className="flex justify-between">
                      <span className="font-body text-sm text-gray-600">{h.days}</span>
                      <span className="font-heading text-sm font-semibold text-dark">
                        {('open' in h && !h.open) ? 'Closed' : h.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct contact */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">Prefer to Call?</h3>
                <a
                  href={`tel:${displayPhone}`}
                  className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3.5 text-primary transition-colors hover:bg-primary/10"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <div>
                    <p className="font-heading text-xs font-semibold">Call Us Now</p>
                    <p className="font-body text-sm font-medium">{displayPhone}</p>
                  </div>
                </a>
                <a
                  href={`https://wa.me/${displayPhoneWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-dark transition-colors hover:border-primary hover:text-primary"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M10 0C4.478 0 0 4.478 0 10a9.94 9.94 0 001.367 5.058L0 20l5.085-1.338A9.95 9.95 0 0010 20c5.522 0 10-4.478 10-10S15.522 0 10 0zm0 18.182a8.16 8.16 0 01-4.163-1.136l-.298-.178-3.017.795.807-2.945-.196-.313A8.2 8.2 0 011.818 10C1.818 5.479 5.479 1.818 10 1.818c4.522 0 8.182 3.66 8.182 8.182S14.522 18.182 10 18.182z" />
                  </svg>
                  <div>
                    <p className="font-heading text-xs font-semibold">WhatsApp</p>
                    <p className="font-body text-sm">{displayPhoneWhatsApp}</p>
                  </div>
                </a>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">Find Us</h3>
                <p className="font-body text-sm text-dark leading-relaxed">{displayAddress}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
