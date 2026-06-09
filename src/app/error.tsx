'use client'

import { useEffect } from 'react'

export default function Error({
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-tint px-4 text-center">
      <h1 className="font-display text-4xl text-dark">Something went wrong</h1>
      <p className="mt-4 font-body text-clinic-text/60">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Try again
      </button>
    </main>
  )
}
