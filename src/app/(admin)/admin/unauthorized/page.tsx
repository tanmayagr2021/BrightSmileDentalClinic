import Link from 'next/link'

export const metadata = { title: 'Unauthorized' }

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-red-500" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-heading text-xl font-semibold text-gray-900">Unauthorized</h1>
        <p className="mt-2 font-body text-sm text-gray-500">
          You don&apos;t have permission to view this page. This area is restricted to Super Admin accounts.
        </p>
        <Link
          href="/admin/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-[#14202E] transition-all hover:bg-primary-dark"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
