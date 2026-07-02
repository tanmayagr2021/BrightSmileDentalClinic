'use client'

import { motion } from 'framer-motion'
import type { ChatMessage as ChatMessageType } from '@/types/ai'
import { trackEvent } from '@/lib/analytics'

interface ChatMessageProps {
  message: ChatMessageType
  onNavigate: (path: string) => void
  onQuickReply: (reply: string) => void
  onStartMedicalHistory: () => void
}

export default function ChatMessage({
  message,
  onNavigate,
  onQuickReply,
  onStartMedicalHistory,
}: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex items-end gap-2 px-4 py-0.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar — assistant only */}
      {!isUser && (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[10px] font-semibold"
          style={{
            background: 'linear-gradient(145deg, #FB923C 0%, #EA580C 100%)',
            color: 'white',
            fontFamily: 'Georgia, serif',
          }}
          aria-hidden="true"
        >
          B
        </span>
      )}

      <div className={`flex max-w-[82%] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-sm'
              : 'rounded-bl-sm'
          }`}
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #C9A24B 0%, #A8823A 100%)',
                  color: '#14202E',
                  fontFamily: 'var(--font-poppins)',
                  fontWeight: 500,
                }
              : {
                  background: 'rgba(255,255,255,0.055)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.88)',
                  fontFamily: 'var(--font-inter)',
                }
          }
        >
          <FormattedContent
            content={message.content}
            isUser={isUser}
          />
        </div>

        {/* Navigation CTA */}
        {!isUser && message.navigateTo && (
          <motion.button
            onClick={() => {
              if (message.navigateTo!.startsWith('/doctors/')) {
                trackEvent('Doctor Recommendation Used', { doctor: message.navigateTo })
              } else {
                trackEvent('Suggested Action Clicked', { label: 'Go there now', target: message.navigateTo })
              }
              onNavigate(message.navigateTo!)
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
            style={{
              background: 'rgba(201, 162, 75,0.12)',
              border: '1px solid rgba(201, 162, 75,0.32)',
              color: '#C9A24B',
              fontFamily: 'var(--font-poppins)',
            }}
          >
            <ArrowIcon />
            Go there now
          </motion.button>
        )}

        {/* Quick replies */}
        {!isUser && message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {message.quickReplies.map((reply) => (
              <motion.button
                key={reply}
                onClick={() => { trackEvent('Suggested Action Clicked', { label: reply }); onQuickReply(reply) }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-full px-3 py-1.5 text-xs transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.78)',
                  fontFamily: 'var(--font-poppins)',
                  fontWeight: 500,
                }}
              >
                {reply}
              </motion.button>
            ))}
          </div>
        )}

        {/* Medical history trigger */}
        {!isUser && message.isMedicalHistoryTrigger && (
          <motion.button
            onClick={onStartMedicalHistory}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 162, 75,0.15) 0%, rgba(201, 162, 75,0.08) 100%)',
              border: '1px solid rgba(201, 162, 75,0.4)',
              color: '#C9A24B',
              fontFamily: 'var(--font-poppins)',
            }}
          >
            <ClipboardIcon />
            Start Medical History Form
          </motion.button>
        )}

        {/* Timestamp */}
        <span
          className="px-1 text-[10px]"
          style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)' }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

function FormattedContent({
  content,
  isUser,
}: {
  content: string
  isUser: boolean
}) {
  if (isUser) return <span>{content}</span>

  // Strip action tokens from displayed text
  const cleaned = content
    .replace(/\[NAVIGATE:[^\]]+\]/g, '')
    .replace(/\[QUICKREPLIES:[^\]]+\]/g, '')
    .replace(/\[MEDICAL_HISTORY\]/g, '')
    .trim()

  // Basic markdown: **bold**, *italic*, bullet lists
  const lines = cleaned.split('\n').filter(Boolean)
  return (
    <>
      {lines.map((line, i) => {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*')
        const parsed = parseBold(isBullet ? line.slice(1).trim() : line)
        return (
          <p key={i} className={`${isBullet ? 'flex gap-1.5' : ''} ${i > 0 ? 'mt-1.5' : ''}`}>
            {isBullet && (
              <span style={{ color: '#C9A24B', flexShrink: 0, marginTop: '2px' }}>·</span>
            )}
            <span>{parsed}</span>
          </p>
        )
      })}
    </>
  )
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#C9A24B', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 3V2a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 7h5M4.5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
