import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Dental health tips, news and updates from Bright Smile Dental Clinic, Kathmandu.',
}

export default function BlogPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Dental Health
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">Blog</h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500">
            Tips, guides, and updates from our dental team.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-tint p-12 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-dark tracking-display">Articles Coming Soon</h2>
          <p className="mt-3 font-body text-sm text-gray-500">
            Our team is writing helpful dental health guides. Check back soon.
          </p>
          <Link href="/" className="mt-6 inline-block font-body text-sm text-primary hover:underline underline-offset-2">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
