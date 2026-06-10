import Link from 'next/link'
import {
  DOCTORS_STATIC,
  SERVICE_CATEGORIES_STATIC,
  TESTIMONIALS_STATIC,
  FAQS_STATIC,
  SHOWCASE_SLIDES_STATIC,
  BEFORE_AFTER_STATIC,
} from '@/lib/constants'

// ─── Stat card ───────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = 'gray',
  href,
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'green' | 'blue' | 'amber' | 'gray' | 'purple' | 'rose'
  href?: string
}) {
  const dot: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-400',
    gray: 'bg-gray-400',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
  }
  const inner = (
    <div className={`group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow ${href ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="font-heading text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        <div className={`h-2 w-2 rounded-full ${dot[color]}`} aria-hidden="true" />
      </div>
      <p className="font-display text-3xl text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="mt-1 font-body text-xs text-gray-400">{sub}</p>}
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

// ─── Quick action ────────────────────────────────────────────

function QuickAction({
  label,
  desc,
  href,
  icon,
}: {
  label: string
  desc: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-primary/8 group-hover:text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-heading text-sm font-semibold text-gray-800">{label}</p>
        <p className="font-body text-xs text-gray-400 truncate">{desc}</p>
      </div>
      <svg viewBox="0 0 16 16" fill="none" className="ml-auto h-4 w-4 flex-shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" aria-hidden="true">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

// ─── Activity feed item ───────────────────────────────────────

function ActivityItem({ label, time, type }: { label: string; time: string; type: 'edit' | 'add' | 'view' }) {
  const colors = { edit: 'bg-blue-500', add: 'bg-green-500', view: 'bg-gray-400' }
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${colors[type]}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm text-gray-700 leading-tight">{label}</p>
        <p className="font-body text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  const leadDoctors = DOCTORS_STATIC.filter((d) => d.type === 'lead' && d.visible)
  const specialists = DOCTORS_STATIC.filter((d) => d.type === 'specialist' && d.visible)
  const visibleTestimonials = TESTIMONIALS_STATIC.filter((t) => t.visible)
  const visibleFaqs = FAQS_STATIC.filter((f) => f.visible)
  const visibleSlides = SHOWCASE_SLIDES_STATIC.filter((s) => s.visible)

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-gray-900 tracking-tight">Welcome back</h2>
          <p className="mt-1 font-body text-sm text-gray-500">
            Bright Smile Dental Clinic &middot; Nagpokhari, Naxal, Kathmandu
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href="/admin/showcase"
            className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-semibold text-gray-600 transition-all hover:border-primary/30 hover:text-primary"
          >
            Edit Showcase
          </Link>
          <Link
            href="/admin/doctors"
            className="rounded-xl bg-primary px-4 py-2 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Manage Doctors
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Appointments" value="—" sub="Backend pending" color="amber" href="/admin/appointments" />
        <StatCard label="Patients" value="1,000+" sub="All time" color="green" />
        <StatCard label="Lead Doctors" value={leadDoctors.length} sub="Bookable" color="blue" href="/admin/doctors" />
        <StatCard label="Services" value={SERVICE_CATEGORIES_STATIC.length} sub="Categories" color="purple" href="/admin/services" />
        <StatCard label="Testimonials" value={visibleTestimonials.length} sub={`of ${TESTIMONIALS_STATIC.length} total`} color="green" href="/admin/testimonials" />
        <StatCard label="Showcase Slides" value={visibleSlides.length} sub="Visible" color="blue" href="/admin/showcase" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

        {/* Quick actions */}
        <div>
          <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickAction
              label="Edit Showcase Slides"
              desc="Update clinic photos & descriptions"
              href="/admin/showcase"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3" />
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
              label="Update Contact Info"
              desc="Phone, email, hours, address"
              href="/admin/settings/website"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
              label="Homepage Sections"
              desc="Show, hide & reorder sections"
              href="/admin/homepage"
              icon={
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5" aria-hidden="true">
                  <rect x="1" y="1" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="1" y="7" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="1" y="13" width="14" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Recent Activity</h3>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <ActivityItem label="Showcase slide descriptions updated" time="Today, 10:32 AM" type="edit" />
            <ActivityItem label="Dr. Sachin profile bio refreshed" time="Yesterday, 3:15 PM" type="edit" />
            <ActivityItem label="New testimonial added — Priya Sharma" time="2 days ago" type="add" />
            <ActivityItem label="FAQ category 'Cosmetic' updated" time="3 days ago" type="edit" />
            <ActivityItem label="Website contact hours updated" time="5 days ago" type="edit" />
            <ActivityItem label="Service: Dental Implants description updated" time="1 week ago" type="edit" />
            <p className="mt-4 font-body text-xs text-gray-400 text-center">
              Live activity feed available after backend integration (Phase G).
            </p>
          </div>

          {/* Content health */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h4 className="font-heading text-xs font-semibold text-gray-700 mb-4">Content Health</h4>
            <div className="space-y-3">
              {[
                { label: 'Showcase slides', count: visibleSlides.length, total: SHOWCASE_SLIDES_STATIC.length, ok: true },
                { label: 'Lead doctors', count: leadDoctors.length, total: DOCTORS_STATIC.length, ok: true },
                { label: 'Specialists', count: specialists.length, total: specialists.length, ok: true },
                { label: 'Testimonials', count: visibleTestimonials.length, total: TESTIMONIALS_STATIC.length, ok: true },
                { label: 'Services', count: SERVICE_CATEGORIES_STATIC.length, total: SERVICE_CATEGORIES_STATIC.length, ok: true },
                { label: 'FAQs', count: visibleFaqs.length, total: FAQS_STATIC.length, ok: true },
                { label: 'Before & After photos', count: 0, total: BEFORE_AFTER_STATIC.length, ok: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="font-body text-xs text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-heading text-xs font-semibold ${item.ok ? 'text-gray-700' : 'text-amber-600'}`}>
                      {item.count}/{item.total}
                    </span>
                    <div className={`h-1.5 w-1.5 rounded-full ${item.ok ? 'bg-green-500' : 'bg-amber-400'}`} aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phase status banner */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-amber-600" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 5v3.5M8 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-xs font-semibold text-amber-800">Admin UI — Phase G Complete</p>
            <p className="font-body text-xs text-amber-700 mt-0.5">
              All CMS screens are live. Data is currently read from static constants. Phase H will connect everything to Supabase — changes made here will then persist.
            </p>
          </div>
          <Link href="/admin/doctors" className="flex-shrink-0 rounded-xl bg-amber-500 px-4 py-2 font-heading text-xs font-semibold text-white transition-colors hover:bg-amber-600">
            Start Editing
          </Link>
        </div>
      </div>

    </div>
  )
}
