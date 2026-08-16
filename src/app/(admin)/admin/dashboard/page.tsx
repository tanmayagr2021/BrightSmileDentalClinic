import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { clinicDateStr } from '@/lib/utils'
import {
  DOCTORS_STATIC,
  SERVICE_CATEGORIES_STATIC,
  TESTIMONIALS_STATIC,
  FAQS_STATIC,
  SHOWCASE_SLIDES_STATIC,
  BEFORE_AFTER_STATIC,
} from '@/lib/constants'

export const dynamic = 'force-dynamic'

// ─── Helpers ─────────────────────────────────────────────

function todayStr() {
  return clinicDateStr()
}

function sevenDaysAgoStr() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return clinicDateStr(d)
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function doctorName(notes: string | null): string {
  if (!notes) return ''
  const match = notes.match(/^Doctor: (.+?)(?:\n|$)/)
  return match ? match[1] : ''
}

// ─── Sub-components ───────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent = false,
  href,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  href?: string
}) {
  const inner = (
    <div className={`group rounded-2xl border p-5 shadow-sm transition-shadow ${href ? 'cursor-pointer hover:shadow-md' : ''} ${accent ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}>
      <p className={`font-heading text-xs font-semibold uppercase tracking-wide ${accent ? 'text-amber-600' : 'text-gray-600'}`}>{label}</p>
      <p className={`mt-3 font-display text-3xl tracking-tight ${accent ? 'text-amber-700' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`mt-1 font-body text-xs ${accent ? 'text-amber-600' : 'text-gray-600'}`}>{sub}</p>}
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

function QuickAction({ label, desc, href, icon, external }: { label: string; desc: string; href: string; icon: React.ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-heading text-sm font-semibold text-gray-800">{label}</p>
        <p className="font-body text-xs text-gray-600 truncate">{desc}</p>
      </div>
      <svg viewBox="0 0 16 16" fill="none" className="ml-auto h-4 w-4 flex-shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" aria-hidden="true">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  no_show:   'bg-red-100 text-red-600',
}

// ─── Page ────────────────────────────────────────────────

export default async function DashboardPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const today = todayStr()
  const weekAgo = sevenDaysAgoStr()

  // Parallel fetches
  const [todayRes, pendingRes, weekRes, totalRes, recentRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today)
      .neq('status', 'cancelled'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', weekAgo)
      .neq('status', 'cancelled'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('id, patient_name, appointment_date, appointment_time, status, notes')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const todayCount   = todayRes.count   ?? 0
  const pendingCount = pendingRes.count  ?? 0
  const weekCount    = weekRes.count    ?? 0
  const totalCount   = totalRes.count   ?? 0
  const recentAppts  = recentRes.data   ?? []

  const leadDoctors        = DOCTORS_STATIC.filter(d => d.type === 'lead' && d.visible)
  const visibleTestimonials = TESTIMONIALS_STATIC.filter(t => t.visible)
  const visibleSlides       = SHOWCASE_SLIDES_STATIC.filter(s => s.visible)
  const visibleFaqs         = FAQS_STATIC.filter(f => f.visible)

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-gray-900 tracking-tight">Dashboard</h2>
          <p className="mt-1 font-body text-sm text-gray-500">
            Bright Smile Dental Clinic · Nagpokhari, Naxal, Kathmandu
          </p>
        </div>
        <Link
          href="/admin/appointments"
          className="rounded-xl bg-primary px-4 py-2 font-heading text-xs font-semibold text-white transition hover:bg-primary-dark"
        >
          Manage Appointments
        </Link>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5">
          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-500 animate-pulse" />
          <p className="font-heading text-xs font-semibold text-amber-800">
            {pendingCount} pending appointment{pendingCount !== 1 ? 's' : ''} need confirmation — call the patient
          </p>
          <Link href="/admin/appointments" className="ml-auto flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 font-heading text-xs font-semibold text-white hover:bg-amber-600 transition">
            Review
          </Link>
        </div>
      )}

      {/* Appointment stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending" value={pendingCount} sub="Need confirmation" accent={pendingCount > 0} href="/admin/appointments" />
        <StatCard label="Today" value={todayCount} sub={new Date().toLocaleDateString('en-GB', { weekday: 'long' })} href="/admin/appointments" />
        <StatCard label="This week" value={weekCount} sub="Last 7 days" />
        <StatCard label="All time" value={totalCount} sub="Total bookings" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

        {/* Quick actions */}
        <div>
          <h3 className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-gray-600">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickAction
              label="Appointments"
              desc="Confirm or cancel patient bookings"
              href="/admin/appointments"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <rect x="1" y="3" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              }
            />
            <QuickAction
              label="Manage Doctors"
              desc="Edit profiles, toggle bookable status"
              href="/admin/doctors"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              }
            />
            <QuickAction
              label="Edit Showcase"
              desc="Update clinic photos & captions"
              href="/admin/showcase"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              }
            />
            <QuickAction
              label="Add Testimonial"
              desc="Publish a new patient review"
              href="/admin/testimonials"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              }
            />
            <QuickAction
              label="Manage FAQs"
              desc="Add, edit, reorder questions"
              href="/admin/faqs"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M6.5 6.2C6.5 5.4 7.2 5 8 5c.8 0 1.5.5 1.5 1.4 0 .7-.4 1.1-1 1.4-.5.2-.6.6-.6 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.7" fill="currentColor" />
                </svg>
              }
            />
            <QuickAction
              label="Website Settings"
              desc="Phone, email, hours, address"
              href="/admin/settings/website"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              }
            />
            {process.env.NEXT_PUBLIC_UMAMI_DASHBOARD_URL && (
              <QuickAction
                label="Analytics"
                desc="Open the Umami dashboard"
                href={process.env.NEXT_PUBLIC_UMAMI_DASHBOARD_URL}
                external
                icon={
                  <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M2 13.5V2M2 13.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M4.5 11V7.5M8 11V4.5M11.5 11V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                }
              />
            )}
          </div>
        </div>

        {/* Recent appointments */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-600">Recent Bookings</h3>
            <Link href="/admin/appointments" className="font-heading text-xs font-semibold text-primary hover:underline underline-offset-2">
              View all
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
            {recentAppts.length === 0 && (
              <div className="py-10 text-center">
                <p className="font-body text-xs text-gray-600">No appointments yet.</p>
                <p className="font-body text-[0.65rem] text-gray-300 mt-0.5">New bookings will appear here.</p>
              </div>
            )}
            {recentAppts.map(appt => {
              const badge = STATUS_BADGE[appt.status] ?? 'bg-gray-100 text-gray-500'
              const doctor = doctorName(appt.notes)
              const dateObj = new Date(appt.appointment_date + 'T00:00:00')
              return (
                <div key={appt.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="flex-shrink-0 w-10 text-center pt-0.5">
                    <p className="font-heading text-sm font-bold text-gray-800 leading-none">{dateObj.getDate()}</p>
                    <p className="font-body text-[0.6rem] text-gray-600">{dateObj.toLocaleDateString('en-GB', { month: 'short' })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-semibold text-gray-800 truncate">{appt.patient_name}</p>
                    <p className="font-body text-[0.65rem] text-gray-600 truncate">
                      {doctor && `${doctor} · `}{formatTime(appt.appointment_time)}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 font-heading text-[0.58rem] font-bold ${badge}`}>
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Content health */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h4 className="mb-4 font-heading text-xs font-semibold text-gray-700">Content Health</h4>
            <div className="space-y-3">
              {[
                { label: 'Showcase slides',    count: visibleSlides.length,      total: SHOWCASE_SLIDES_STATIC.length,    ok: visibleSlides.length > 0 },
                { label: 'Lead doctors',       count: leadDoctors.length,         total: DOCTORS_STATIC.filter(d=>d.type==='lead').length, ok: true },
                { label: 'Testimonials',       count: visibleTestimonials.length, total: TESTIMONIALS_STATIC.length,       ok: visibleTestimonials.length > 0 },
                { label: 'Services',           count: SERVICE_CATEGORIES_STATIC.length, total: SERVICE_CATEGORIES_STATIC.length, ok: true },
                { label: 'FAQs',              count: visibleFaqs.length,         total: FAQS_STATIC.length,               ok: visibleFaqs.length > 0 },
                { label: 'Before & After',     count: 0,                          total: BEFORE_AFTER_STATIC.length,       ok: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="font-body text-xs text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-heading text-xs font-semibold ${item.ok ? 'text-gray-700' : 'text-amber-600'}`}>
                      {item.count}/{item.total}
                    </span>
                    <div className={`h-1.5 w-1.5 rounded-full ${item.ok ? 'bg-green-500' : 'bg-amber-400'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
