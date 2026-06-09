'use client'

import Link from 'next/link'
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
      className="group flex flex-col leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
    >
      <span
        className={cn(
          'font-display text-[1.35rem] tracking-tight transition-opacity group-hover:opacity-80',
          dark ? 'text-white' : 'text-dark'
        )}
      >
        Bright Smile
      </span>
      <span
        className={cn(
          'font-heading text-[0.62rem] font-medium tracking-[0.2em] uppercase transition-opacity group-hover:opacity-80',
          dark ? 'text-white/50' : 'text-gray-400'
        )}
      >
        Dental Clinic
      </span>
    </Link>
  )
}

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="2" y1="5.5" x2="20" y2="5.5" />
      <line x1="2" y1="11" x2="20" y2="11" />
      <line x1="2" y1="16.5" x2="20" y2="16.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="3" x2="19" y2="19" />
      <line x1="19" y1="3" x2="3" y2="19" />
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 bg-white transition-all duration-300',
          scrolled
            ? 'border-b border-gray-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]'
            : 'border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Logo />

          {/* Desktop navigation */}
          <nav
            className="hidden lg:flex items-center gap-7"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-heading text-[0.875rem] font-medium text-gray-600 transition-colors duration-200 hover:text-primary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm py-1"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Button href="/appointments" size="md">
              Book Appointment
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex lg:hidden items-center justify-center p-2 -mr-1 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-[320px] flex-col bg-dark lg:hidden"
              aria-label="Mobile navigation"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <Logo dark />
                <button
                  onClick={closeMenu}
                  className="flex items-center justify-center p-2 -mr-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label="Close navigation menu"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile navigation links">
                <ul className="space-y-1" role="list">
                  {NAV_LINKS.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.1, duration: 0.3, ease: 'easeOut' }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="flex items-center py-3 font-heading text-base font-medium text-white/80 hover:text-white transition-colors border-b border-white/8 focus-visible:outline-none focus-visible:text-white"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* CTA */}
              <div className="border-t border-white/10 p-6">
                <Button
                  href="/appointments"
                  variant="white"
                  size="lg"
                  className="w-full justify-center"
                  onClick={closeMenu}
                >
                  Book Appointment
                </Button>
                <p className="mt-4 text-center font-body text-xs text-white/40">
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
