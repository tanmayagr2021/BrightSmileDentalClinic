'use client'

import { useState, useEffect, useId, cloneElement, isValidElement, Children } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MedicalHistoryData, MedicalHistoryStep } from '@/types/ai'
import { EMPTY_MEDICAL_HISTORY, MEDICAL_HISTORY_STEPS } from '@/types/ai'
import { trackEvent } from '@/lib/analytics'

const CONDITION_OPTIONS = [
  'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Asthma',
  'Epilepsy / Seizures', 'Thyroid Disorder', 'Kidney Disease',
  'Liver Disease', 'Osteoporosis', 'Cancer (current/recent)',
  'Blood Thinners', 'HIV / Immunocompromised', 'Pregnancy',
]

const COMMON_ALLERGIES = [
  'Penicillin / Amoxicillin', 'Aspirin / NSAIDs', 'Latex',
  'Local Anaesthetic', 'Sulfa Drugs', 'Codeine / Opioids',
]

interface Props {
  sessionId: string
  onComplete: (name: string) => void
  onCancel: () => void
}

export default function MedicalHistoryWizard({ sessionId, onComplete, onCancel }: Props) {
  const [step, setStep] = useState<MedicalHistoryStep>('personal')
  const [data, setData] = useState<MedicalHistoryData>(EMPTY_MEDICAL_HISTORY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)

  const stepIndex = MEDICAL_HISTORY_STEPS.findIndex((s) => s.key === step)
  const isFirst = stepIndex === 0
  const isLast = step === 'review'

  useEffect(() => {
    trackEvent('Medical History Started')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function go(next: MedicalHistoryStep, dir: 1 | -1) {
    setDirection(dir)
    setStep(next)
  }

  function handleNext() {
    const steps = MEDICAL_HISTORY_STEPS.map((s) => s.key)
    const nextStep = steps[stepIndex + 1]
    if (nextStep) go(nextStep, 1)
  }

  function handleBack() {
    const steps = MEDICAL_HISTORY_STEPS.map((s) => s.key)
    const prevStep = steps[stepIndex - 1]
    if (prevStep) go(prevStep, -1)
  }

  function toggleCondition(condition: string) {
    setData((d) => ({
      ...d,
      medicalConditions: d.medicalConditions.includes(condition)
        ? d.medicalConditions.filter((c) => c !== condition)
        : [...d.medicalConditions, condition],
    }))
  }

  function toggleAllergy(allergy: string) {
    setData((d) => ({
      ...d,
      allergies: d.allergies.includes(allergy)
        ? d.allergies.filter((a) => a !== allergy)
        : [...d.allergies, allergy],
    }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/medical-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, data }),
      })
      if (!res.ok) throw new Error('Submission failed')
      trackEvent('Medical History Completed')
      onComplete(data.patientName)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const variants = {
    enter: (dir: 1 | -1) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir * -60, opacity: 0 }),
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: '#C9A24B', fontFamily: 'var(--font-poppins)' }}
          >
            Medical History
          </h3>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-inter)' }}>
            {MEDICAL_HISTORY_STEPS[stepIndex].label} · Step {stepIndex + 1} of {MEDICAL_HISTORY_STEPS.length}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.68)' }}
          aria-label="Cancel medical history"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #C9A24B, #A8823A)' }}
          animate={{ width: `${((stepIndex + 1) / MEDICAL_HISTORY_STEPS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Step content */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-y-auto px-5 py-4"
          >
            {step === 'personal' && (
              <PersonalStep data={data} onChange={(p) => setData((d) => ({ ...d, ...p }))} />
            )}
            {step === 'complaint' && (
              <ComplaintStep data={data} onChange={(p) => setData((d) => ({ ...d, ...p }))} />
            )}
            {step === 'medical' && (
              <MedicalStep
                data={data}
                onToggleCondition={toggleCondition}
              />
            )}
            {step === 'dental' && (
              <DentalStep data={data} onChange={(p) => setData((d) => ({ ...d, ...p }))} />
            )}
            {step === 'medications' && (
              <MedicationsStep
                data={data}
                onToggleAllergy={toggleAllergy}
                onChange={(p) => setData((d) => ({ ...d, ...p }))}
              />
            )}
            {step === 'review' && <ReviewStep data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <p className="px-5 pb-2 text-xs" style={{ color: '#f87171', fontFamily: 'var(--font-inter)' }}>
          {error}
        </p>
      )}

      {/* Navigation */}
      <div
        className="flex items-center justify-between border-t px-5 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={isFirst ? onCancel : handleBack}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200 hover:opacity-70"
          style={{
            color: 'rgba(255,255,255,0.68)',
            fontFamily: 'var(--font-poppins)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {isFirst ? 'Cancel' : '← Back'}
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #C9A24B 0%, #A8823A 100%)',
              color: '#14202E',
              fontFamily: 'var(--font-poppins)',
              boxShadow: '0 4px 16px rgba(201, 162, 75,0.3)',
            }}
          >
            {submitting ? (
              <>
                <Spinner />
                Submitting…
              </>
            ) : (
              'Submit History'
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={step === 'personal' && !data.patientName.trim()}
            className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #C9A24B 0%, #A8823A 100%)',
              color: '#14202E',
              fontFamily: 'var(--font-poppins)',
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

// ── Step Components ────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  const id = useId()
  // Most fields wrap a single native control, which we can associate via
  // htmlFor/id. A couple wrap a button-group instead of one element (e.g.
  // Dental Anxiety) — those fall back to a plain label, still visually
  // grouped with the control immediately below it.
  const canAssociate = isValidElement(children) && Children.count(children) === 1
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={canAssociate ? id : undefined}
        className="text-xs font-medium"
        style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-poppins)' }}
      >
        {label}
        {required && <span style={{ color: '#C9A24B' }}> *</span>}
      </label>
      {canAssociate ? cloneElement(children as React.ReactElement<{ id?: string }>, { id }) : children}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:opacity-40 focus:ring-1'
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  borderColor: 'rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.88)',
  fontFamily: 'var(--font-inter)',
}

function PersonalStep({
  data,
  onChange,
}: {
  data: MedicalHistoryData
  onChange: (p: Partial<MedicalHistoryData>) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <StepHeading title="Let's start with your details" subtitle="All information is kept strictly confidential." />
      <Field label="Full Name" required>
        <input
          type="text"
          value={data.patientName}
          onChange={(e) => onChange({ patientName: e.target.value })}
          placeholder="Your full name"
          className={inputClass}
          style={inputStyle}
          autoFocus
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
          <input
            type="number"
            value={data.patientAge}
            onChange={(e) => onChange({ patientAge: e.target.value })}
            placeholder="e.g. 32"
            min="1"
            max="120"
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Gender">
          <select
            value={data.patientGender}
            onChange={(e) =>
              onChange({ patientGender: e.target.value as MedicalHistoryData['patientGender'] })
            }
            className={inputClass}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </Field>
      </div>
      <Field label="Phone Number">
        <input
          type="tel"
          value={data.patientPhone}
          onChange={(e) => onChange({ patientPhone: e.target.value })}
          placeholder="+977-98XXXXXXXX"
          className={inputClass}
          style={inputStyle}
        />
      </Field>
      <Field label="Email (optional)">
        <input
          type="email"
          value={data.patientEmail}
          onChange={(e) => onChange({ patientEmail: e.target.value })}
          placeholder="your@email.com"
          className={inputClass}
          style={inputStyle}
        />
      </Field>
    </div>
  )
}

function ComplaintStep({
  data,
  onChange,
}: {
  data: MedicalHistoryData
  onChange: (p: Partial<MedicalHistoryData>) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <StepHeading title="What brings you in today?" subtitle="Describe your main dental concern in your own words." />
      <Field label="Chief Complaint">
        <textarea
          value={data.chiefComplaint}
          onChange={(e) => onChange({ chiefComplaint: e.target.value })}
          placeholder="e.g. Tooth pain in my upper right, sensitivity to cold, or I'd like a routine check-up…"
          rows={4}
          className={`${inputClass} resize-none`}
          style={inputStyle}
          autoFocus
        />
      </Field>
      <Field label="Dental Anxiety">
        <p className="mb-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)' }}>
          How do you feel about dental visits?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['none', 'mild', 'moderate', 'severe'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onChange({ dentalAnxietyLevel: level })}
              className="rounded-xl py-2 text-xs font-medium capitalize transition-all duration-200"
              style={{
                background:
                  data.dentalAnxietyLevel === level
                    ? 'linear-gradient(135deg, rgba(201, 162, 75,0.2) 0%, rgba(201, 162, 75,0.1) 100%)'
                    : 'rgba(255,255,255,0.04)',
                border:
                  data.dentalAnxietyLevel === level
                    ? '1px solid rgba(201, 162, 75,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                color:
                  data.dentalAnxietyLevel === level
                    ? '#C9A24B'
                    : 'rgba(255,255,255,0.55)',
                fontFamily: 'var(--font-poppins)',
              }}
            >
              {level === 'none' ? 'None — I\'m comfortable' : level === 'mild' ? 'Mild' : level === 'moderate' ? 'Moderate' : 'Severe — I\'m very anxious'}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

function MedicalStep({
  data,
  onToggleCondition,
}: {
  data: MedicalHistoryData
  onToggleCondition: (c: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <StepHeading title="Medical conditions" subtitle="Select any that apply. This helps us provide safe treatment." />
      <div className="flex flex-wrap gap-2">
        {CONDITION_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => onToggleCondition(c)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
            style={{
              background: data.medicalConditions.includes(c)
                ? 'rgba(201, 162, 75,0.18)'
                : 'rgba(255,255,255,0.05)',
              border: data.medicalConditions.includes(c)
                ? '1px solid rgba(201, 162, 75,0.5)'
                : '1px solid rgba(255,255,255,0.1)',
              color: data.medicalConditions.includes(c)
                ? '#C9A24B'
                : 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-poppins)',
            }}
          >
            {data.medicalConditions.includes(c) ? '✓ ' : ''}{c}
          </button>
        ))}
      </div>
      <Field label="Other conditions not listed above">
        <input
          type="text"
          placeholder="Type any additional conditions…"
          className={inputClass}
          style={inputStyle}
          onBlur={(e) => {
            const val = e.target.value.trim()
            if (val && !data.medicalConditions.includes(val)) {
              onToggleCondition(val)
              e.target.value = ''
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val && !data.medicalConditions.includes(val)) {
                onToggleCondition(val)
                ;(e.target as HTMLInputElement).value = ''
              }
            }
          }}
        />
      </Field>
    </div>
  )
}

function DentalStep({
  data,
  onChange,
}: {
  data: MedicalHistoryData
  onChange: (p: Partial<MedicalHistoryData>) => void
}) {
  const VISIT_OPTIONS = [
    'Within 6 months',
    '6–12 months ago',
    '1–2 years ago',
    '2–5 years ago',
    'More than 5 years ago',
    'Never',
  ]

  return (
    <div className="flex flex-col gap-4">
      <StepHeading title="Your dental history" subtitle="Helps us understand your background and plan your care." />
      <Field label="Last Dental Visit">
        <div className="grid grid-cols-2 gap-2">
          {VISIT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ lastDentalVisit: opt })}
              className="rounded-xl py-2 text-xs font-medium transition-all duration-200"
              style={{
                background:
                  data.lastDentalVisit === opt
                    ? 'rgba(201, 162, 75,0.15)'
                    : 'rgba(255,255,255,0.04)',
                border:
                  data.lastDentalVisit === opt
                    ? '1px solid rgba(201, 162, 75,0.45)'
                    : '1px solid rgba(255,255,255,0.09)',
                color:
                  data.lastDentalVisit === opt
                    ? '#C9A24B'
                    : 'rgba(255,255,255,0.55)',
                fontFamily: 'var(--font-poppins)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Previous Dental Treatments">
        <textarea
          value={data.previousTreatments}
          onChange={(e) => onChange({ previousTreatments: e.target.value })}
          placeholder="e.g. Fillings, root canal, braces, extractions, implants…"
          rows={3}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </Field>
    </div>
  )
}

function MedicationsStep({
  data,
  onToggleAllergy,
  onChange,
}: {
  data: MedicalHistoryData
  onToggleAllergy: (a: string) => void
  onChange: (p: Partial<MedicalHistoryData>) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <StepHeading title="Medications & Allergies" subtitle="Crucial for your safety during treatment." />
      <Field label="Current Medications">
        <textarea
          value={data.currentMedications}
          onChange={(e) => onChange({ currentMedications: e.target.value })}
          placeholder="List any medications you currently take, including supplements…"
          rows={3}
          className={`${inputClass} resize-none`}
          style={inputStyle}
          autoFocus
        />
      </Field>
      <Field label="Known Allergies">
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map((a) => (
            <button
              key={a}
              onClick={() => onToggleAllergy(a)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                background: data.allergies.includes(a)
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(255,255,255,0.05)',
                border: data.allergies.includes(a)
                  ? '1px solid rgba(239,68,68,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                color: data.allergies.includes(a) ? '#f87171' : 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-poppins)',
              }}
            >
              {data.allergies.includes(a) ? '⚠ ' : ''}{a}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Other allergies">
        <input
          type="text"
          placeholder="Type any other allergies and press Enter…"
          className={inputClass}
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val && !data.allergies.includes(val)) {
                onToggleAllergy(val)
                ;(e.target as HTMLInputElement).value = ''
              }
            }
          }}
        />
      </Field>
    </div>
  )
}

function ReviewStep({ data }: { data: MedicalHistoryData }) {
  const sections = [
    {
      title: 'Personal',
      items: [
        { label: 'Name', value: data.patientName },
        { label: 'Age', value: data.patientAge || '—' },
        { label: 'Gender', value: data.patientGender || '—' },
        { label: 'Phone', value: data.patientPhone || '—' },
        { label: 'Email', value: data.patientEmail || '—' },
      ],
    },
    {
      title: 'Concern',
      items: [
        { label: 'Chief Complaint', value: data.chiefComplaint || '—' },
        { label: 'Anxiety Level', value: data.dentalAnxietyLevel || '—' },
      ],
    },
    {
      title: 'Medical',
      items: [
        {
          label: 'Conditions',
          value: data.medicalConditions.length ? data.medicalConditions.join(', ') : 'None',
        },
      ],
    },
    {
      title: 'Dental',
      items: [
        { label: 'Last Visit', value: data.lastDentalVisit || '—' },
        { label: 'Previous Treatments', value: data.previousTreatments || '—' },
      ],
    },
    {
      title: 'Medications',
      items: [
        { label: 'Medications', value: data.currentMedications || 'None' },
        {
          label: 'Allergies',
          value: data.allergies.length ? data.allergies.join(', ') : 'None',
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <StepHeading
        title="Review your history"
        subtitle="Please review and submit. Our team will receive this securely."
      />
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#C9A24B', fontFamily: 'var(--font-poppins)' }}
            >
              {section.title}
            </p>
            {section.items.map((item) => (
              <div key={item.label} className="mb-1 flex gap-2">
                <span
                  className="w-28 shrink-0 text-xs"
                  style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-inter)' }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-1">
      <h4
        className="text-sm font-semibold"
        style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-poppins)' }}
      >
        {title}
      </h4>
      <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)' }}>
        {subtitle}
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
