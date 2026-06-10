'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DOCTORS_STATIC, TEAM_MEMBERS_STATIC } from '@/lib/constants'

type TabId = 'lead' | 'specialist' | 'team'

const TABS: { id: TabId; label: string }[] = [
  { id: 'lead', label: 'Lead Dentists' },
  { id: 'specialist', label: 'Specialists' },
  { id: 'team', label: 'Care Team' },
]

function DoctorRow({
  doctor,
  bookable,
  visible,
  onToggleVisible,
  onToggleBookable,
}: {
  doctor: (typeof DOCTORS_STATIC)[number]
  bookable: boolean
  visible: boolean
  onToggleVisible: () => void
  onToggleBookable: () => void
}) {
  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${visible ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-55'} shadow-sm`}>
      {/* Avatar */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white font-heading"
        style={{ backgroundColor: doctor.color }}
      >
        {doctor.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-sm font-semibold text-gray-800">{doctor.name}</p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-heading text-[0.58rem] font-semibold text-gray-500">
            {doctor.qualification}
          </span>
          {bookable && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 font-heading text-[0.58rem] font-semibold text-green-600">
              Bookable
            </span>
          )}
        </div>
        <p className="mt-0.5 font-body text-xs text-gray-400 truncate">{doctor.role} · {doctor.nmc}</p>
      </div>

      {/* Toggles + actions */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        {doctor.type === 'lead' && (
          <button
            onClick={onToggleBookable}
            className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all ${
              bookable
                ? 'border-primary/20 bg-primary/8 text-primary hover:bg-primary/15'
                : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
            }`}
          >
            {bookable ? 'Bookable ✓' : 'Not Bookable'}
          </button>
        )}
        <button
          onClick={onToggleVisible}
          className={`rounded-lg border px-3 py-1.5 font-heading text-[0.65rem] font-semibold transition-all ${
            visible
              ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
              : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
          }`}
        >
          {visible ? 'Visible' : 'Hidden'}
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

export default function DoctorsCmsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('lead')
  const [doctorStates, setDoctorStates] = useState(
    DOCTORS_STATIC.reduce<Record<string, { visible: boolean; bookable: boolean }>>((acc, d) => {
      acc[d.slug] = { visible: d.visible, bookable: d.bookable }
      return acc
    }, {})
  )

  const toggleVisible = (slug: string) =>
    setDoctorStates((prev) => ({ ...prev, [slug]: { ...prev[slug], visible: !prev[slug].visible } }))

  const toggleBookable = (slug: string) =>
    setDoctorStates((prev) => ({ ...prev, [slug]: { ...prev[slug], bookable: !prev[slug].bookable } }))

  const filtered = DOCTORS_STATIC.filter((d) => d.type === (activeTab === 'lead' ? 'lead' : 'specialist'))

  return (
    <div className="p-6 max-w-4xl mx-auto">

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

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
        {TABS.map((tab) => {
          const count = tab.id === 'team'
            ? TEAM_MEMBERS_STATIC.length
            : DOCTORS_STATIC.filter((d) => d.type === (tab.id === 'lead' ? 'lead' : 'specialist')).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 font-heading text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
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

      {/* Doctor rows */}
      {activeTab !== 'team' ? (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DoctorRow
              key={doc.slug}
              doctor={doc}
              bookable={doctorStates[doc.slug]?.bookable ?? doc.bookable}
              visible={doctorStates[doc.slug]?.visible ?? doc.visible}
              onToggleVisible={() => toggleVisible(doc.slug)}
              onToggleBookable={() => toggleBookable(doc.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {TEAM_MEMBERS_STATIC.map((member) => (
            <div key={member.name} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white font-heading"
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-semibold text-gray-800">{member.name}</p>
                <p className="font-body text-xs text-gray-400">{member.role} · {member.department}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-green-600">Visible</span>
                <button className="rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-[0.65rem] font-semibold text-gray-500 hover:border-primary/30 hover:text-primary transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-5 py-4 text-center">
            <button className="font-heading text-xs font-semibold text-gray-400 hover:text-primary transition-colors">
              + Add Team Member
            </button>
          </div>
        </div>
      )}

      {/* Booking note */}
      {activeTab === 'lead' && (
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="font-body text-xs text-blue-700 leading-relaxed">
            <strong>Bookable status</strong> controls whether a doctor appears in the appointment booking flow. Only lead dentists can be made bookable — specialists are referral-only.
          </p>
        </div>
      )}
    </div>
  )
}
