import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'View our dental clinic gallery — our facilities, team, and patient transformations.',
}

const placeholderItems = [
  { label: 'Our Clinic', color: '#F0F7F2' },
  { label: 'Treatment Rooms', color: '#E8F5ED' },
  { label: 'Reception', color: '#F0F7F2' },
  { label: 'Equipment', color: '#E8F5ED' },
  { label: 'Our Team', color: '#F0F7F2' },
  { label: 'Patient Smiles', color: '#E8F5ED' },
]

export default function GalleryPage() {
  return (
    <div className="bg-white">
      <div className="bg-tint border-b border-gray-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow mb-3 inline-flex items-center gap-2">
            <span className="inline-block h-px w-5 bg-primary" />
            Our Space
          </span>
          <h1 className="font-display text-4xl text-dark sm:text-5xl tracking-display">Gallery</h1>
          <p className="mt-4 max-w-xl font-body text-base text-gray-500 leading-relaxed">
            A look inside our modern clinic and the smiles we create every day.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-tint border border-dashed border-primary/30 p-6 text-center">
          <p className="font-body text-sm text-gray-500">
            Photos are being collected and will be published soon.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {placeholderItems.map((item, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: item.color }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-primary/30" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" fillOpacity="0.3" />
                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-heading text-xs text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="font-body text-sm text-primary hover:underline underline-offset-2">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
