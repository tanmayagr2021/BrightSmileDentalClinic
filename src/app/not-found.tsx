import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-tint px-4 text-center">
      <h1 className="font-display text-6xl text-dark">404</h1>
      <p className="mt-4 font-heading text-xl text-clinic-text">
        Page not found
      </p>
      <p className="mt-2 font-body text-clinic-text/60">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Return to Homepage
      </Link>
    </main>
  )
}
