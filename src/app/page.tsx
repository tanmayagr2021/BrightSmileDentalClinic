import PublicLayout from '@/components/layout/PublicLayout'
import Container from '@/components/ui/Container'

// Homepage sections are built in Phase D.
// This placeholder confirms the layout, header, footer, and design system are working.
export default function HomePage() {
  return (
    <PublicLayout>
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            Nagpokhari, Naxal — Kathmandu, Nepal
          </p>
          <h1 className="font-display text-5xl text-dark md:text-6xl lg:text-7xl">
            Bright Smile
            <br />
            Dental Clinic
          </h1>
          <p className="mt-6 font-body text-lg text-gray-500 max-w-md">
            Creating Smiles, Changing Lives
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="/appointments"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 font-heading text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              Book an Appointment
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-7 py-3.5 font-heading text-sm font-semibold text-gray-700 transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
            >
              View Services
            </a>
          </div>
          <p className="mt-16 font-body text-xs text-gray-300">
            Homepage sections — Phase D
          </p>
        </div>
      </Container>
    </PublicLayout>
  )
}
