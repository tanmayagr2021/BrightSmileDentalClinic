'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ─── Nav structure ─────────────────────────────────────────────

const NAV = [
  {
    section: null,
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: IconDashboard }],
  },
  {
    section: 'Content',
    items: [
      { href: '/admin/content', label: 'Content Management', icon: IconContentBlocks },
      { href: '/admin/site-content', label: 'Site Content', icon: IconSiteContent },
      { href: '/admin/media', label: 'Media Library', icon: IconMedia },
      { href: '/admin/showcase', label: 'Showcase', icon: IconShowcase },
      { href: '/admin/homepage', label: 'Homepage', icon: IconHome },
      { href: '/admin/doctors', label: 'Doctors', icon: IconDoctors },
      { href: '/admin/services', label: 'Services', icon: IconServices },
      { href: '/admin/testimonials', label: 'Testimonials', icon: IconTestimonials },
      { href: '/admin/faqs', label: 'FAQs', icon: IconFaqs },
      { href: '/admin/gallery', label: 'Gallery', icon: IconGallery },
      { href: '/admin/blog', label: 'Blog', icon: IconBlog },
      { href: '/admin/about', label: 'About Page', icon: IconAbout },
    ],
  },
  {
    section: 'Clinic',
    items: [
      { href: '/admin/appointments', label: 'Appointments', icon: IconAppointments },
      { href: '/admin/medical-histories', label: 'Medical Histories', icon: IconMedicalHistory },
    ],
  },
  {
    section: 'Experiences',
    items: [
      { href: '/admin/virtual-tour', label: 'Virtual Tour', icon: IconVirtualTour },
      { href: '/admin/tooth-explorer', label: 'Tooth Explorer', icon: IconToothExplorer },
      { href: '/admin/trust-wall', label: 'Trust Wall', icon: IconTrustWall },
    ],
  },
  {
    section: 'Settings',
    items: [
      { href: '/admin/settings/website', label: 'Website', icon: IconSettings },
      { href: '/admin/settings/seo', label: 'SEO', icon: IconSeo },
    ],
  },
]

// Super Admin only — appended conditionally once the current user's role is known.
const SUPER_ADMIN_NAV = {
  section: 'Admin',
  items: [
    { href: '/admin/administrators', label: 'Administrators', icon: IconAdministrators },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: IconAuditLog },
  ],
}

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/content': 'Content Management',
  '/admin/site-content': 'Site Content',
  '/admin/media': 'Media Library',
  '/admin/showcase': 'Clinic Showcase',
  '/admin/homepage': 'Homepage Sections',
  '/admin/doctors': 'Doctors',
  '/admin/services': 'Services',
  '/admin/testimonials': 'Testimonials',
  '/admin/faqs': 'FAQs',
  '/admin/gallery': 'Gallery',
  '/admin/appointments': 'Appointments',
  '/admin/medical-histories': 'Medical Histories',
  '/admin/virtual-tour': 'Virtual Clinic Tour',
  '/admin/tooth-explorer': 'Interactive Tooth Explorer',
  '/admin/trust-wall': 'Trust Wall',
  '/admin/blog': 'Blog Posts',
  '/admin/about': 'About Page',
  '/admin/settings/website': 'Website Settings',
  '/admin/settings/seo': 'SEO Settings',
  '/admin/administrators': 'Administrators',
  '/admin/audit-logs': 'Audit Logs',
}

// ─── Icons ─────────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
function IconContentBlocks() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1.5" y="2" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 5.5h8M4 8h8M4 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconSiteContent() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 12h5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 9.5h5.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
function IconMedia() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5.5" cy="6" r="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 12l4-3.5 3 2.5 2.5-2.5 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconShowcase() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4" cy="5" r="0.8" fill="currentColor" />
      <circle cx="6.5" cy="5" r="0.8" fill="currentColor" />
    </svg>
  )
}
function IconHome() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <path d="M1.5 7L8 2l6.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6.5V13.5a.5.5 0 00.5.5H6v-3h4v3h2.5a.5.5 0 00.5-.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconDoctors() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconServices() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="9.5" width="6" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9.5" width="6" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
function IconTestimonials() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
function IconFaqs() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 6.2C6.5 5.4 7.2 5 8 5c.8 0 1.5.5 1.5 1.4 0 .7-.4 1.1-1 1.4C8 8 7.9 8.4 7.9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.7" fill="currentColor" />
    </svg>
  )
}
function IconGallery() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 10.5l4-3 3 3 2-2 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconAppointments() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 6.5h13M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 9.5h3M5 12h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconSeo() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconBlog() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="1.5" y="2" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 5.5h7M4.5 8h7M4.5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconAbout() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.7" fill="currentColor" />
    </svg>
  )
}
function IconMedicalHistory() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="2" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 5.5h4M5 8h4M5 10.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 5.5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconVirtualTour() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="8" cy="8" rx="6.5" ry="2.6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 1.5v13" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}
function IconToothExplorer() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <path d="M8 2c-1.6 0-2.2 1-3.3 1-1.3 0-2.2 1.1-2.2 2.6 0 1.6.6 2 .8 3.6.2 1.4.5 3.8 1.6 3.8.9 0 .9-1.8 1.5-1.8s.6 1.8 1.5 1.8c1.1 0 1.3-2.4 1.6-3.8.2-1.6.8-2 .8-3.6C10.3 4.1 9.4 3 8.1 3 7 3 6.4 2 8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
function IconTrustWall() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <path d="M8 1.5l5.5 2.2v3.6c0 3.5-2.3 5.9-5.5 6.7-3.2-.8-5.5-3.2-5.5-6.7V3.7L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.7 8l1.6 1.6 3-3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconAdministrators() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <circle cx="6" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 14c0-2.3 2-4.2 4.5-4.2s4.5 1.9 4.5 4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9.8 8.2c1.6.2 3.7 1.4 3.7 3.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
function IconAuditLog() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden="true">
      <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 5h7M4.5 7.5h7M4.5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11.5 12.5l1 1 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconMenu() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function IconExternal() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" aria-hidden="true">
      <path d="M6 2H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V8M8 1h5v5M12.5 1.5L7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Sidebar nav item ─────────────────────────────────────────

function NavItem({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  Icon: () => React.ReactElement
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 font-heading text-[0.8rem] font-medium transition-all duration-150 ${
        active
          ? 'bg-primary/15 text-primary'
          : 'text-gray-600 hover:bg-white/5 hover:text-gray-200'
      }`}
    >
      <span className={active ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}>
        <Icon />
      </span>
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
      )}
    </Link>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUserEmail(data.user?.email ?? null)
      if (!data.user) return
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('*, roles(name)')
        .eq('id', data.user.id)
        .single()
      const role = (adminRow as { roles?: { name?: string } } | null)?.roles?.name
      setIsSuperAdmin(role === 'super_admin')
    })
  }, [])

  const navGroups = isSuperAdmin ? [...NAV, SUPER_ADMIN_NAV] : NAV

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-white/5 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-primary" aria-hidden="true">
            <path d="M8 1a6 6 0 11-3 11.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M5 8.5l2 2 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-heading text-[0.72rem] font-semibold text-white leading-tight truncate">Bright Smile</p>
          <p className="font-body text-[0.6rem] text-gray-500 leading-tight">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Admin navigation">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <p className="mb-1.5 px-3 font-heading text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-gray-600">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  Icon={item.icon}
                  active={isActive(item.href)}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 px-3 py-4 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-heading text-[0.8rem] font-medium text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
        >
          <IconExternal />
          View Website
        </a>

        {/* User + sign out */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-white font-heading">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[0.7rem] font-medium text-gray-600 truncate">{userEmail ?? '—'}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/5 hover:text-gray-300 disabled:opacity-40"
            aria-label="Sign out"
          >
            <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M10 10l3-3-3-3M6 7h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const pageTitle = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? 'Admin'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 flex-col h-screen bg-[#0f1813] border-r border-white/[0.04]">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed left-0 top-0 z-40 h-full w-[220px] bg-[#0f1813] lg:hidden"
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Open navigation"
            >
              <IconMenu />
            </button>
            <h1 className="font-heading text-sm font-semibold text-gray-800">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              <span className="font-heading text-[0.6rem] font-semibold text-gray-500">Website Live</span>
            </div>

            {/* View site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-heading text-xs font-semibold text-gray-600 transition-colors hover:border-primary/30 hover:text-primary"
            >
              View Site
              <IconExternal />
            </a>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto" id="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
