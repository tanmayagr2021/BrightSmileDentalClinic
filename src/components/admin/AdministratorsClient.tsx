'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminUserWithRole } from '@/types/db'

type StatusFilter = 'all' | 'active' | 'disabled'

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initialsOf(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function KeyIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.1 6.9L12 11.8M10 9.8l1.3 1.3M11.5 8.3l1.3 1.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.5a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const EMPTY_CREATE_FORM = {
  first_name: '', last_name: '', email: '', phone: '',
  password: '', confirm_password: '', is_active: true,
}

export default function AdministratorsClient({
  administrators,
  currentAdminId,
}: {
  administrators: AdminUserWithRole[]
  currentAdminId: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortByLastLogin, setSortByLastLogin] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [creating, setCreating] = useState(false)

  const [editing, setEditing] = useState<AdminUserWithRole | null>(null)
  const [editDraft, setEditDraft] = useState({ full_name: '', phone_number: '' })

  const [resetPasswordFor, setResetPasswordFor] = useState<AdminUserWithRole | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const filtered = useMemo(() => {
    let list = administrators
    if (statusFilter === 'active') list = list.filter((a) => a.is_active)
    if (statusFilter === 'disabled') list = list.filter((a) => !a.is_active)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone_number ?? '').toLowerCase().includes(q)
      )
    }
    if (sortByLastLogin) {
      list = [...list].sort((a, b) => {
        if (!a.last_sign_in_at) return 1
        if (!b.last_sign_in_at) return -1
        return new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime()
      })
    }
    return list
  }, [administrators, statusFilter, search, sortByLastLogin])

  const handleCreate = async () => {
    if (!createForm.first_name.trim() || !createForm.last_name.trim() || !createForm.email.trim() || !createForm.password) {
      showToast('First name, last name, email and password are required', false)
      return
    }
    if (createForm.password !== createForm.confirm_password) {
      showToast('Passwords do not match', false)
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create administrator')
      showToast(`Administrator ${createForm.email} created`, true)
      setShowCreate(false)
      setCreateForm(EMPTY_CREATE_FORM)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (a: AdminUserWithRole) => {
    setEditing(a)
    setEditDraft({ full_name: a.full_name, phone_number: a.phone_number ?? '' })
  }

  const saveEdit = async () => {
    if (!editing) return
    setLoadingId(editing.id)
    try {
      const res = await fetch(`/api/admin/administrators/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDraft),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      showToast('Administrator updated', true)
      setEditing(null)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const toggleActive = async (a: AdminUserWithRole) => {
    setLoadingId(a.id)
    try {
      const res = await fetch(`/api/admin/administrators/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !a.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast(a.is_active ? `${a.full_name} disabled` : `${a.full_name} enabled`, true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (a: AdminUserWithRole) => {
    if (!confirm(`Delete administrator ${a.full_name}? This cannot be undone.`)) return
    setLoadingId(a.id)
    try {
      const res = await fetch(`/api/admin/administrators/${a.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      showToast('Administrator deleted', true)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const handleResetPassword = async (a: AdminUserWithRole) => {
    setLoadingId(a.id)
    try {
      const res = await fetch(`/api/admin/administrators/${a.id}/reset-password`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setResetPasswordFor(a)
      setGeneratedPassword(data.temporaryPassword)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', false)
    } finally {
      setLoadingId(null)
    }
  }

  const counts = {
    total: administrators.length,
    active: administrators.filter((a) => a.is_active).length,
    disabled: administrators.filter((a) => !a.is_active).length,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg font-heading text-xs font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Administrators</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Manage staff accounts with access to this admin panel.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 font-heading text-xs font-semibold text-primary transition-all hover:bg-primary/15"
        >
          <PlusIcon />
          Add Administrator
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: counts.total },
          { label: 'Active', value: counts.active },
          { label: 'Disabled', value: counts.disabled },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-gray-900">{s.value}</p>
            <p className="font-body text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search administrators…"
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 font-body text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'disabled'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold capitalize transition-all ${
                statusFilter === f ? 'bg-primary text-[#14202E]' : 'border border-gray-200 text-gray-600 hover:border-primary/30'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setSortByLastLogin((v) => !v)}
            className={`rounded-lg border px-3 py-1.5 font-heading text-xs font-semibold transition-all ${
              sortByLastLogin ? 'border-primary/30 bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:border-primary/30'
            }`}
          >
            Sort by Last Login
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {['', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const isSuperAdmin = a.role === 'super_admin'
                const isLoading = loadingId === a.id
                return (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-[#14202E]">
                        {initialsOf(a.full_name)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-heading text-sm font-semibold text-gray-800">
                        {a.full_name}
                        {a.id === currentAdminId && <span className="ml-1.5 font-body text-xs text-gray-400">(You)</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-gray-600">{a.email}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-600">{a.phone_number ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 font-heading text-[0.6rem] font-semibold ${isSuperAdmin ? 'bg-teal/10 text-teal' : 'bg-gray-100 text-gray-600'}`}>
                        {isSuperAdmin ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 font-heading text-[0.6rem] font-semibold ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {a.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-gray-500">{fmtDate(a.created_at)}</td>
                    <td className="px-4 py-3 font-body text-xs text-gray-500">{fmtDate(a.last_sign_in_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(a)}
                          disabled={isSuperAdmin || isLoading}
                          title={isSuperAdmin ? 'The Super Admin account cannot be edited here' : 'Edit'}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-heading text-[0.62rem] font-semibold text-gray-500 transition-all hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(a)}
                          disabled={isSuperAdmin || isLoading}
                          title={isSuperAdmin ? 'The Super Admin account cannot be disabled' : a.is_active ? 'Disable' : 'Enable'}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-heading text-[0.62rem] font-semibold text-gray-500 transition-all hover:border-amber-200 hover:text-amber-600 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                        >
                          {a.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(a)}
                          disabled={isLoading}
                          title="Reset Password"
                          aria-label={`Reset password for ${a.full_name}`}
                          className="flex items-center justify-center rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-all hover:border-primary/30 hover:text-primary disabled:opacity-30"
                        >
                          <KeyIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          disabled={isSuperAdmin || isLoading}
                          title={isSuperAdmin ? 'The Super Admin account cannot be deleted' : 'Delete'}
                          aria-label={`Delete ${a.full_name}`}
                          className="flex items-center justify-center rounded-lg border border-red-100 p-1.5 text-red-400 transition-all hover:border-red-200 hover:bg-red-50 disabled:opacity-30"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-heading text-sm font-semibold text-gray-600">No administrators found</p>
            <p className="mt-1 font-body text-xs text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreate(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Add administrator"
          >
            <h3 className="font-heading text-sm font-semibold text-gray-900">Add Administrator</h3>
            <p className="mt-1 font-body text-xs text-gray-500">New accounts are always created with the Admin role.</p>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">First Name *</label>
                  <input
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Last Name *</label>
                  <input
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                  />
                </div>
              </div>
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Phone</label>
                <input
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 9801234567"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Password *</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Confirm *</label>
                  <input
                    type="password"
                    value={createForm.confirm_password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, confirm_password: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={createForm.is_active}
                  onChange={(e) => setCreateForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                Active immediately
              </label>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-[#14202E] transition-all hover:bg-primary-dark disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create Administrator'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 transition-all hover:border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editing.full_name}`}
          >
            <h3 className="font-heading text-sm font-semibold text-gray-900">Edit Administrator</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  value={editDraft.full_name}
                  onChange={(e) => setEditDraft((d) => ({ ...d, full_name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="block font-heading text-[0.65rem] font-semibold text-gray-500 mb-1">Phone</label>
                <input
                  value={editDraft.phone_number}
                  onChange={(e) => setEditDraft((d) => ({ ...d, phone_number: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 font-body text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={saveEdit}
                disabled={loadingId === editing.id}
                className="rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-[#14202E] transition-all hover:bg-primary-dark disabled:opacity-60"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-500 transition-all hover:border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password result */}
      {resetPasswordFor && generatedPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => { setResetPasswordFor(null); setGeneratedPassword(null) }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="New temporary password"
          >
            <h3 className="font-heading text-sm font-semibold text-gray-900">Password Reset</h3>
            <p className="mt-1 font-body text-xs text-gray-500">
              New temporary password for <strong>{resetPasswordFor.full_name}</strong>. Share it securely — it won&apos;t be shown again.
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <code className="font-mono text-sm text-gray-900 break-all">{generatedPassword}</code>
            </div>
            <button
              onClick={() => { setResetPasswordFor(null); setGeneratedPassword(null) }}
              className="mt-5 w-full rounded-xl bg-primary px-5 py-2 font-heading text-xs font-semibold text-[#14202E] transition-all hover:bg-primary-dark"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
