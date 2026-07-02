import Header from './Header'
import Footer from './Footer'
import MobileActionBar from '@/components/ui/MobileActionBar'
import BrightAILoader from '@/components/ai/BrightAILoader'
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider'
import { CLINIC_CONTACT } from '@/lib/constants'
import { getContentBlocks } from '@/lib/content'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const content = await getContentBlocks()

  return (
    <SmoothScrollProvider>
      {/* Skip to main content — keyboard / screen reader navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-heading focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <Header content={content} />

      {/* pb-[4.5rem] on mobile reserves space above the fixed action bar */}
      <main id="main-content" className="min-h-screen pt-[4.75rem] pb-[4.5rem] lg:pb-0 lg:pt-[6.5rem]">
        {children}
      </main>

      <Footer />

      {/* Fixed mobile action bar — visible only on mobile */}
      <MobileActionBar phone={CLINIC_CONTACT.phone} phoneWhatsApp={CLINIC_CONTACT.phoneWhatsApp} />

      {/* Bright AI floating receptionist — lazy loaded, no SSR */}
      <BrightAILoader />
    </SmoothScrollProvider>
  )
}
