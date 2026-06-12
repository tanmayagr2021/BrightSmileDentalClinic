'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Bright Smile Dental Clinic — home"
      className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm transition-opacity hover:opacity-85"
    >
      <Image
        src="/images/logo.jpg"
        alt="Bright Smile Dental Clinic"
        width={280}
        height={112}
        className={cn(
          'w-auto object-contain transition-all duration-300',
          inverted
            ? 'h-[3.25rem] rounded-xl bg-white/90 px-2 py-1 lg:h-[4.75rem]'
            : 'h-[4.5rem] lg:h-[6.5rem]'
        )}
        priority
      />
    </Link>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
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
    const onScroll = () => setScrolled(window.scrollY > 60)
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
            ? 'bg-transparent border-b border-white/0'
            : 'bg-white/95 border-b border-gray-100/70 backdrop-blur-xl shadow-[0_2px_32px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[6.5rem] lg:px-8">
          <Logo inverted={isTransparent} />

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative font-heading text-[0.875rem] font-medium transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm py-1',
                  isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-gray-600 hover:text-primary'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute inset-x-0 -bottom-0.5 h-[1.5px] origin-left scale-x-0 rounded-full transition-transform duration-250 group-hover:scale-x-100',
                    isTransparent ? 'bg-white/70' : 'bg-primary'
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
                'inline-flex items-center gap-2 rounded-xl px-6 py-3 font-heading text-sm font-semibold transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isTransparent
                  ? 'bg-white text-dark shadow-lg shadow-black/15 hover:bg-white/90'
                  : 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark hover:shadow-primary/35'
              )}
            >
              Book Appointment
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              'flex lg:hidden items-center justify-center p-2 -mr-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
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
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm lg:hidden"
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
              style={{ background: 'linear-gradient(160deg, #0A1F14 0%, #1A3D2B 100%)' }}
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                <Logo inverted />
                <button
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-xl p-2 text-white/40 hover:text-white hover:bg-white/8 transition-colors"
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
                        className="flex items-center justify-between py-4 font-heading text-base font-medium text-white/70 hover:text-white transition-colors border-b border-white/6 focus-visible:outline-none focus-visible:text-white"
                      >
                        {link.label}
                        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-white/25" aria-hidden="true">
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
                  className="flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.97]"
                >
                  Book Appointment
                </Link>
                <p className="text-center font-body text-xs text-white/30">
                  Nagpokhari, Naxal, Kathmandu
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
