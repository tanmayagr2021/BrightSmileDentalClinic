'use client'

import { motion } from 'framer-motion'

interface BrightAIButtonProps {
  isOpen: boolean
  onClick: () => void
  hasUnread: boolean
}

export default function BrightAIButton({ isOpen, onClick, hasUnread }: BrightAIButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={isOpen ? 'Close Bright AI' : 'Open Bright AI — Your Digital Receptionist'}
      aria-expanded={isOpen}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: isOpen ? 0 : [0, -8, 0],
      }}
      transition={
        isOpen
          ? { type: 'spring', stiffness: 300, damping: 24, delay: 1.2 }
          : {
              scale: { type: 'spring', stiffness: 300, damping: 24, delay: 1.2 },
              opacity: { delay: 1.2, duration: 0.4 },
              y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 },
            }
      }
      className="relative flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      style={{ zIndex: 1 }}
    >
      {/* Breathing outer glow ring — pulses only when closed */}
      {!isOpen && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 68%)',
          }}
          animate={{
            scale: [1, 1.7, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2.2,
          }}
        />
      )}

      {/* Outer glow halo */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: isOpen
            ? '0 0 0 2px rgba(249,115,22,0.4), 0 8px 24px rgba(249,115,22,0.25)'
            : '0 0 0 2px rgba(249,115,22,0.35), 0 8px 32px rgba(249,115,22,0.35), 0 20px 60px rgba(234,88,12,0.2)',
        }}
      />

      {/* Button face — warm amber/orange with glass morphism */}
      <span
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full transition-all duration-300"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)'
            : 'linear-gradient(145deg, #FB923C 0%, #F97316 45%, #EA580C 100%)',
          boxShadow: isOpen
            ? '0 4px 16px rgba(234,88,12,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '0 8px 32px rgba(249,115,22,0.5), 0 2px 8px rgba(234,88,12,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        {/* Glass gloss overlay */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)' }}
          aria-hidden="true"
        />

        {/* Animated icon: sparkle AI → X */}
        <motion.span
          className="absolute"
          animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.6 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <SparkleIcon />
        </motion.span>
        <motion.span
          className="absolute"
          animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          <CloseIcon />
        </motion.span>
      </span>

      {/* Unread indicator */}
      {hasUnread && !isOpen && (
        <motion.span
          className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        />
      )}
    </motion.button>
  )
}

function SparkleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      {/* White "B" monogram */}
      <text
        x="7"
        y="18"
        fontFamily="Georgia, 'DM Serif Display', serif"
        fontWeight="400"
        fontSize="15"
        fill="white"
        opacity="0.95"
        letterSpacing="-0.5"
      >B</text>
      {/* AI sparkle constellation */}
      <circle cx="19.5" cy="7" r="1.4" fill="white" opacity="0.9" />
      <circle cx="19.5" cy="7" r="0.55" fill="rgba(255,255,255,0.95)" />
      <path
        d="M19.5 4.5v1.2M19.5 8.3v1.2M17 7h1.2M21.8 7h1.2M17.7 5.2l.85.85M20.95 8.45l.85.85M17.7 8.8l.85-.85M20.95 5.55l.85-.85"
        stroke="white"
        strokeWidth="0.95"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
