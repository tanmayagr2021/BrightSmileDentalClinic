'use client'

import { motion } from 'framer-motion'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      {/* Avatar */}
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
        style={{
          background: 'linear-gradient(135deg, #0A1128 0%, #1a2540 100%)',
          border: '1px solid rgba(197,160,89,0.35)',
          color: '#C5A059',
          fontFamily: 'Georgia, serif',
        }}
        aria-hidden="true"
      >
        B
      </span>

      {/* Bubble */}
      <div
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        aria-label="Bright AI is typing"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: '#C5A059' }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
