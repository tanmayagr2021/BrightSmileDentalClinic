'use client'

import { Fragment, useState, useEffect, useCallback } from 'react'
import type { AuditLogWithActor } from '@/types/db'

const MODULES = ['doctors', 'services', 'gallery', 'testimonials', 'admin_users']
const ACTIONS = ['create', 'update', 'delete', 'login', 'reset_password', 'disable', 'enable']

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  login: 'Logged in',
  reset_password: 'Reset Password',
  disable: 'Disabled',
  enable: 'Enabled',
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M7 1v8M4 6l3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AuditLogsClient({ admins }: { admins: { id: string; full_name: string; email: string }[] }) {
  const [logs, setLogs] = useState<AuditLogWithActor[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [adminFilter, setAdminFilter] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const pageSize = 25
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const buildQuery = useCallback((forCsv = false) => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (adminFilter) params.set('admin', adminFilter)
    if (moduleFilter) params.set('module', moduleFilter)
    if (actionFilter) params.set('action', actionFilter)
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    if (forCsv) params.set('format', 'csv')
    else params.set('page', String(page))
    return params.toString()
  }, [search, adminFilter, moduleFilter, actionFilter, dateFrom, dateTo, page])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/audit-logs?${buildQuery()}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.data ?? [])
        setTotal(data.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [buildQuery])

  // Reset to page 1 whenever a filter (not page itself) changes.
  useEffect(() => { setPage(1) }, [search, adminFilter, moduleFilter, actionFilter, dateFrom, dateTo])

  const exportCsv = () => {
    window.open(`/api/admin/audit-logs?${buildQuery(true)}`, '_blank')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-gray-900 tracking-tight">Audit Logs</h2>
          <p className="mt-1 font-body text-sm text-gray-500">Complete history of admin actions across the CMS.</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-primary/30 hover:text-primary"
        >
          <DownloadIcon />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 lg:col-span-2"
        />
        <select
          value={adminFilter}
          onChange={(e) => setAdminFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary"
        >
          <option value="">All Admins</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>{a.full_name}</option>
          ))}
        </select>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary capitalize"
        >
          <option value="">All Modules</option>
          {MODULES.map((m) => (
            <option key={m} value={m} className="capitalize">{m.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary"
          />
          <span className="text-gray-300">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 font-body text-xs text-gray-900 outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {['', 'Timestamp', 'Administrator', 'Action', 'Module', 'Record', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isOpen = expandedId === log.id
                return (
                  <Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedId(isOpen ? null : log.id)}
                      className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 text-gray-400"><ChevronIcon open={isOpen} /></td>
                      <td className="px-4 py-3 font-body text-xs text-gray-500 whitespace-nowrap">{fmtDateTime(log.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-heading text-sm font-semibold text-gray-800">{log.actor_name ?? 'Unknown'}</p>
                        <p className="font-body text-[0.65rem] text-gray-400">{log.actor_role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-tint px-2.5 py-1 font-heading text-[0.6rem] font-semibold text-primary">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-gray-600 capitalize">{log.resource.replace('_', ' ')}</td>
                      <td className="px-4 py-3 font-body text-xs text-gray-400 truncate max-w-[140px]">{log.resource_id ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 font-heading text-[0.6rem] font-semibold ${log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-gray-50 bg-gray-50/40">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <p className="mb-1.5 font-heading text-[0.62rem] font-semibold uppercase tracking-wide text-gray-400">Previous Value</p>
                              <pre className="max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white p-3 font-mono text-[0.68rem] text-gray-600 whitespace-pre-wrap break-all">
                                {log.old_data ? JSON.stringify(log.old_data, null, 2) : '—'}
                              </pre>
                            </div>
                            <div>
                              <p className="mb-1.5 font-heading text-[0.62rem] font-semibold uppercase tracking-wide text-gray-400">New Value</p>
                              <pre className="max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white p-3 font-mono text-[0.68rem] text-gray-600 whitespace-pre-wrap break-all">
                                {log.new_data ? JSON.stringify(log.new_data, null, 2) : '—'}
                              </pre>
                            </div>
                          </div>
                          <p className="mt-3 font-body text-[0.65rem] text-gray-400">
                            {log.actor_email} · {log.ip_address ?? 'IP unavailable'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {!loading && logs.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-heading text-sm font-semibold text-gray-600">No audit log entries found</p>
            <p className="mt-1 font-body text-xs text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="font-body text-xs text-gray-500">Page {page} of {totalPages} · {total} entries</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-xs font-semibold text-gray-600 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-xs font-semibold text-gray-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
