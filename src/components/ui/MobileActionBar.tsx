'use client'

import Link from 'next/link'

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <path d="M2 2.5h3.5L7 6l-1.5 1A8 8 0 009 9.5L10 8l3.5 1.5V13a.5.5 0 01-.5.5C6 13.5 2 9.5 2 3a.5.5 0 010-.5z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 7h12M5.5 2v2M10.5 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default function MobileActionBar({ phone }: { phone: string }) {
  const tel = phone.replace(/[^0-9+]/g, '')

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden" aria-label="Quick actions">
      <div
        className="flex divide-x divide-white/[0.07] border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
        style={{ background: '#0A1128' }}
      >
        {/* Call */}
        <a
          href={`tel:${tel}`}
          className="flex flex-1 items-center justify-center gap-2.5 py-4 font-heading text-sm font-semibold text-white/65 transition-colors hover:text-white active:bg-white/5"
          aria-label={`Call clinic: ${phone}`}
        >
          <PhoneIcon />
          <span>Call Now</span>
        </a>

        {/* Book */}
        <Link
          href="/appointments"
          className="flex flex-1 items-center justify-center gap-2.5 py-4 font-heading text-sm font-semibold transition-colors active:opacity-90"
          style={{ background: '#C5A059', color: '#0A1128' }}
          aria-label="Book an appointment"
        >
          <CalendarIcon />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* iOS safe area fill */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" style={{ background: '#C5A059' }} />
    </div>
  )
}
