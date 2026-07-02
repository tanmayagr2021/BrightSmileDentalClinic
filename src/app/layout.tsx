import type { Metadata } from 'next'
import { DM_Serif_Display, Poppins, Inter } from 'next/font/google'
import { MotionConfig } from 'framer-motion'
import { buildClinicSchema } from '@/lib/schema'
import Analytics from '@/components/analytics/Analytics'
import './globals.css'

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Bright Smile Dental Clinic | Dentist in Kathmandu, Nepal',
    template: '%s | Bright Smile Dental Clinic',
  },
  description:
    'NMC-registered dental clinic in Nagpokhari, Naxal, Kathmandu. 6 experienced dentists offering implants, orthodontics, root canal, cosmetic dentistry & more. Book your appointment today.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    siteName: 'Bright Smile Dental Clinic',
    locale: 'en_US',
    title: 'Bright Smile Dental Clinic | Dentist in Kathmandu, Nepal',
    description:
      'NMC-registered dental clinic in Nagpokhari, Naxal, Kathmandu. 6 experienced dentists offering implants, orthodontics, root canal, cosmetic dentistry & more.',
    images: [{ url: '/images/logo.jpg', width: 280, height: 112, alt: 'Bright Smile Dental Clinic' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bright Smile Dental Clinic | Dentist in Kathmandu, Nepal',
    description:
      'NMC-registered dental clinic in Nagpokhari, Naxal, Kathmandu. 6 experienced dentists offering implants, orthodontics, root canal, cosmetic dentistry & more.',
    images: ['/images/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${poppins.variable} ${inter.variable}`}
    >
      <body className="font-body text-clinic-text antialiased">
        {/* Sitewide Dentist/MedicalBusiness structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildClinicSchema()) }}
        />
        {/* Auto-disables transform/scale/rotate animations (keeps fades) when
            the OS-level reduced-motion preference is on — covers every
            Framer Motion animation site-wide, since Framer drives its own
            animation engine and never touches CSS `transition`. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Analytics />
      </body>
    </html>
  )
}
