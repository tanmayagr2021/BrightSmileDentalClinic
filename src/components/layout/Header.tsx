'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS, CLINIC_NAME_SHORT, CLINIC_SUBTITLE, CLINIC_TAGLINE } from '@/lib/constants'
import { cn } from '@/lib/utils'

function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Bright Smile Dental Clinic — home"
      className="flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm group"
    >
      {/* Logo image */}
      <div className={cn(
        'flex-shrink-0 overflow-hidden transition-all duration-500 group-hover:opacity-90',
        inverted
          ? 'rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.14)]'
          : ''
      )}>
        <Image
          src="/images/logo.jpg"
          alt="Bright Smile Dental Clinic"
          width={280}
          height={112}
          className={cn(
            'w-auto object-contain transition-all duration-500',
            inverted
              ? 'h-[2.75rem] lg:h-[3.5rem] bg-white px-2.5 py-1.5'
              : 'h-[1.75rem] lg:h-[2.25rem]'
          )}
          priority
        />
      </div>

      {/* Brand identity text block — desktop, transparent/hero state only */}
      {inverted && (
        <div className="hidden lg:flex flex-col leading-none gap-[0.3rem] pl-4 border-l border-white/15">
          <span className="font-display leading-none tracking-[-0.018em] text-white text-[1.15rem]">
            {CLINIC_NAME_SHORT}
          </span>
          <span className="font-heading font-semibold leading-none tracking-[0.008em] text-white/82 text-[0.7rem]">
            {CLINIC_SUBTITLE}
          </span>
          <span className="font-heading font-medium uppercase leading-none tracking-[0.16em] text-white/55 text-[0.4rem]">
            {CLINIC_TAGLINE}
          </span>
        </div>
      )}
    </Link>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <motion.line x1="3" y1="6" x2="21" y2="6" animate={open ? { y1: 12, y2: 12, rotate: 45, originX: '50%', originY: '50%' } : {}} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} />
      <motion.line x1="3" y1="12" x2="21" y2="12" animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.15 }} />
      <motion.line x1="3" y1="18" x2="21" y2="18" animate={open ? { y1: 12, y2: 12, rotate: -45, originX: '50%', originY: '50%' } : {}} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isTransparent = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
          isTransparent
            ? 'bg-transparent border-b border-transparent'
            : 'bg-white/97 border-b border-gray-100/80 backdrop-blur-2xl shadow-[0_1px_40px_rgba(0,0,0,0.07)]'
        )}
      >
        <div className={cn(
            'mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-500',
            isTransparent ? 'h-[4.75rem] lg:h-[6.5rem]' : 'h-[3.25rem] lg:h-[4rem]'
          )}>
          <BrandMark inverted={isTransparent} />

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative font-heading text-[0.82rem] font-medium transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm py-1 tracking-[0.01em]',
                  isTransparent
                    ? 'text-white/75 hover:text-white'
                    : 'text-gray-500 hover:text-dark'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 rounded-full transition-transform duration-250 group-hover:scale-x-100',
                    isTransparent ? 'bg-white/60' : 'bg-primary'
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link
              href="/appointments"
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-6 py-3 font-heading text-[0.82rem] font-semibold transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isTransparent
                  ? 'bg-white text-dark shadow-[0_4px_20px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.8)_inset] hover:bg-white/95 hover:shadow-[0_6px_28px_rgba(0,0,0,0.3)]'
                  : 'bg-gold text-[#0A1128] shadow-button-gold hover:bg-gold-dark hover:shadow-glow-gold'
              )}
            >
              Book Appointment
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 opacity-80" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              'flex lg:hidden items-center justify-center p-2 -mr-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-dark hover:bg-gray-50'
            )}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={closeMenu}
              aria-hidden="true"
            />

            <motion.div
              key="panel"
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-[340px] flex-col lg:hidden"
              style={{ background: '#0A1128' }}
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <BrandMark inverted />
                <button
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-xl p-2 text-white/65 hover:text-white hover:bg-white/8 transition-colors"
                  aria-label="Close menu"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Mobile navigation links">
                <ul className="space-y-0.5" role="list">
                  {NAV_LINKS.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="flex items-center justify-between py-4 font-heading text-base font-medium text-white/85 hover:text-white transition-colors border-b border-white/6 focus-visible:outline-none focus-visible:text-white"
                      >
                        {link.label}
                        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-white/55" aria-hidden="true">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-white/8 p-6 space-y-3">
                <Link
                  href="/appointments"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-xl bg-gold px-6 py-3.5 font-heading text-sm font-semibold text-[#0A1128] shadow-button-gold transition-all hover:bg-gold-dark active:scale-[0.97]"
                >
                  Book Appointment
                </Link>
                <p className="text-center font-body text-xs text-white/65">
                  Nagpokhari, Naxal · Kathmandu, Nepal
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
