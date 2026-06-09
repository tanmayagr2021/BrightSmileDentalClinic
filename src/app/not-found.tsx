import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import Container from '@/components/ui/Container'

export default function NotFound() {
  return (
    <PublicLayout>
      <Container size="sm">
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <p className="eyebrow mb-4">404</p>
          <h1 className="font-display text-4xl text-dark md:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 font-body text-base text-gray-500 max-w-sm">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98]"
          >
            Return to Homepage
          </Link>
        </div>
      </Container>
    </PublicLayout>
  )
}
