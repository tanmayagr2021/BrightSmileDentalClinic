'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import BrightAIButton from './BrightAIButton'
import BrightAIPanel from './BrightAIPanel'
import type { ChatMessage, ChatState } from '@/types/ai'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

// ── State ─────────────────────────────────────────────────────

type State = {
  isOpen: boolean
  messages: ChatMessage[]
  input: string
  chatState: ChatState
  hasUnread: boolean
  sessionId: string
  streamingContent: string
}

type Action =
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'ADD_USER_MSG'; payload: ChatMessage }
  | { type: 'START_STREAMING' }
  | { type: 'APPEND_STREAM'; payload: string }
  | { type: 'FINISH_STREAM'; payload: ChatMessage }
  | { type: 'SET_ERROR' }
  | { type: 'INJECT_MESSAGE'; payload: ChatMessage }

function createSessionId() {
  return `bs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function parseAssistantMessage(raw: string): Omit<ChatMessage, 'id' | 'role' | 'timestamp'> {
  const navigateMatch = raw.match(/\[NAVIGATE:([^\]]+)\]/)
  const quickRepliesMatch = raw.match(/\[QUICKREPLIES:([^\]]+)\]/)
  const hasMedicalHistory = raw.includes('[MEDICAL_HISTORY]')

  return {
    content: raw,
    navigateTo: navigateMatch?.[1],
    quickReplies: quickRepliesMatch?.[1].split(',').map((s) => s.trim()),
    isMedicalHistoryTrigger: hasMedicalHistory,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen, hasUnread: false }
    case 'OPEN':
      return { ...state, isOpen: true, hasUnread: false }
    case 'CLOSE':
      return { ...state, isOpen: false }
    case 'SET_INPUT':
      return { ...state, input: action.payload }
    case 'ADD_USER_MSG':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        input: '',
        chatState: 'streaming',
        streamingContent: '',
      }
    case 'START_STREAMING':
      return { ...state, chatState: 'streaming', streamingContent: '' }
    case 'APPEND_STREAM':
      return { ...state, streamingContent: state.streamingContent + action.payload }
    case 'FINISH_STREAM':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        chatState: 'idle',
        streamingContent: '',
        hasUnread: !state.isOpen,
      }
    case 'SET_ERROR':
      return { ...state, chatState: 'error', streamingContent: '' }
    case 'INJECT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        hasUnread: !state.isOpen,
      }
    default:
      return state
  }
}

const initialState: State = {
  isOpen: false,
  messages: [],
  input: '',
  chatState: 'idle',
  hasUnread: false,
  sessionId: '',
  streamingContent: '',
}

// ── Component ──────────────────────────────────────────────────

export default function BrightAI() {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    sessionId: createSessionId(),
  })

  const abortRef = useRef<AbortController | null>(null)

  // Listen for injected messages (e.g., from MedicalHistoryWizard)
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<ChatMessage>).detail
      dispatch({ type: 'INJECT_MESSAGE', payload: msg })
    }
    window.addEventListener('bright-ai:inject-message', handler)
    return () => window.removeEventListener('bright-ai:inject-message', handler)
  }, [])

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isOpen) dispatch({ type: 'CLOSE' })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.isOpen])

  const sendMessage = useCallback(async (directContent?: string) => {
    const content = (directContent !== undefined ? directContent : state.input).trim()
    if (!content || state.chatState === 'streaming') return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    dispatch({ type: 'ADD_USER_MSG', payload: userMsg })

    // Build conversation history for API
    const history = [
      ...state.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ]

    // Abort any prior stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, sessionId: state.sessionId }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to connect to Bright AI')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const dataStr = line.slice(6).trim()
          if (dataStr === '[DONE]') break
          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              accumulated += parsed.text
              dispatch({ type: 'APPEND_STREAM', payload: parsed.text })
            }
          } catch {
            // Non-JSON lines can be skipped
          }
        }
      }

      const parsed = parseAssistantMessage(accumulated)
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        timestamp: Date.now(),
        ...parsed,
      }

      dispatch({ type: 'FINISH_STREAM', payload: assistantMsg })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I couldn't connect right now. Please try again or call us at +977-1-4419594.",
        timestamp: Date.now(),
        quickReplies: ['Try again', 'Call the clinic'],
      }
      dispatch({ type: 'FINISH_STREAM', payload: errorMsg })
    }
  }, [state.input, state.chatState, state.messages, state.sessionId])

  return (
    <div
      className={cn(
        'fixed z-[9997]',
        // Desktop: bottom-right
        'bottom-6 right-6',
        // Mobile: above the action bar (4.5rem) + gap
        'max-lg:bottom-[calc(4.5rem+0.75rem)]'
      )}
      aria-label="Bright AI Digital Receptionist"
    >
      <BrightAIPanel
        isOpen={state.isOpen}
        messages={state.messages}
        streamingContent={state.streamingContent}
        input={state.input}
        isStreaming={state.chatState === 'streaming'}
        sessionId={state.sessionId}
        onInputChange={(v) => dispatch({ type: 'SET_INPUT', payload: v })}
        onSend={sendMessage}
        onClose={() => dispatch({ type: 'CLOSE' })}
      />

      <BrightAIButton
        isOpen={state.isOpen}
        onClick={() => {
          if (!state.isOpen) trackEvent('AI Opened')
          dispatch({ type: 'TOGGLE' })
        }}
        hasUnread={state.hasUnread}
      />
    </div>
  )
}
