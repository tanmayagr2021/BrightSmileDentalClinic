'use client'

import { useEffect } from 'react'

// Rendered only if the root layout itself throws — must define its own
// <html>/<body> and can't rely on globals.css or Tailwind having loaded,
// so this stays self-contained with inline styles.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1rem',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: '#f9fafb',
          color: '#1a3d2b',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: '1rem', color: '#6b7280', maxWidth: '28rem' }}>
          We&apos;re sorry — an unexpected error occurred. Please try again, or call us directly
          if the problem continues.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '2rem',
            borderRadius: '0.5rem',
            background: '#4A9B6F',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
