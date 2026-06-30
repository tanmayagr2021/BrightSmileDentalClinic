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
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 1.2 }}
      className="relative flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      style={{ zIndex: 1 }}
    >
      {/* Breathing outer glow ring — pulses only when closed */}
      {!isOpen && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(197,160,89,0.22) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.55, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Gold ring border */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          border: '1.5px solid rgba(197,160,89,0.55)',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(197,160,89,0.18)'
            : '0 0 0 2px rgba(197,160,89,0.12), 0 8px 32px rgba(10,17,40,0.45)',
        }}
      />

      {/* Button face */}
      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #0e1530 0%, #0A1128 100%)'
            : 'linear-gradient(135deg, #0d1a30 0%, #0A1128 100%)',
          boxShadow: isOpen
            ? '0 4px 20px rgba(10,17,40,0.6)'
            : '0 8px 28px rgba(10,17,40,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
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
          className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-gold"
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Gold "B" monogram with AI sparkle */}
      <text
        x="6.5"
        y="17"
        fontFamily="Georgia, serif"
        fontWeight="400"
        fontSize="14"
        fill="#C5A059"
        letterSpacing="-0.5"
      >B</text>
      {/* Sparkle dots */}
      <circle cx="17.5" cy="6.5" r="1.2" fill="#C5A059" opacity="0.9" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="#fff" opacity="0.8" />
      <path
        d="M17.5 4.5v1M17.5 8.5v1M15.5 6.5h1M19.5 6.5h1M16.1 5.1l.7.7M18.7 7.7l.7.7M16.1 7.9l.7-.7M18.7 5.3l.7-.7"
        stroke="#C5A059"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="#C5A059"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
