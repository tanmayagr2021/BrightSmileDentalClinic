'use client'

import { usePathname } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Login and Unauthorized render standalone — no sidebar
  if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return <AdminShell>{children}</AdminShell>
}
