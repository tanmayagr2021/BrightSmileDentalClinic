import Link from 'next/link'
import {
  CLINIC_NAME_SHORT,
  CLINIC_TAGLINE,
  CLINIC_CONTACT,
  FOOTER_QUICK_LINKS,
  OPENING_HOURS,
} from '@/lib/constants'
import Container from '@/components/ui/Container'

function FooterLogo() {
  return (
    <Link
      href="/"
      aria-label="Bright Smile Dental Clinic — home"
      className="group inline-flex flex-col leading-none"
    >
      <span className="font-display text-2xl tracking-tight text-white transition-opacity group-hover:opacity-80">
        {CLINIC_NAME_SHORT}
      </span>
      <span className="font-heading text-[0.6rem] font-medium tracking-[0.22em] uppercase text-white/40 transition-opacity group-hover:opacity-80">
        Dental Clinic
      </span>
    </Link>
  )
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-white/40 mb-4">
      {children}
    </h3>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="font-body text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-dark" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <Container>
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterLogo />
            <p className="mt-5 font-body text-sm leading-relaxed text-white/50 max-w-xs">
              {CLINIC_TAGLINE}. Providing trusted dental care in the heart of
              Kathmandu since over a decade.
            </p>

            {/* Social links */}
            {(CLINIC_CONTACT.facebook || CLINIC_CONTACT.instagram) && (
              <div className="mt-6 flex items-center gap-3">
                {CLINIC_CONTACT.facebook && (
                  <a
                    href={CLINIC_CONTACT.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bright Smile Dental Clinic on Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/50 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {CLINIC_CONTACT.instagram && (
                  <a
                    href={CLINIC_CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bright Smile Dental Clinic on Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/50 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <InstagramIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-2.5">
              {FOOTER_QUICK_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <address className="not-italic space-y-3">
              <p className="font-body text-sm text-white/60 leading-relaxed">
                {CLINIC_CONTACT.addressFull}
              </p>
              <a
                href={`tel:${CLINIC_CONTACT.phone.replace(/\s/g, '')}`}
                className="block font-body text-sm text-white/60 transition-colors hover:text-white"
              >
                {CLINIC_CONTACT.phone}
              </a>
              <a
                href={`https://wa.me/${CLINIC_CONTACT.phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-body text-sm text-white/60 transition-colors hover:text-white"
              >
                WhatsApp: {CLINIC_CONTACT.phoneWhatsApp}
              </a>
              <a
                href={`mailto:${CLINIC_CONTACT.email}`}
                className="block font-body text-sm text-white/60 transition-colors hover:text-white"
              >
                {CLINIC_CONTACT.email}
              </a>
            </address>
          </div>

          {/* Col 4 — Hours */}
          <div>
            <FooterHeading>Opening Hours</FooterHeading>
            <ul className="space-y-3">
              {OPENING_HOURS.map((item) => (
                <li key={item.days}>
                  <p className="font-body text-sm font-medium text-white/80">
                    {item.days}
                  </p>
                  <p className="font-body text-sm text-white/50">{item.hours}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/appointments"
                className="inline-flex items-center gap-1.5 font-heading text-sm font-semibold text-primary hover:text-primary-light transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Book an appointment
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="font-body text-xs text-white/30 text-center sm:text-left">
            &copy; {year} Bright Smile Dental Clinic Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="font-body text-xs text-white/30 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:text-white/60"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
