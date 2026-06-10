'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS } from '@/lib/constants'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Bright Smile Dental Clinic — home"
      className={cn(
        'flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm transition-opacity hover:opacity-80',
        dark && 'bg-white/10 rounded-2xl px-3 py-2'
      )}
    >
      <Image
        src="/images/logo.jpg"
        alt="Bright Smile Dental Clinic"
        width={280}
        height={112}
        className="h-[3.75rem] w-auto object-contain lg:h-[5.25rem]"
        priority
      />
    </Link>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <motion.line
        x1="3" y1="6" x2="21" y2="6"
        animate={open ? { y1: 12, y2: 12, rotate: 45, originX: '50%', originY: '50%' } : {}}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.line
        x1="3" y1="12" x2="21" y2="12"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.line
        x1="3" y1="18" x2="21" y2="18"
        animate={open ? { y1: 12, y2: 12, rotate: -45, originX: '50%', originY: '50%' } : {}}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
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
          'fixed top-0 left-0 right-0 z-40 bg-white transition-all duration-300',
          scrolled
            ? 'border-b border-gray-100 shadow-[0_2px_24px_rgba(0,0,0,0.06)]'
            : 'border-b border-gray-100/60'
        )}
      >
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[6.5rem] lg:px-8">
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-9" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-heading text-[0.875rem] font-medium text-gray-600 transition-colors duration-200 hover:text-primary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm py-1"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-[1.5px] origin-left scale-x-0 bg-primary rounded-full transition-transform duration-250 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button href="/appointments" size="md">
              Book Appointment
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex lg:hidden items-center justify-center p-2 -mr-1 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
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
              className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-[340px] flex-col bg-dark lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <Logo dark />
                <button
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-lg p-2 text-white/50 hover:text-white transition-colors"
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
                      transition={{ delay: i * 0.06 + 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="flex items-center justify-between py-4 font-heading text-base font-medium text-white/75 hover:text-white transition-colors border-b border-white/8 focus-visible:outline-none focus-visible:text-white"
                      >
                        {link.label}
                        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-white/30" aria-hidden="true">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-white/10 p-6 space-y-3">
                <Button
                  href="/appointments"
                  variant="white"
                  size="lg"
                  className="w-full justify-center"
                  onClick={closeMenu}
                >
                  Book Appointment
                </Button>
                <p className="text-center font-body text-xs text-white/35">
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
