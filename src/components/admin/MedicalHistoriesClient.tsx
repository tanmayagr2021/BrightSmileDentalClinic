'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import type { MedicalHistoryRow } from '@/types/db'

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'attached'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:  { label: 'Pending',  bg: 'bg-amber-100',  text: 'text-amber-700'  },
  reviewed: { label: 'Reviewed', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  attached: { label: 'Attached', bg: 'bg-green-100',  text: 'text-green-700'  },
}

interface Props {
  initialData: MedicalHistoryRow[]
  totalCount: number
}

export default function MedicalHistoriesClient({ initialData, totalCount }: Props) {
  const [records, setRecords] = useState<MedicalHistoryRow[]>(initialData)
  const [total, setTotal] = useState(totalCount)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<MedicalHistoryRow | null>(null)
  const [isPending, startTransition] = useTransition()
  const printRef = useRef<HTMLDivElement>(null)
  const limit = 20

  const load = useCallback(
    (newFilter: StatusFilter, newSearch: string, newPage: number) => {
      startTransition(async () => {
        const params = new URLSearchParams()
        if (newFilter !== 'all') params.set('status', newFilter)
        if (newSearch.trim()) params.set('search', newSearch.trim())
        params.set('page', String(newPage))

        const res = await fetch(`/api/admin/medical-histories?${params}`)
        if (!res.ok) return
        const json = await res.json()
        setRecords(json.data ?? [])
        setTotal(json.total ?? 0)
        setPage(newPage)
      })
    },
    []
  )

  function handleFilter(f: StatusFilter) {
    setFilter(f)
    load(f, search, 1)
  }

  function handleSearch(s: string) {
    setSearch(s)
    load(filter, s, 1)
  }

  async function updateStatus(id: string, status: MedicalHistoryRow['status']) {
    const res = await fetch(`/api/admin/medical-histories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setRecords((r) => r.map((x) => (x.id === id ? { ...x, status } : x)))
      if (selected?.id === id) setSelected((s) => s && { ...s, status })
    }
  }

  async function saveNotes(id: string, notes: string) {
    const res = await fetch(`/api/admin/medical-histories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes }),
    })
    if (res.ok) {
      setRecords((r) => r.map((x) => (x.id === id ? { ...x, admin_notes: notes } : x)))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this medical history? This cannot be undone.')) return
    const res = await fetch(`/api/admin/medical-histories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setRecords((r) => r.filter((x) => x.id !== id))
      setTotal((t) => t - 1)
      if (selected?.id === id) setSelected(null)
    }
  }

  function handleExportCSV() {
    if (!records.length) return
    const headers = [
      'ID', 'Patient Name', 'Age', 'Gender', 'Phone', 'Email',
      'Chief Complaint', 'Conditions', 'Allergies', 'Medications',
      'Last Visit', 'Anxiety Level', 'Status', 'Submitted At',
    ]
    const rows = records.map((r) => [
      r.id,
      r.patient_name,
      r.patient_age ?? '',
      r.patient_gender ?? '',
      r.patient_phone ?? '',
      r.patient_email ?? '',
      r.chief_complaint ?? '',
      (r.medical_conditions ?? []).join('; '),
      (r.allergies ?? []).join('; '),
      r.current_medications ?? '',
      r.last_dental_visit ?? '',
      r.dental_anxiety_level ?? '',
      r.status,
      new Date(r.submitted_at).toLocaleString(),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`))

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medical-histories-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handlePrint() {
    if (!selected) return
    window.print()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex h-full">
      {/* Sidebar — record list */}
      <div className="flex w-full flex-col border-r border-gray-100 lg:w-[420px]">
        {/* Toolbar */}
        <div className="border-b border-gray-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-dark">Medical Histories</h2>
              <p className="text-xs text-gray-500">{total} record{total !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <DownloadIcon />
              Export CSV
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by patient name…"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto">
            {(['all', 'pending', 'reviewed', 'attached'] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-dark text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label ?? f}
              </button>
            ))}
          </div>
        </div>

        {/* Records list */}
        <div className="flex-1 overflow-y-auto">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardIcon className="mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No records found</p>
              <p className="mt-1 text-xs text-gray-600">
                Medical histories submitted via Bright AI will appear here.
              </p>
            </div>
          ) : (
            records.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  selected?.id === r.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-dark">{r.patient_name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {r.chief_complaint ?? 'No complaint noted'}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-600">
                      {new Date(r.submitted_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      STATUS_CONFIG[r.status]?.bg ?? 'bg-gray-100'
                    } ${STATUS_CONFIG[r.status]?.text ?? 'text-gray-600'}`}
                  >
                    {STATUS_CONFIG[r.status]?.label ?? r.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <button
              onClick={() => load(filter, search, page - 1)}
              disabled={page <= 1}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => load(filter, search, page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected ? (
        <div ref={printRef} className="hidden flex-1 flex-col overflow-y-auto lg:flex">
          <DetailPanel
            record={selected}
            onStatusChange={(s) => updateStatus(selected.id, s)}
            onSaveNotes={(n) => saveNotes(selected.id, n)}
            onDelete={() => handleDelete(selected.id)}
            onPrint={handlePrint}
          />
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="text-center">
            <ClipboardIcon className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm text-gray-600">Select a record to view details</p>
          </div>
        </div>
      )}

      {/* Mobile detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-heading text-sm font-semibold text-dark">Medical History</h3>
            <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-dark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DetailPanel
              record={selected}
              onStatusChange={(s) => updateStatus(selected.id, s)}
              onSaveNotes={(n) => saveNotes(selected.id, n)}
              onDelete={() => handleDelete(selected.id)}
              onPrint={handlePrint}
              />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────

function DetailPanel({
  record,
  onStatusChange,
  onSaveNotes,
  onDelete,
  onPrint,
}: {
  record: MedicalHistoryRow
  onStatusChange: (s: MedicalHistoryRow['status']) => void
  onSaveNotes: (n: string) => void
  onDelete: () => void
  onPrint: () => void
}) {
  const [notes, setNotes] = useState(record.admin_notes ?? '')
  const [notesSaved, setNotesSaved] = useState(false)

  async function handleSaveNotes() {
    await onSaveNotes(notes)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-dark">{record.patient_name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Submitted {new Date(record.submitted_at).toLocaleString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 print:hidden"
          >
            <PrintIcon />
            Print
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 print:hidden"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status update */}
      <div className="mb-6 rounded-xl border border-gray-100 p-4 print:hidden">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Status</p>
        <div className="flex gap-2">
          {(['pending', 'reviewed', 'attached'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                record.status === s
                  ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} ring-1 ring-current/30`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Info sections */}
      <div className="space-y-5">
        <Section title="Personal Information">
          <Grid>
            <Field label="Age" value={record.patient_age} />
            <Field label="Gender" value={record.patient_gender} />
            <Field label="Phone" value={record.patient_phone} />
            <Field label="Email" value={record.patient_email} />
          </Grid>
        </Section>

        <Section title="Dental Concern">
          <p className="text-sm text-dark">{record.chief_complaint ?? '—'}</p>
          <div className="mt-2">
            <Field label="Anxiety Level" value={record.dental_anxiety_level} />
          </div>
        </Section>

        <Section title="Medical Conditions">
          {record.medical_conditions?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {record.medical_conditions.map((c) => (
                <span key={c} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">None reported</p>
          )}
        </Section>

        <Section title="Dental History">
          <Grid>
            <Field label="Last Visit" value={record.last_dental_visit} />
            <Field label="Previous Treatments" value={record.previous_treatments} />
          </Grid>
        </Section>

        <Section title="Medications & Allergies">
          <Field label="Current Medications" value={record.current_medications} />
          <div className="mt-2">
            {record.allergies?.length ? (
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">Known Allergies</p>
                <div className="flex flex-wrap gap-1.5">
                  {record.allergies.map((a) => (
                    <span key={a} className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      ⚠ {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <Field label="Allergies" value="None reported" />
            )}
          </div>
        </Section>

        {/* Admin Notes */}
        <Section title="Admin Notes" className="print:hidden">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for the clinical team…"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          <button
            onClick={handleSaveNotes}
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {notesSaved ? '✓ Saved' : 'Save Notes'}
          </button>
        </Section>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">{title}</h4>
      <div className="rounded-xl border border-gray-100 p-4">{children}</div>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-dark">{value ?? '—'}</p>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1v7M3.5 5.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.5 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5V3a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PrintIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="2.5" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5V2.5h4V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
