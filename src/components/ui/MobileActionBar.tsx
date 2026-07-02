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

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function MobileActionBar({ phone, phoneWhatsApp }: { phone: string; phoneWhatsApp?: string }) {
  const tel = phone.replace(/[^0-9+]/g, '')
  const whatsappDigits = phoneWhatsApp?.replace(/[^0-9]/g, '')

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden" aria-label="Quick actions">
      <div
        className="flex divide-x divide-white/[0.07] border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
        style={{ background: '#0A1128' }}
      >
        {/* Call */}
        <a
          href={`tel:${tel}`}
          className="flex flex-1 items-center justify-center gap-2 py-4 font-heading text-sm font-semibold text-white/65 transition-colors hover:text-white active:bg-white/5"
          aria-label={`Call clinic: ${phone}`}
        >
          <PhoneIcon />
          <span>Call</span>
        </a>

        {/* WhatsApp */}
        {whatsappDigits && (
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 py-4 font-heading text-sm font-semibold text-white/65 transition-colors hover:text-white active:bg-white/5"
            aria-label="Message clinic on WhatsApp"
          >
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </a>
        )}

        {/* Book */}
        <Link
          href="/appointments"
          className="flex flex-1 items-center justify-center gap-2 py-4 font-heading text-sm font-semibold transition-colors active:opacity-90"
          style={{ background: '#C5A059', color: '#0A1128' }}
          aria-label="Book an appointment"
        >
          <CalendarIcon />
          <span>Book</span>
        </Link>
      </div>

      {/* iOS safe area fill */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" style={{ background: '#C5A059' }} />
    </div>
  )
}
