'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import MedicalHistoryWizard from './MedicalHistoryWizard'
import type { ChatMessage as ChatMessageType, PanelView } from '@/types/ai'

interface BrightAIPanelProps {
  isOpen: boolean
  messages: ChatMessageType[]
  streamingContent: string
  input: string
  isStreaming: boolean
  sessionId: string
  onInputChange: (value: string) => void
  onSend: (directContent?: string) => void
  onClose: () => void
}

const INITIAL_QUICK_REPLIES = [
  'Book an appointment',
  'View our services',
  'Meet our doctors',
  'Clinic hours & location',
]

export default function BrightAIPanel({
  isOpen,
  messages,
  streamingContent,
  input,
  isStreaming,
  sessionId,
  onInputChange,
  onSend,
  onClose,
}: BrightAIPanelProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<Element | null>(null)
  const [view, setView] = useState<PanelView>('chat')
  const [showInitialQuickReplies, setShowInitialQuickReplies] = useState(true)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, view])

  // Escape-to-close, focus trap, and focus restoration to whatever opened the panel.
  useEffect(() => {
    if (!isOpen) return
    openerRef.current = document.activeElement

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled])'
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
    }
  }, [isOpen, onClose])

  // Hide initial quick replies once user sends their first message
  useEffect(() => {
    if (messages.some((m) => m.role === 'user')) {
      setShowInitialQuickReplies(false)
    }
  }, [messages])

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path)
      onClose()
    },
    [router, onClose]
  )

  const handleQuickReply = useCallback(
    (reply: string) => {
      onSend(reply)
    },
    [onSend]
  )

  const handleInitialQuickReply = useCallback(
    (reply: string) => {
      setShowInitialQuickReplies(false)
      onSend(reply)
    },
    [onSend]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleMedicalHistoryComplete = (name: string) => {
    setView('chat')
    // Inject a success message into chat
    const successMsg: ChatMessageType = {
      id: `mh-success-${Date.now()}`,
      role: 'assistant',
      content: `Thank you, ${name}! Your medical history has been submitted securely and our team will review it before your appointment. Is there anything else I can help you with?`,
      timestamp: Date.now(),
      quickReplies: ['Book appointment', 'View services', 'Contact us'],
    }
    // Fire custom event to add this message
    window.dispatchEvent(new CustomEvent('bright-ai:inject-message', { detail: successMsg }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <motion.div
            className="fixed inset-0 z-[9998] lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Bright AI chat assistant"
            className="fixed z-[9999] flex flex-col overflow-hidden"
            style={{
              // Desktop: bottom-right anchored, above the button
              bottom: 'calc(3.5rem + 1.5rem + 1rem)', // button height + gap + margin
              right: '1.5rem',
              width: 'min(400px, calc(100vw - 2rem))',
              height: 'min(560px, calc(100vh - 8rem))',
              // Glass morphism
              background: 'rgba(7, 9, 22, 0.91)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '20px',
              boxShadow:
                '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(201, 162, 75,0.08) inset, 0 1px 0 rgba(255,255,255,0.07) inset',
            }}
            initial={{ opacity: 0, scale: 0.94, y: 16, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          >
            {/* Gold accent top line */}
            <div
              className="h-[2px] w-full shrink-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #C9A24B 35%, #E7D3A1 65%, transparent 100%)',
                opacity: 0.7,
              }}
            />

            {/* Header */}
            <PanelHeader onClose={onClose} view={view} onBackToChat={() => setView('chat')} />

            {/* Content — chat or wizard */}
            <div className="relative flex-1 overflow-hidden">
              {view === 'chat' ? (
                <div className="flex h-full flex-col">
                  {/* Messages */}
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto py-3"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201, 162, 75,0.2) transparent' }}
                  >
                    {/* Welcome message */}
                    {messages.length === 0 && (
                      <WelcomeMessage />
                    )}

                    {messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        onNavigate={handleNavigate}
                        onQuickReply={handleQuickReply}
                        onStartMedicalHistory={() => setView('medical-history')}
                      />
                    ))}

                    {isStreaming && streamingContent.length === 0 && <TypingIndicator />}
                    {isStreaming && streamingContent.length > 0 && (
                      <StreamingBubble content={streamingContent} />
                    )}
                  </div>

                  {/* Initial quick replies — shown before first message */}
                  {showInitialQuickReplies && messages.length === 0 && (
                    <div className="border-t px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                      <p
                        className="mb-2 text-[10px] uppercase tracking-wider"
                        style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-poppins)' }}
                      >
                        Quick start
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {INITIAL_QUICK_REPLIES.map((r) => (
                          <button
                            key={r}
                            onClick={() => handleInitialQuickReply(r)}
                            className="rounded-full px-3 py-1.5 text-xs transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.13)',
                              color: 'rgba(255,255,255,0.72)',
                              fontFamily: 'var(--font-poppins)',
                              fontWeight: 500,
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div
                    className="border-t px-3 py-3"
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="flex items-end gap-2 rounded-2xl px-3 py-2"
                      style={{
                        background: 'rgba(255,255,255,0.055)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                          onInputChange(e.target.value)
                          e.target.style.height = 'auto'
                          e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything…"
                        rows={1}
                        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:opacity-30"
                        style={{
                          color: 'rgba(255,255,255,0.88)',
                          fontFamily: 'var(--font-inter)',
                          lineHeight: '1.5',
                          maxHeight: '96px',
                          minHeight: '24px',
                        }}
                        disabled={isStreaming}
                        aria-label="Message Bright AI"
                      />
                      <button
                        onClick={() => onSend()}
                        disabled={!input.trim() || isStreaming}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:opacity-80 active:scale-95 disabled:opacity-30"
                        style={{
                          background: 'linear-gradient(135deg, #C9A24B 0%, #A8823A 100%)',
                        }}
                        aria-label="Send message"
                      >
                        <SendIcon />
                      </button>
                    </div>
                    <p
                      className="mt-1.5 text-center text-[10px]"
                      style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)' }}
                    >
                      Bright AI · Digital Receptionist · Not a substitute for clinical advice
                    </p>
                  </div>
                </div>
              ) : (
                <MedicalHistoryWizard
                  sessionId={sessionId}
                  onComplete={handleMedicalHistoryComplete}
                  onCancel={() => setView('chat')}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PanelHeader({
  onClose,
  view,
  onBackToChat,
}: {
  onClose: () => void
  view: PanelView
  onBackToChat: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 border-b px-4 py-3"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Logo — matches the floating button */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(145deg, #FB923C 0%, #F97316 45%, #EA580C 100%)',
          boxShadow: '0 4px 12px rgba(249,115,22,0.4)',
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '15px',
            color: 'white',
            lineHeight: 1,
          }}
        >
          B
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-tight"
          style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-poppins)' }}
        >
          Bright AI
        </p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span
            className="text-[10px]"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)' }}
          >
            Online · Digital Receptionist
          </span>
        </div>
      </div>

      {/* Back button — only in wizard view */}
      {view === 'medical-history' && (
        <button
          onClick={onBackToChat}
          className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.68)', fontFamily: 'var(--font-poppins)' }}
          aria-label="Back to chat"
        >
          ← Chat
        </button>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.68)' }}
        aria-label="Close Bright AI"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M3 3l8 8M11 3l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}

function WelcomeMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="px-4 pb-2 pt-1"
    >
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-inter)' }}
        >
          {"Hello! I’m "}<strong style={{ color: '#C9A24B' }}>Bright AI</strong>{", your digital receptionist at Bright Smile Dental Clinic. I can help you find the right doctor, explore our services, book an appointment, or answer any questions about your dental care. How can I help you today?"}
        </p>
      </div>
      <span
        className="mt-1 block px-1 text-[10px]"
        style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-inter)' }}
      >
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14 2L2 7l5 2 2 5 5-12z"
        fill="#0E1B2E"
        stroke="#0E1B2E"
        strokeWidth="0.5"
      />
    </svg>
  )
}

function StreamingBubble({ content }: { content: string }) {
  // Strip action tokens — same as FormattedContent
  const cleaned = content
    .replace(/\[NAVIGATE:[^\]]+\]/g, '')
    .replace(/\[QUICKREPLIES:[^\]]+\]/g, '')
    .replace(/\[MEDICAL_HISTORY\]/g, '')
    .trim()

  return (
    <div className="flex items-end gap-2 px-4 py-0.5">
      {/* Avatar */}
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
      <div className="max-w-[82%]">
        <div
          className="rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed"
          style={{
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.88)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {cleaned || ' '}
          <span
            className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse align-middle"
            style={{ background: 'rgba(249,115,22,0.8)', borderRadius: '1px' }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
